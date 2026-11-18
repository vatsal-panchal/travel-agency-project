import { z } from 'zod';
import mongoose from 'mongoose';

const travelerItemSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(50, 'Name cannot exceed 50 characters'),
  age: z.coerce.number().int().min(0, 'Age cannot be negative').max(120, 'Age cannot exceed 120'),
  gender: z.enum(['male', 'female', 'other']).optional().default('other'),
});

export const createBookingSchema = z
  .object({
    packageId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
      message: 'Invalid package ID format',
    }),
    travelers: z.coerce.number().int().min(1, 'At least 1 traveler required').max(10, 'Maximum 10 travelers'),
    travelersInfo: z.array(travelerItemSchema),
  })
  .refine((data) => data.travelersInfo.length === data.travelers, {
    message: 'travelersInfo length must match travelers count exactly',
    path: ['travelersInfo'],
  });

export const queryBookingSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['pending', 'confirmed', 'cancelled']).optional(),
});
