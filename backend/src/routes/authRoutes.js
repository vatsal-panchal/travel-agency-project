import { Router } from 'express';
import {
  register,
  login,
  refresh,
  logout,
  logoutAll,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { authLimiter } from '../middleware/rateLimit.js';
import {
  registerSchema,
  loginSchema,
  changePasswordSchema,
} from '../validators/authValidator.js';

const router = Router();

router.post('/register', authLimiter, validate(registerSchema), register);
router.post('/login', authLimiter, validate(loginSchema), login);
router.post('/refresh', authLimiter, refresh);
router.post('/logout', logout);
router.post('/logout-all', protect, logoutAll);
router.get('/me', protect, getMe);
router.patch('/change-password', protect, validate(changePasswordSchema), changePassword);

export default router;
