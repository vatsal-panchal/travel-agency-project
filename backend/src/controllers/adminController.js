import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAdminStats = catchAsync(async (req, res, next) => {
  const [totalUsers, activeUsers, suspendedUsers, totalPackages, totalBookings] = await Promise.all([
    User.countDocuments(),
    User.countDocuments({ isBlocked: false }),
    User.countDocuments({ isBlocked: true }),
    Package.countDocuments(),
    Booking.countDocuments(),
  ]);

  // Bookings grouped by status
  const bookingsByStatusAgg = await Booking.aggregate([
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  const bookingsByStatus = { pending: 0, confirmed: 0, cancelled: 0 };
  bookingsByStatusAgg.forEach((item) => {
    bookingsByStatus[item._id] = item.count;
  });

  // Total revenue from successful payments
  const revenueAgg = await Payment.aggregate([
    { $match: { status: 'success' } },
    { $group: { _id: null, totalRevenue: { $sum: '$amount' } } },
  ]);
  const totalRevenue = revenueAgg[0]?.totalRevenue || 0;

  // Monthly revenue for the last 6 calendar months (including zero months)
  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const monthlyAgg = await Payment.aggregate([
    {
      $match: {
        status: 'success',
        createdAt: { $gte: sixMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        },
        revenue: { $sum: '$amount' },
        transactionsCount: { $sum: 1 },
      },
    },
  ]);

  const monthlyMap = new Map();
  monthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    monthlyMap.set(key, {
      revenue: item.revenue,
      transactionsCount: item.transactionsCount,
    });
  });

  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    const monthData = monthlyMap.get(key);
    monthlyRevenue.push({
      month: key,
      revenue: monthData?.revenue || 0,
      transactionsCount: monthData?.transactionsCount || 0,
    });
  }

  // Top 5 booked packages
  const topPackagesAgg = await Booking.aggregate([
    { $match: { status: 'confirmed' } },
    { $group: { _id: '$package', totalBookings: { $sum: 1 }, totalSeatsBooked: { $sum: '$travelers' } } },
    { $sort: { totalBookings: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'packages',
        localField: '_id',
        foreignField: '_id',
        as: 'packageDetails',
      },
    },
    { $unwind: '$packageDetails' },
    {
      $project: {
        _id: 1,
        title: '$packageDetails.title',
        destination: '$packageDetails.destination',
        price: '$packageDetails.price',
        totalBookings: 1,
        totalSeatsBooked: 1,
      },
    },
  ]);

  // 5 most recent bookings
  const recentBookings = await Booking.find()
    .sort({ createdAt: -1 })
    .limit(5)
    .populate('user', 'name email')
    .populate('package', 'title destination');

  res.status(200).json({
    success: true,
    message: 'Admin dashboard statistics retrieved successfully',
    data: {
      totalUsers,
      activeUsers,
      suspendedUsers,
      totalPackages,
      totalBookings,
      bookingsByStatus,
      totalRevenue,
      monthlyRevenue,
      topPackages: topPackagesAgg,
      recentBookings,
    },
  });
});
export const getUsers = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, search, status } = req.query;
  const query = {};

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }
  if (status === 'active') query.isBlocked = false;
  if (status === 'suspended') query.isBlocked = true;

  const total = await User.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let users = [];
  if (skip < total) {
    users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'Users retrieved successfully',
    data: {
      users,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
export const toggleBlockUser = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid user ID format', null, 'INVALID_ID');
  }

  if (req.user._id.toString() === id) {
    throw new ApiError(400, 'You cannot block your own account', null, 'CANNOT_BLOCK_SELF');
  }

  const targetUser = await User.findById(id);
  if (!targetUser) {
    throw new ApiError(404, 'User not found', null, 'NOT_FOUND');
  }

  if (targetUser.role === 'admin') {
    throw new ApiError(400, 'Cannot block administrator accounts', null, 'CANNOT_BLOCK_ADMIN');
  }

  targetUser.isBlocked = !targetUser.isBlocked;
  await targetUser.save();

  // If user was just blocked, invalidate all their active refresh tokens immediately
  if (targetUser.isBlocked) {
    await RefreshToken.updateMany({ userId: targetUser._id }, { revoked: true });
  }

  res.status(200).json({
    success: true,
    message: `User ${targetUser.isBlocked ? 'blocked' : 'unblocked'} successfully`,
    data: {
      userId: targetUser._id,
      isBlocked: targetUser.isBlocked,
    },
  });
});

export const getAdminBookings = catchAsync(async (req, res, next) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
  const status = ['pending', 'confirmed', 'cancelled'].includes(req.query.status)
    ? req.query.status
    : undefined;
  const search = typeof req.query.search === 'string' ? req.query.search.trim().slice(0, 100) : '';
  const query = {};

  if (status) {
    query.status = status;
  }

  if (search) {
    const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    const [userIds, packageIds] = await Promise.all([
      User.find({ $or: [{ name: searchRegex }, { email: searchRegex }] }).distinct('_id'),
      Package.find({ $or: [{ title: searchRegex }, { destination: searchRegex }] }).distinct('_id'),
    ]);
    const matchingRecords = [
      { user: { $in: userIds } },
      { package: { $in: packageIds } },
    ];
    if (mongoose.Types.ObjectId.isValid(search)) {
      matchingRecords.push({ _id: search });
    }
    query.$or = matchingRecords;
  }

  const total = await Booking.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let bookings = [];
  if (skip < total) {
    bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('package', 'title destination price startDate')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  const paymentRecords = bookings.length
    ? await Payment.find({ booking: { $in: bookings.map((booking) => booking._id) } })
        .select('booking status')
        .sort({ createdAt: -1 })
        .lean()
    : [];
  const latestPaymentByBooking = new Map();
  paymentRecords.forEach((payment) => {
    const bookingId = payment.booking.toString();
    if (!latestPaymentByBooking.has(bookingId)) {
      latestPaymentByBooking.set(bookingId, payment.status);
    }
  });
  const bookingsWithPaymentStatus = bookings.map((booking) => ({
    ...booking.toObject(),
    paymentStatus: latestPaymentByBooking.get(booking._id.toString()) || 'unpaid',
  }));

  res.status(200).json({
    success: true,
    message: 'Admin bookings retrieved successfully',
    data: {
      bookings: bookingsWithPaymentStatus,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const getAdminPayments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  const total = await Payment.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let payments = [];
  if (skip < total) {
    payments = await Payment.find(query)
      .populate('user', 'name email')
      .populate('booking', 'travelers totalAmount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'Admin payments retrieved successfully',
    data: {
      payments,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
