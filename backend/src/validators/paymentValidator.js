import { z } from 'zod';
import mongoose from 'mongoose';

export const initiatePaymentSchema = z.object({
  bookingId: z.string().refine((val) => mongoose.Types.ObjectId.isValid(val), {
    message: 'Invalid booking ID format',
  }),
});

export const confirmPaymentSchema = z.object({
  cardNumber: z.string().min(12, 'Card number too short').max(23, 'Card number too long'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/?([0-9]{2}|[0-9]{4})$/, 'Expiry must be in MM/YY or MM/YYYY format')
    .refine(
      (val) => {
        const clean = val.replace('/', '');
        const month = parseInt(clean.slice(0, 2), 10);
        let year = parseInt(clean.slice(2), 10);
        if (clean.length === 4) {
          year += 2000;
        }
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;

        if (year < currentYear) return false;
        if (year === currentYear && month < currentMonth) return false;
        return true;
      },
      { message: 'Card expiry date cannot be in the past' }
    ),
  cvv: z.string().regex(/^\d{3,4}$/, 'CVV must be 3 or 4 digits'),
  cardHolder: z.string().trim().min(2, 'Card holder name must be at least 2 characters').max(60),
});

export const queryPaymentSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  status: z.enum(['pending', 'success', 'failed', 'refunded']).optional(),
});
