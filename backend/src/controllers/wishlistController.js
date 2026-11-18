import mongoose from 'mongoose';
import { Wishlist } from '../models/Wishlist.js';
import { Package } from '../models/Package.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const addToWishlist = catchAsync(async (req, res, next) => {
  const { packageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const pkg = await Package.findOne({ _id: packageId, isActive: true });
  if (!pkg) {
    throw new ApiError(404, 'Package not found or inactive', null, 'NOT_FOUND');
  }

  // Idempotent upsert: if already in wishlist, return existing without throwing duplicate error
  const wishlistItem = await Wishlist.findOneAndUpdate(
    { user: req.user._id, package: packageId },
    { user: req.user._id, package: packageId },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );

  res.status(200).json({
    success: true,
    message: 'Package added to wishlist',
    data: { item: wishlistItem },
  });
});

export const removeFromWishlist = catchAsync(async (req, res, next) => {
  const { packageId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(packageId)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  await Wishlist.findOneAndDelete({ user: req.user._id, package: packageId });

  res.status(200).json({
    success: true,
    message: 'Package removed from wishlist',
    data: null,
  });
});

export const getWishlist = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10 } = req.query;
  const query = { user: req.user._id };

  const total = await Wishlist.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let items = [];
  if (skip < total) {
    items = await Wishlist.find(query)
      .populate('package', 'title slug destination price durationDays images avgRating reviewCount')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
  }

  res.status(200).json({
    success: true,
    message: 'User wishlist retrieved successfully',
    data: {
      items,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});
