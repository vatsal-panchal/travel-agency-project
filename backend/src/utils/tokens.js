import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

export const generateAccessToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    env.JWT_ACCESS_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: env.ACCESS_TOKEN_EXPIRES,
    }
  );
};

export const generateRefreshToken = (userId, familyId = null) => {
  const finalFamilyId = familyId || crypto.randomUUID();
  const jti = crypto.randomUUID();

  const token = jwt.sign(
    {
      sub: userId.toString(),
      familyId: finalFamilyId,
      jti,
    },
    env.JWT_REFRESH_SECRET,
    {
      algorithm: 'HS256',
      expiresIn: `${env.REFRESH_TOKEN_EXPIRES_DAYS}d`,
    }
  );

  return { token, familyId: finalFamilyId, jti };
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET, { algorithms: ['HS256'] });
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET, { algorithms: ['HS256'] });
};
