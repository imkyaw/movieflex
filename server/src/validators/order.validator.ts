import { body, param } from 'express-validator';

export const addCartItemValidator = [
  body('movieId').isUUID().withMessage('Movie id must be a valid UUID.'),
  body('quantity').isInt({ min: 1, max: 20 }).toInt().withMessage('Quantity must be between 1 and 20.'),
];

export const cartMovieIdValidator = [
  param('movieId').isUUID().withMessage('Movie id must be a valid UUID.'),
];

export const updateCartItemValidator = [
  ...cartMovieIdValidator,
  body('quantity').isInt({ min: 0, max: 20 }).toInt().withMessage('Quantity must be between 0 and 20.'),
];
