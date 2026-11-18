import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { env } from './config/env.js';
import { ApiError } from './utils/ApiError.js';
import { errorHandler } from './middleware/error.js';
import { generalLimiter } from './middleware/rateLimit.js';

import healthRoute from './routes/healthRoute.js';
import authRoutes from './routes/authRoutes.js';
import packageRoutes from './routes/packageRoutes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import enquiryRoutes from './routes/enquiryRoutes.js';
import reviewRoutes from './routes/reviewRoutes.js';
import wishlistRoutes from './routes/wishlistRoutes.js';
import chatRoutes from './routes/chatRoutes.js';

const app = express();

// Deployment-safety: Behind reverse proxies (Render, Railway, Nginx), trust the first proxy hop
if (env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security headers & hygiene
app.disable('x-powered-by');

// CORS setup
const allowedOrigins = env.CLIENT_URL.split(',')
  .map((origin) => origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '').toLowerCase())
  .filter(Boolean);

const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents (cURL, mobile apps, server-to-server) with no Origin header
    if (!origin) return callback(null, true);
    const normalizedOrigin = origin.trim().replace(/^['"]|['"]$/g, '').replace(/\/+$/, '').toLowerCase();
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    console.warn(`[CORS] Rejected origin: "${origin}". Allowed origins: ${JSON.stringify(allowedOrigins)}`);
    return callback(new ApiError(403, 'CORS policy: Not allowed by CORS', null, 'CORS_ERROR'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type'],
  preflightContinue: false,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));
app.use(helmet());

// Logging
if (env.NODE_ENV === 'production') {
  app.use(morgan('combined'));
} else if (env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// Body parsing with strict 10kb payload limit
app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

// Apply general rate limiter across all /api routes
app.use('/api', generalLimiter);

// API Route mounts
app.use('/api', healthRoute);
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/enquiries', enquiryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/chat', chatRoutes);

// Catch-all 404 for unhandled API endpoints
app.use((req, res, next) => {
  next(new ApiError(404, `Endpoint ${req.method} ${req.originalUrl} not found`, null, 'NOT_FOUND'));
});

// Central centralized error handling middleware
app.use(errorHandler);

export default app;
