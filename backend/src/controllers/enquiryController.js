import mongoose from 'mongoose';
import { Enquiry } from '../models/Enquiry.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';

export const createEnquiry = catchAsync(async (req, res, next) => {
  const { name, email, phone, packageId, message } = req.body;

  const enquiry = await Enquiry.create({
    user: req.user ? req.user._id : null,
    name,
    email,
    phone,
    package: packageId || null,
    message,
    status: 'new',
  });

  res.status(201).json({
    success: true,
    message: 'Enquiry submitted successfully. Our team will contact you shortly.',
    data: { enquiry },
  });
});

export const getMyEnquiries = catchAsync(async (req, res, next) => {
  const enquiries = await Enquiry.find({
    $or: [{ user: req.user._id }, { email: req.user.email }],
  })
    .populate('package', 'title destination')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    message: 'User enquiries retrieved successfully',
    data: { enquiries },
  });
});

export const getAdminEnquiries = catchAsync(async (req, res, next) => {
  const { page = 1, limit = 10, status } = req.query;
  const query = {};

  if (status) {
    query.status = status;
  }

  const total = await Enquiry.countDocuments(query);
  const totalPages = Math.ceil(total / limit) || 1;
  const skip = (page - 1) * limit;

  let enquiries = [];
  if (skip < total) {
    enquiries = await Enquiry.find(query)
      .populate('user', 'name email')
      .populate('package', 'title destination')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
  }

  res.status(200).json({
    success: true,
    message: 'Admin enquiries retrieved successfully',
    data: {
      enquiries,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    },
  });
});

export const updateAdminEnquiry = catchAsync(async (req, res, next) => {
  const { id } = req.params;
  const { status, adminReply } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new ApiError(400, 'Invalid enquiry ID format', null, 'INVALID_ID');
  }

  const enquiry = await Enquiry.findByIdAndUpdate(
    id,
    { status, adminReply },
    { new: true, runValidators: true }
  );

  if (!enquiry) {
    throw new ApiError(404, 'Enquiry record not found', null, 'NOT_FOUND');
  }

  res.status(200).json({
    success: true,
    message: 'Enquiry updated successfully',
    data: { enquiry },
  });
});
