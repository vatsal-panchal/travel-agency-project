import crypto from 'crypto';
import mongoose from 'mongoose';
import { Payment } from '../models/Payment.js';
import { Booking } from '../models/Booking.js';
import { Package } from '../models/Package.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import { validateLuhn, getCardBrand } from '../utils/luhn.js';
import { env } from '../config/env.js';

export const initiatePayment = catchAsync(async (req, res, next) => {
  const { bookingId } = req.body;

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, 'Booking not found', null, 'NOT_FOUND');
  }

  const isOwner = booking.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'You are not authorized to pay for this booking', null, 'FORBIDDEN');
  }

  if (booking.status === 'confirmed') {
    throw new ApiError(400, 'This booking has already been paid and confirmed', null, 'ALREADY_PAID');
  }

  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'Cannot pay for a cancelled booking', null, 'BOOKING_CANCELLED');
  }

  const now = new Date();
  if (now > booking.expiresAt) {
    // Lazy expiration on attempt to pay
    const cancelled = await Booking.findOneAndUpdate(
      { _id: booking._id, status: 'pending' },
      { status: 'cancelled' },
      { new: true }
    );
    if (cancelled) {
      await Package.updateOne({ _id: cancelled.package }, { $inc: { availableSeats: cancelled.travelers } });
    }
    throw new ApiError(400, 'Booking has expired. Please create a new booking.', null, 'BOOKING_EXPIRED');
  }

  // Reuse existing pending payment if one already exists
  let payment = await Payment.findOne({ booking: booking._id, status: 'pending' });

  if (!payment) {
    payment = await Payment.create({
      booking: booking._id,
      user: booking.user,
      amount: booking.totalAmount,
      status: 'pending',
    });
  }

  res.status(200).json({
    success: true,
    message: 'Payment session initiated',
    data: { payment },
  });
});

export const confirmPayment = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { cardNumber, cardHolder } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid payment ID format', null, 'INVALID_ID');
  }

  const cleanedNumber = cardNumber.replace(/[\s-]/g, '');

  if (!validateLuhn(cleanedNumber)) {
    throw new ApiError(400, 'Invalid credit card number (failed Luhn algorithm check)', null, 'INVALID_CARD');
  }

  const payment = await Payment.findById(id);
  if (!payment) {
    throw new ApiError(404, 'Payment record not found', null, 'NOT_FOUND');
  }

  const isOwner = payment.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    throw new ApiError(403, 'Unauthorized to confirm this payment', null, 'FORBIDDEN');
  }

  // Idempotency: If already confirmed, return existing result without re-processing
  if (payment.status === 'success') {
    return res.status(200).json({
      success: true,
      message: 'Payment was already confirmed',
      data: { payment },
    });
  }

  if (payment.status !== 'pending' && payment.status !== 'failed') {
    throw new ApiError(400, `Payment cannot be processed with status '${payment.status}'`, null, 'INVALID_STATUS');
  }

  const booking = await Booking.findById(payment.booking);
  if (!booking || booking.status === 'cancelled') {
    throw new ApiError(400, 'Associated booking is cancelled or not found', null, 'BOOKING_CANCELLED');
  }

  const now = new Date();
  if (booking.status === 'pending' && now > booking.expiresAt) {
    await Booking.updateOne({ _id: booking._id }, { status: 'cancelled' });
    await Package.updateOne({ _id: booking.package }, { $inc: { availableSeats: booking.travelers } });
    await Payment.updateOne({ _id: payment._id }, { status: 'failed', failureReason: 'Booking expired' });
    throw new ApiError(400, 'Booking has expired. Payment cancelled.', null, 'BOOKING_EXPIRED');
  }

  // Artificial delay simulation: 1 second in production/development, instant in tests
  if (env.NODE_ENV !== 'test') {
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  const cardLast4 = cleanedNumber.slice(-4);
  const cardBrand = getCardBrand(cleanedNumber);

  // Simulation test cases:
  // 4000000000000002 -> Declined
  // 4000000000009995 -> Insufficient funds
  // Any other Luhn-valid card -> Success
  if (cleanedNumber === '4000000000000002') {
    payment.status = 'failed';
    payment.failureReason = 'Card was declined by issuing bank';
    payment.cardLast4 = cardLast4;
    payment.cardBrand = cardBrand;
    await payment.save();

    return res.status(400).json({
      success: false,
      message: 'Payment declined by bank',
      code: 'PAYMENT_DECLINED',
    });
  }

  if (cleanedNumber === '4000000000009995') {
    payment.status = 'failed';
    payment.failureReason = 'Insufficient funds in card account';
    payment.cardLast4 = cardLast4;
    payment.cardBrand = cardBrand;
    await payment.save();

    return res.status(400).json({
      success: false,
      message: 'Insufficient funds on card',
      code: 'INSUFFICIENT_FUNDS',
    });
  }

  const txnId = `TXN-${Date.now()}-${crypto.randomBytes(4).toString('hex').toUpperCase()}`;

  // Atomic conditional update guarantees parallel confirm calls cannot double-process
  const confirmedPayment = await Payment.findOneAndUpdate(
    { _id: payment._id, status: { $in: ['pending', 'failed'] } },
    {
      status: 'success',
      transactionId: txnId,
      cardLast4,
      cardBrand,
      failureReason: null,
    },
    { new: true }
  );

  if (!confirmedPayment) {
    // Another concurrent request succeeded first; return current state
    const current = await Payment.findById(payment._id);
    return res.status(200).json({
      success: true,
      message: 'Payment confirmed successfully',
      data: { payment: current },
    });
  }

  // Transition booking to confirmed state
  await Booking.updateOne({ _id: booking._id }, { status: 'confirmed' });

  res.status(200).json({
    success: true,
    message: 'Payment confirmed successfully',
    data: { payment: confirmedPayment },
  });
});

export const getMyPayments = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = { user: req.user._id };

  if (status) {
    query.status = status;
  }

  const total = await Payment.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let payments = [];
  if (skip < total) {
    payments = await Payment.find(query)
      .populate('booking', 'travelers totalAmount status')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'User payments retrieved successfully',
    data: {
      payments,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const getPaymentById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid payment ID format', null, 'INVALID_ID');
  }

  const payment = await Payment.findById(id)
    .populate('booking')
    .populate('user', 'name email');

  if (!payment) {
    throw new ApiError(404, 'Payment not found', null, 'NOT_FOUND');
  }

  const isOwner = payment.user._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Unauthorized to view this payment', null, 'FORBIDDEN');
  }

  res.status(200).json({
    success: true,
    message: 'Payment details retrieved successfully',
    data: { payment },
  });
});
