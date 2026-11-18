import { z } from 'zod';
import mongoose from 'mongoose';

export const createEnquirySchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  phone: z.string().trim().optional().default(''),
  packageId: z
    .string()
    .refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid package ID format',
    })
    .optional(),
  message: z.string().trim().min(5, 'Message must be at least 5 characters').max(1000, 'Message cannot exceed 1000 characters'),
});

export const updateEnquirySchema = z.object({
  status: z.enum(['new', 'replied', 'closed']),
  adminReply: z.string().trim().max(1000).optional().default(''),
});
