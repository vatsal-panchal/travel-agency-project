import { Router } from 'express';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
} from '../controllers/wishlistController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

router.get('/', getWishlist);
router.post('/:packageId', addToWishlist);
router.delete('/:packageId', removeFromWishlist);

export default router;
