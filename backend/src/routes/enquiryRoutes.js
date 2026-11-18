import { Router } from 'express';
import {
  createEnquiry,
  getMyEnquiries,
  getAdminEnquiries,
  updateAdminEnquiry,
} from '../controllers/enquiryController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import { enquiryLimiter } from '../middleware/rateLimit.js';
import {
  createEnquirySchema,
  updateEnquirySchema,
} from '../validators/enquiryValidator.js';

const router = Router();

// Public enquiry submission (with IP rate limiter: 5/hr)
router.post('/', enquiryLimiter, validate(createEnquirySchema), createEnquiry);

// User viewing own enquiries
router.get('/my', protect, getMyEnquiries);

// Admin enquiry management
router.get('/admin', protect, restrictTo('admin'), getAdminEnquiries);
router.patch('/admin/:id', protect, restrictTo('admin'), validate(updateEnquirySchema), updateAdminEnquiry);

export default router;
