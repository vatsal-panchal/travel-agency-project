import { Router } from 'express';
import { handleChat } from '../controllers/chatController.js';
import { chatLimiter } from '../middleware/rateLimit.js';
import { validate } from '../middleware/validate.js';
import { chatRequestSchema } from '../validators/chatValidator.js';

const router = Router();

router.post('/', chatLimiter, validate(chatRequestSchema), handleChat);

export default router;
