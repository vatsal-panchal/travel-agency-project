import jwt from 'jsonwebtoken';
import { ApiError } from '../utils/ApiError.js';
import { verifyAccessToken } from '../utils/tokens.js';
import { User } from '../models/User.js';

export const protect = async (req, res, next) => {
  let token;
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  }

  if (!token) {
    return next(new ApiError(401, 'Authentication token missing', null, 'INVALID_TOKEN'));
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await User.findById(decoded.sub);

    if (!user) {
      return next(new ApiError(401, 'User account no longer exists', null, 'INVALID_TOKEN'));
    }

    if (user.isBlocked) {
      return next(new ApiError(403, 'Account is suspended. Please contact support.', null, 'USER_BLOCKED'));
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      return next(new ApiError(401, 'Access token has expired', null, 'TOKEN_EXPIRED'));
    }
    return next(new ApiError(401, 'Invalid authentication token', null, 'INVALID_TOKEN'));
  }
};
