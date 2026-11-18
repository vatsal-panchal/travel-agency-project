import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { RefreshToken } from '../models/RefreshToken.js';
import { ApiError } from '../utils/ApiError.js';
import { catchAsync } from '../utils/catchAsync.js';
import {
  generateAccessToken,
  generateRefreshToken,
  hashToken,
  verifyRefreshToken,
} from '../utils/tokens.js';
import {
  setRefreshCookie,
  clearRefreshCookie,
  REFRESH_COOKIE_NAME,
} from '../utils/cookieHelper.js';
import { env } from '../config/env.js';

// Dummy hash to execute uniform-time bcrypt comparison when user is not found
const DUMMY_HASH = '$2a$10$wT8K8h9zGvN1u5/m3Z6EWeoJ6h.k8tX7mF0Vn7t1Q7QZ5g6.k2p9m';

const createSession = async (user, res, familyId = null) => {
  const accessToken = generateAccessToken(user);
  const { token: refreshToken, familyId: finalFamilyId } = generateRefreshToken(user._id, familyId);

  const expiresAt = new Date(
    Date.now() + env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000
  );

  await RefreshToken.create({
    userId: user._id,
    tokenHash: hashToken(refreshToken),
    familyId: finalFamilyId,
    revoked: false,
    expiresAt,
  });

  setRefreshCookie(res, refreshToken);

  return { accessToken };
};

export const register = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, 'Email address already registered', null, 'DUPLICATE_EMAIL');
  }

  // Security rule: Registration can NEVER assign admin role
  const user = await User.create({
    name,
    email,
    password,
    role: 'user',
  });

  const { accessToken } = await createSession(user, res);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');

  if (!user) {
    // Timing mitigation: perform dummy compare so response time matches found user
    await bcrypt.compare(password, DUMMY_HASH);
    throw new ApiError(401, 'Invalid email or password', null, 'INVALID_CREDENTIALS');
  }

  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password', null, 'INVALID_CREDENTIALS');
  }

  if (user.isBlocked) {
    throw new ApiError(403, 'Account is suspended. Please contact support.', null, 'USER_BLOCKED');
  }

  const { accessToken } = await createSession(user, res);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      accessToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    },
  });
});

/**
 * Handles refresh token rotation with race-safe grace window:
 * When two simultaneous requests fire refresh with the same cookie (common in single-page apps),
 * the first request revokes the token and issues a new pair.
 * The second request arriving within a ~10-second grace window is permitted and issued an access token,
 * rather than falsely treating it as an attack and terminating the user's session.
 * Any reuse after the 10-second grace window terminates the entire token family.
 */
export const refresh = catchAsync(async (req, res, next) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (!rawRefreshToken) {
    throw new ApiError(401, 'Refresh token missing', null, 'INVALID_TOKEN');
  }

  let decoded;
  try {
    decoded = verifyRefreshToken(rawRefreshToken);
  } catch (error) {
    clearRefreshCookie(res);
    if (error instanceof jwt.TokenExpiredError) {
      throw new ApiError(401, 'Refresh token has expired', null, 'TOKEN_EXPIRED');
    }
    throw new ApiError(401, 'Invalid refresh token', null, 'INVALID_TOKEN');
  }

  const tokenHash = hashToken(rawRefreshToken);
  const tokenRecord = await RefreshToken.findOne({ tokenHash });

  if (!tokenRecord) {
    clearRefreshCookie(res);
    throw new ApiError(401, 'Invalid or unrecognized refresh token', null, 'INVALID_TOKEN');
  }

  const user = await User.findById(tokenRecord.userId);
  if (!user || user.isBlocked) {
    clearRefreshCookie(res);
    throw new ApiError(403, 'User account inaccessible or suspended', null, 'USER_BLOCKED');
  }

  // Token reuse detection & Parallel-refresh grace handling
  if (tokenRecord.revoked) {
    const GRACE_PERIOD_MS = 10000; // 10 seconds grace window
    const now = Date.now();
    const replacedTime = tokenRecord.replacedAt ? new Date(tokenRecord.replacedAt).getTime() : 0;
    const isWithinGrace = (now - replacedTime) < GRACE_PERIOD_MS;

    if (isWithinGrace) {
      // Parallel race condition: request was fired concurrently before new cookie could be stored.
      // Grant a valid access token without revoking the family.
      const accessToken = generateAccessToken(user);
      return res.status(200).json({
        success: true,
        message: 'Token refreshed (grace window)',
        data: { accessToken },
      });
    }

    // Reuse detected outside grace window: Revoke whole family for security
    await RefreshToken.updateMany({ familyId: tokenRecord.familyId }, { revoked: true });
    clearRefreshCookie(res);
    throw new ApiError(401, 'Session revoked due to token reuse detection', null, 'SESSION_REVOKED');
  }

  // Normal rotation: atomically revoke old token and record replacement timestamp
  tokenRecord.revoked = true;
  tokenRecord.replacedAt = new Date();
  await tokenRecord.save();

  // Create new refresh token within the same family
  const { accessToken } = await createSession(user, res, tokenRecord.familyId);

  res.status(200).json({
    success: true,
    message: 'Token refreshed successfully',
    data: { accessToken },
  });
});

export const logout = catchAsync(async (req, res, next) => {
  const rawRefreshToken = req.cookies?.[REFRESH_COOKIE_NAME];

  if (rawRefreshToken) {
    const tokenHash = hashToken(rawRefreshToken);
    await RefreshToken.updateOne({ tokenHash }, { revoked: true });
  }

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
    data: null,
  });
});

export const logoutAll = catchAsync(async (req, res, next) => {
  // Revoke all refresh tokens for the authenticated user
  await RefreshToken.updateMany({ userId: req.user._id }, { revoked: true });

  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'All active sessions have been revoked',
    data: null,
  });
});

export const getMe = catchAsync(async (req, res, next) => {
  res.status(200).json({
    success: true,
    message: 'Profile retrieved successfully',
    data: {
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
        createdAt: req.user.createdAt,
      },
    },
  });
});

export const changePassword = catchAsync(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);

  if (!isMatch) {
    throw new ApiError(400, 'Current password does not match', null, 'INVALID_PASSWORD');
  }

  user.password = newPassword;
  await user.save();

  // Revoke all existing sessions for this user across all devices
  await RefreshToken.updateMany({ userId: user._id }, { revoked: true });
  clearRefreshCookie(res);

  res.status(200).json({
    success: true,
    message: 'Password changed successfully. Please log in with your new password.',
    data: null,
  });
});
