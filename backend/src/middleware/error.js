import { env } from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || null;
  let code = err.code || null;

  // Malformed JSON body parser error
  if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && err.status === 400 && 'body' in err)) {
    statusCode = 400;
    message = 'Invalid JSON payload received';
    code = 'MALFORMED_JSON';
  }

  // Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation failed';
    errors = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    code = 'VALIDATION_ERROR';
  }

  // Mongoose CastError (e.g. invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid resource identifier format for '${err.path}'`;
    code = 'INVALID_ID';
  }

  // MongoDB duplicate key error (code 11000)
  if (err.code === 11000) {
    statusCode = 409;
    const field = Object.keys(err.keyValue || {})[0] || 'field';
    message = `A record with this ${field} already exists`;
    code = 'DUPLICATE_KEY';
  }

  // JWT Errors
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token has expired';
    code = 'TOKEN_EXPIRED';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    code = 'INVALID_TOKEN';
  }

  // CORS Origin Rejected Error
  if (message.includes('CORS policy: Not allowed by CORS')) {
    statusCode = 403;
    code = 'CORS_ERROR';
  }

  // Sanitize internal server errors in production
  if (statusCode === 500 && env.NODE_ENV === 'production') {
    message = 'Internal server error occurred';
    code = 'INTERNAL_ERROR';
    errors = null;
  }

  const response = {
    success: false,
    message,
    ...(errors ? { errors } : {}),
    ...(code ? { code } : {}),
  };

  res.status(statusCode).json(response);
};
