import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { Payment } from '../models/Payment.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const getAdminStats = catchAsync(async (req, res, next) => {
  const [totalUsers, totalPackages, totalBookings] = await Promise.all([
    User.countDocuments(),
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
      },
    },
  ]);

  const monthlyMap = new Map();
  monthlyAgg.forEach((item) => {
    const key = `${item._id.year}-${String(item._id.month).padStart(2, '0')}`;
    monthlyMap.set(key, item.revenue);
  });

  const monthlyRevenue = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    monthlyRevenue.push({
      month: key,
      revenue: monthlyMap.get(key) || 0,
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
  const { page = 1, limit = 10, search } = req.query;
  const query = {};

  if (search) {
    const regex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
    query.$or = [{ name: regex }, { email: regex }];
  }

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
  const { page = 1, limit = 10, status } = req.query;
  const query = {};

  if (status) {
    query.status = status;
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

  res.status(200).json({
    success: true,
    message: 'Admin bookings retrieved successfully',
    data: {
      bookings,
      page: Number(page),
      limit: Number(limit),
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

export const seedDummyData = catchAsync(async (req, res, next) => {
  const { richPackages } = await import('../scripts/seed.js');
  let count = 0;
  for (const pkgData of richPackages) {
    let pkg = await Package.findOne({ slug: pkgData.slug });
    if (!pkg) {
      await Package.create(pkgData);
      count++;
    } else {
      Object.assign(pkg, pkgData);
      await pkg.save();
      count++;
    }
  }

  res.status(200).json({
    success: true,
    message: `Successfully seeded / updated ${count} rich travel packages!`,
  });
});

