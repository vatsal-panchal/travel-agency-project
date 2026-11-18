import mongoose from 'mongoose';
import { Review } from '../models/Review.js';
import { Package } from '../models/Package.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Recalculates and persists avgRating and reviewCount on the Package
export const updatePackageRatingStats = async (packageId) => {
  const stats = await Review.aggregate([
    { $match: { package: new mongoose.Types.ObjectId(packageId) } },
    {
      $group: {
        _id: '$package',
        avgRating: { $avg: '$rating' },
        reviewCount: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Package.findByIdAndUpdate(packageId, {
      avgRating: Math.round(stats[0].avgRating * 10) / 10,
      reviewCount: stats[0].reviewCount,
    });
  } else {
    await Package.findByIdAndUpdate(packageId, {
      avgRating: 0,
      reviewCount: 0,
    });
  }
};

export const createReview = catchAsync(async (req, res, next) => {
  const { id: packageId } = req.params;
  const { rating, comment } = req.body;

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const pkg = await Package.findById(packageId);
  if (!pkg || !pkg.isActive) {
    throw new ApiError(404, 'Package not found', null, 'NOT_FOUND');
  }

  // Verification 1: Must have a confirmed booking
  const confirmedBooking = await Booking.findOne({
    user: req.user._id,
    package: packageId,
    status: 'confirmed',
  });

  if (!confirmedBooking) {
    throw new ApiError(
      403,
      'You can only review packages you have booked and confirmed',
      null,
      'NO_CONFIRMED_BOOKING'
    );
  }

  // Verification 2: Trip must have already concluded (startDate + durationDays has passed)
  const now = new Date();
  const tripEndDate = new Date(
    new Date(pkg.startDate).getTime() + pkg.durationDays * 24 * 60 * 60 * 1000
  );

  if (now < tripEndDate) {
    throw new ApiError(
      403,
      'You can only review a package after completing your trip',
      null,
      'TRIP_NOT_COMPLETED'
    );
  }

  // Prevent duplicate review per user per package
  const existingReview = await Review.findOne({
    user: req.user._id,
    package: packageId,
  });

  if (existingReview) {
    throw new ApiError(409, 'You have already reviewed this package', null, 'DUPLICATE_REVIEW');
  }

  const review = await Review.create({
    user: req.user._id,
    package: packageId,
    rating,
    comment,
  });

  // Recompute aggregate ratings
  await updatePackageRatingStats(packageId);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review },
  });
});

// Public feed of authentic reviews across all journeys.
export const getFeaturedReviews = catchAsync(async (req, res, next) => {
  const limit = Math.min(Math.max(Number(req.query.limit) || 9, 1), 24);

  const reviews = await Review.find({ comment: { $ne: '' } })
    .populate('user', 'name')
    .populate('package', 'title destination slug images category durationDays')
    .sort({ rating: -1, createdAt: -1 })
    .limit(limit);

  const [aggregate] = await Review.aggregate([
    { $group: { _id: null, avgRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } },
  ]);

  const distribution = await Review.aggregate([
    { $group: { _id: '$rating', count: { $sum: 1 } } },
    { $sort: { _id: -1 } },
  ]);

  res.status(200).json({
    success: true,
    message: 'Featured traveler reviews retrieved successfully',
    data: {
      reviews: reviews.filter((r) => r.package),
      stats: {
        avgRating: Math.round((aggregate?.avgRating || 0) * 10) / 10,
        totalReviews: aggregate?.totalReviews || 0,
        distribution: distribution.map((d) => ({ rating: d._id, count: d.count })),
      },
    },
  });
});

export const getPackageReviews = catchAsync(async (req, res, next) => {
  const { id: packageId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const query = { package: packageId };
  const total = await Review.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let reviews = [];
  if (skip < total) {
    reviews = await Review.find(query)
      .populate('user', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
  }

  res.status(200).json({
    success: true,
    message: 'Package reviews retrieved successfully',
    data: {
      reviews,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const deleteReview = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid review ID format', null, 'INVALID_ID');
  }

  const review = await Review.findById(id);
  if (!review) {
    throw new ApiError(404, 'Review not found', null, 'NOT_FOUND');
  }

  const isOwner = review.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';

  if (!isOwner && !isAdmin) {
    throw new ApiError(403, 'Unauthorized to delete this review', null, 'FORBIDDEN');
  }

  const packageId = review.package;
  await Review.findByIdAndDelete(id);

  // Recompute aggregate ratings
  await updatePackageRatingStats(packageId);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully',
    data: null,
  });
});
