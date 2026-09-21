import { body, param } from 'express-validator';

export const userIdValidator = [
  param('id').isUUID().withMessage('User id must be a valid UUID.'),
];

export const userStatusValidator = [
  param('id').isUUID().withMessage('User id must be a valid UUID.'),
  body('status').isIn(['ACTIVE', 'INACTIVE']).withMessage('Status must be either ACTIVE or INACTIVE.'),
];

export const orderIdValidator = [
  param('id').isUUID().withMessage('Order id must be a valid UUID.'),
];
