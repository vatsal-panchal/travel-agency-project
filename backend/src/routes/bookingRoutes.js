import { Router } from 'express';
import {
  createBooking,
  getMyBookings,
  getBookingById,
  cancelBooking,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  createBookingSchema,
  queryBookingSchema,
} from '../validators/bookingValidator.js';

const router = Router();

router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/my', validate(queryBookingSchema, 'query'), getMyBookings);
router.get('/:id', getBookingById);
router.patch('/:id/cancel', cancelBooking);

export default router;
