import { Router } from 'express';
import {
  createReview,
  getPackageReviews,
  getFeaturedReviews,
  deleteReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createReviewSchema } from '../validators/reviewValidator.js';

const router = Router();

// Public feed used on the homepage and reviews page
router.get('/featured', getFeaturedReviews);

// Delete a review by review ID (user own or admin)
router.delete('/:id', protect, deleteReview);

export default router;

// Sub-router for /api/packages/:id/reviews
export const packageReviewsRouter = Router({ mergeParams: true });
packageReviewsRouter.get('/', getPackageReviews);
packageReviewsRouter.post('/', protect, validate(createReviewSchema), createReview);
