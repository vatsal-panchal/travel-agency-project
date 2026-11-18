import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

const createRateLimiter = (windowMs, max, message) => {
  return rateLimit({
    windowMs,
    max,
    standardHeaders: true,
    legacyHeaders: false,
    skip: () => env.NODE_ENV === 'test',
    message: {
      success: false,
      message,
      code: 'TOO_MANY_REQUESTS',
    },
  });
};

// General rate limiter: 100 requests per 15 minutes per IP
export const generalLimiter = createRateLimiter(
  15 * 60 * 1000,
  100,
  'Too many requests from this IP, please try again after 15 minutes'
);

// Strict limiter for authentication endpoints: 10 requests per 15 minutes per IP
export const authLimiter = createRateLimiter(
  15 * 60 * 1000,
  10,
  'Too many authentication attempts, please try again after 15 minutes'
);

// Public enquiry limiter: 5 per hour per IP
export const enquiryLimiter = createRateLimiter(
  60 * 60 * 1000,
  5,
  'Enquiry limit reached (max 5 per hour), please try again later'
);
