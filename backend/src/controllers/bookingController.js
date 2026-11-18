import mongoose from 'mongoose';
import { Booking } from '../models/Booking.js';
import { Package } from '../models/Package.js';
import { Payment } from '../models/Payment.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createBooking = catchAsync(async (req, res, next) => {
  const { packageId, travelers, travelersInfo } = req.body;
  const now = new Date();

  // Atomically reserve seats conditionally to prevent race conditions & overbooking
  const pkg = await Package.findOneAndUpdate(
    {
      _id: packageId,
      isActive: true,
      startDate: { $gt: now },
      availableSeats: { $gte: travelers },
    },
    {
      $inc: { availableSeats: -travelers },
    },
    { new: true }
  );

  if (!pkg) {
    throw new ApiError(
      400,
      'Package unavailable, fully booked, or trip has already departed',
      null,
      'SEATS_UNAVAILABLE'
    );
  }

  // Calculate total price server-side; client price is strictly ignored
  const totalAmount = pkg.price * travelers;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15-minute pending hold window

  try {
    const booking = await Booking.create({
      user: req.user._id,
      package: pkg._id,
      travelers,
      travelersInfo,
      totalAmount,
      status: 'pending',
      expiresAt,
    });

    res.status(201).json({
      success: true,
      message: 'Booking created successfully. Please complete payment within 15 minutes.',
      data: { booking },
    });
  } catch (error) {
    // Compensating rollback: restore reserved seats if booking document creation fails
    await Package.updateOne({ _id: pkg._id }, { $inc: { availableSeats: travelers } });
    throw error;
  }
});

export const getMyBookings = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status, packageId } = req.query;
  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }
  if (packageId) {
    query.package = packageId;
  }

  const total = await Booking.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let bookings = [];
  if (skip < total) {
    bookings = await Booking.find(query)
      .populate('package', 'title destination startDate durationDays price images')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'User bookings retrieved successfully',
    data: {
      bookings,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const getBookingById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid booking ID format', null, 'INVALID_ID');
  }

  const booking = await Booking.findById(id)
    .populate('package')
    .populate('user', 'name email');

  if (!booking) {
    throw new ApiError(404, 'Booking not found', null, 'NOT_FOUND');
  }

  // Authorization: Only owner or admin can inspect this booking
  const isOwner = booking.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'You are not authorized to view this booking', null, 'FORBIDDEN');
  }

  res.status(200).json({
    success: true,
    message: 'Booking retrieved successfully',
    data: { booking },
  });
});

export const cancelBooking = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid booking ID format', null, 'INVALID_ID');
  }

  const booking = await Booking.findById(id).populate('package');

  if (!booking) {
    throw new ApiError(404, 'Booking not found', null, 'NOT_FOUND');
  }

  if (booking.user.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You can only cancel your own bookings', null, 'FORBIDDEN');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'Booking has already been cancelled', null, 'ALREADY_CANCELLED');
  }

  // Only allowed before package startDate
  const now = new Date();
  if (booking.package && new Date(booking.package.startDate) <= now) {
    throw new ApiError(400, 'Cannot cancel booking after the trip start date', null, 'TRIP_ALREADY_STARTED');
  }

  // Atomic conditional update to prevent double restoration of seats
  const updatedBooking = await Booking.findOneAndUpdate(
    { _id: id, status: { $ne: 'cancelled' } },
    { status: 'cancelled' },
    { new: true }
  );

  if (!updatedBooking) {
    throw new ApiError(400, 'Booking cancellation failed or already completed', null, 'CANCEL_FAILED');
  }

  // Restores reserved seats once
  await Package.updateOne(
    { _id: updatedBooking.package },
    { $inc: { availableSeats: updatedBooking.travelers } }
  );

  // If already paid, mark successful payment as refunded
  await Payment.updateMany(
    { booking: id, status: 'success' },
    { status: 'refunded' }
  );

  res.status(200).json({
    success: true,
    message: 'Booking cancelled successfully. Seats restored.',
    data: { booking: updatedBooking },
  });
});
