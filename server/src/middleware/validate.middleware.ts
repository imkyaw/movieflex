import type { RequestHandler } from 'express';
import { validationResult } from 'express-validator';
import { AppError } from '../utils/AppError.js';

export const validateRequest: RequestHandler = (req, _res, next) => {
  const result = validationResult(req);
  if (!result.isEmpty()) {
    next(
      new AppError(
        422,
        'VALIDATION_ERROR',
        'Request validation failed.',
        result.array({ onlyFirstError: true }),
      ),
    );
    return;
  }
  next();
};
