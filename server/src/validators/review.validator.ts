import { body, param } from 'express-validator';

export const movieReviewsParamValidator = [
  param('id').isUUID().withMessage('Movie id must be a valid UUID.'),
];

export const upsertReviewValidator = [
  ...movieReviewsParamValidator,
  body('rating').isInt({ min: 1, max: 5 }).toInt().withMessage('Rating must be between 1 and 5.'),
  body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Review must be between 1 and 1000 characters.'),
];
