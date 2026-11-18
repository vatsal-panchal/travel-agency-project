import { env } from '../config/env.js';

export const REFRESH_COOKIE_NAME = 'refreshToken';

/**
 * Returns options for setting or clearing the refresh token cookie.
 * 
 * Explanation:
 * - httpOnly is always true to guard against XSS token theft.
 * - path is strictly restricted to '/api/auth' so the browser only sends it on auth endpoints.
 * - If COOKIE_CROSS_SITE is true (e.g. cross-origin frontend on Netlify/Vercel with backend on Railway/Render):
 *   sameSite must be 'none' and secure must be true, as browsers block cross-site cookies without Secure + None.
 * - Otherwise (same-site or local testing):
 *   sameSite is 'lax' to defend against CSRF, and secure is only enabled in production to allow plain HTTP localhost.
 */
export const getRefreshCookieOptions = () => {
  const isCrossSite = env.COOKIE_CROSS_SITE;
  const isProduction = env.NODE_ENV === 'production';

  return {
    httpOnly: true,
    path: '/api/auth',
    sameSite: isCrossSite ? 'none' : 'lax',
    secure: isCrossSite ? true : isProduction,
    maxAge: env.REFRESH_TOKEN_EXPIRES_DAYS * 24 * 60 * 60 * 1000,
  };
};

export const setRefreshCookie = (res, token) => {
  res.cookie(REFRESH_COOKIE_NAME, token, getRefreshCookieOptions());
};

export const clearRefreshCookie = (res) => {
  const options = getRefreshCookieOptions();
  // Clear cookie with exact same path/sameSite/secure options
  delete options.maxAge;
  res.clearCookie(REFRESH_COOKIE_NAME, options);
};
