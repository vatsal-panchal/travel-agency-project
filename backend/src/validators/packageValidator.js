import { z } from 'zod';
import mongoose from 'mongoose';

export const objectIdSchema = z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
  message: 'Invalid ObjectId format',
});

const itineraryItem = z.object({
  day: z.coerce.number().min(1),
  title: z.string().trim().min(1),
  details: z.string().trim().min(1),
});

export const createPackageSchema = z.object({
  title: z.string().trim().min(2).max(120),
  destination: z.string().trim().min(2).max(100),
  description: z.string().trim().min(10),
  price: z.coerce.number().positive('Price must be greater than 0'),
  durationDays: z.coerce.number().int().min(1),
  startDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid start date format',
  }),
  totalSeats: z.coerce.number().int().min(1),
  category: z.enum(['beach', 'mountain', 'city', 'adventure', 'religious']),
  images: z.array(z.string().url('Images must be valid URLs')).optional().default([]),
  itinerary: z.array(itineraryItem).optional().default([]),
  inclusions: z.array(z.string()).optional().default([]),
  exclusions: z.array(z.string()).optional().default([]),
  cancellationPolicy: z.string().optional(),
  pickupLocation: z.string().optional(),
});

export const updatePackageSchema = createPackageSchema.partial();

export const queryPackageSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(5),
  search: z.string().trim().optional(),
  destination: z.string().trim().optional(),
  category: z.enum(['beach', 'mountain', 'city', 'adventure', 'religious']).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().positive().optional(),
  sort: z.enum(['price_asc', 'price_desc', 'rating_desc', 'newest', 'duration_asc']).optional().default('newest'),
});
