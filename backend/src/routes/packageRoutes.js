import { Router } from 'express';
import {
  getAllPackages,
  getPackageById,
  createPackage,
  updatePackage,
  deletePackage,
} from '../controllers/packageController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';
import { validate } from '../middleware/validate.js';
import {
  createPackageSchema,
  updatePackageSchema,
  queryPackageSchema,
} from '../validators/packageValidator.js';
import { packageReviewsRouter } from './reviewRoutes.js';

const router = Router();

// Mount review sub-routes
router.use('/:id/reviews', packageReviewsRouter);

router.get('/', validate(queryPackageSchema, 'query'), getAllPackages);
router.get('/:id', getPackageById);

// Admin-only management endpoints
router.post('/', protect, restrictTo('admin'), validate(createPackageSchema), createPackage);
router.patch('/:id', protect, restrictTo('admin'), validate(updatePackageSchema), updatePackage);
router.delete('/:id', protect, restrictTo('admin'), deletePackage);

export default router;
