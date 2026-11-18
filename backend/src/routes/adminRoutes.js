import { Router } from 'express';
import {
  getAdminStats,
  getUsers,
  toggleBlockUser,
  getAdminBookings,
  getAdminPayments,
} from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';
import { restrictTo } from '../middleware/role.js';

const router = Router();

router.use(protect);
router.use(restrictTo('admin'));

router.get('/stats', getAdminStats);
router.get('/users', getUsers);
router.patch('/users/:id/block', toggleBlockUser);
router.get('/bookings', getAdminBookings);
router.get('/payments', getAdminPayments);


export default router;
