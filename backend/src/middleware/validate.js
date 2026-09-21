import { errorResponse } from '../utils/apiResponse.js';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      const parsed = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      req.validatedData = parsed;
      next();
    } catch (err) {
      if (err.errors) {
        const errorMessages = err.errors.map((e) => {
          const path = e.path.filter((p) => p !== 'body' && p !== 'query' && p !== 'params').join('.');
          return `${path ? path + ': ' : ''}${e.message}`;
        });
        return errorResponse(res, 'Validation failed', 400, errorMessages);
      }
      next(err);
    }
  };
};
