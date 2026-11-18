import { Router } from 'express';
import {
  initiatePayment,
  confirmPayment,
  getMyPayments,
  getPaymentById,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import {
  initiatePaymentSchema,
  confirmPaymentSchema,
  queryPaymentSchema,
} from '../validators/paymentValidator.js';

const router = Router();

router.use(protect);

router.post('/initiate', validate(initiatePaymentSchema), initiatePayment);
router.post('/:id/confirm', validate(confirmPaymentSchema), confirmPayment);
router.get('/my', validate(queryPaymentSchema, 'query'), getMyPayments);
router.get('/:id', getPaymentById);

export default router;
