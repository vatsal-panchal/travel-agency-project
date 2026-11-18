import mongoose from 'mongoose';
import { Package } from '../models/Package.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

// Escapes special characters for safe regular expression queries
const escapeRegex = (str) => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
};

// Helper to generate a URL-safe slug
const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

export const getAllPackages = catchAsync(async (req, res, next) => {
  const { page, limit, search, destination, category, minPrice, maxPrice, sort } = req.query;

  const query = { isActive: true };

  if (search) {
    const escaped = escapeRegex(search);
    const searchRegex = new RegExp(escaped, 'i');
    query.$or = [{ title: searchRegex }, { destination: searchRegex }];
  }

  if (destination) {
    query.destination = new RegExp(`^${escapeRegex(destination)}$`, 'i');
  }

  if (category) {
    query.category = category;
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) query.price.$gte = minPrice;
    if (maxPrice !== undefined) query.price.$lte = maxPrice;
  }

  const sortMap = {
    price_asc: { price: 1 },
    price_desc: { price: -1 },
    rating_desc: { avgRating: -1 },
    duration_asc: { durationDays: 1 },
    newest: { createdAt: -1 },
  };

  const sortOption = sortMap[sort] || { createdAt: -1 };

  const total = await Package.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  // Page beyond range returns empty data, not an error
  let packages = [];
  if (skip < total) {
    packages = await Package.find(query).sort(sortOption).skip(skip).limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'Packages retrieved successfully',
    data: {
      packages,
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const getPackageById = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const pkg = await Package.findOne({ _id: id, isActive: true });
  if (!pkg) {
    throw new ApiError(404, 'Travel package not found', null, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    message: 'Package retrieved successfully',
    data: { package: pkg },
  });
});

export const createPackage = catchAsync(async (req, res, next) => {
  const packageData = { ...req.body };

  // Never permit setting ratings or review counts directly
  delete packageData.avgRating;
  delete packageData.reviewCount;
  delete packageData.isActive;

  const baseSlug = createSlug(packageData.title);
  let slug = baseSlug;
  let counter = 1;

  while (await Package.exists({ slug })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  packageData.slug = slug;
  packageData.availableSeats = packageData.totalSeats;

  const pkg = await Package.create(packageData);

  res.status(201).json({
    success: true,
    message: 'Package created successfully',
    data: { package: pkg },
  });
});

export const updatePackage = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const pkg = await Package.findById(id);
  if (!pkg || !pkg.isActive) {
    throw new ApiError(404, 'Package not found or inactive', null, 'NOT_FOUND');
  }

  const updates = { ...req.body };
  // Never permit clients to modify rating/reviews or soft-delete state via patch
  delete updates.avgRating;
  delete updates.reviewCount;
  delete updates.isActive;
  delete updates.slug;

  const bookedSeats = pkg.totalSeats - pkg.availableSeats;

  if (updates.totalSeats !== undefined) {
    if (updates.totalSeats < bookedSeats) {
      throw new ApiError(
        400,
        `Cannot reduce total seats below already-booked seats (${bookedSeats})`,
        null,
        'INVALID_SEAT_COUNT'
      );
    }
    // Adjust available seats proportionally: newTotalSeats - alreadyBooked
    updates.availableSeats = updates.totalSeats - bookedSeats;
  }

  const updatedPackage = await Package.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: 'Package updated successfully',
    data: { package: updatedPackage },
  });
});

export const deletePackage = catchAsync(async (req, res, next) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid package ID format', null, 'INVALID_ID');
  }

  const pkg = await Package.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!pkg) {
    throw new ApiError(404, 'Package not found', null, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    message: 'Package deleted successfully (soft delete)',
    data: null,
  });
});
