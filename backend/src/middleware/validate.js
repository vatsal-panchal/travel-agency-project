import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const formattedErrors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return next(new ApiError(400, 'Validation failed', formattedErrors));
    }

    if (source === 'query') {
      // In Express 5, req.query is a getter property; mutate the existing object
      for (const key of Object.keys(req.query)) {
        delete req.query[key];
      }
      Object.assign(req.query, result.data);
    } else if (source === 'params') {
      Object.assign(req.params, result.data);
    } else {
      req.body = result.data;
    }

    next();
  };
};
