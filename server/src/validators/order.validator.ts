import { body, param } from 'express-validator';

export const checkoutValidator = [
  body('items').isArray({ min: 1 }).withMessage('Add at least one movie to your cart.'),
  body('items.*.movieId').isUUID().withMessage('Movie id must be a valid UUID.'),
  body('items.*.quantity').isInt({ min: 1, max: 20 }).toInt().withMessage('Quantity must be between 1 and 20.'),
];

export const returnItemValidator = [
  param('orderId').isUUID().withMessage('Order id must be a valid UUID.'),
  param('itemId').isUUID().withMessage('Rental item id must be a valid UUID.'),
];
