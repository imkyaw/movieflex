import { body } from 'express-validator';

const email = body('email')
  .trim()
  .isEmail()
  .withMessage('Enter a valid email address.')
  .normalizeEmail();

const password = body('password')
  .isString()
  .isLength({ min: 8, max: 128 })
  .withMessage('Password must be between 8 and 128 characters.')
  .matches(/[a-z]/)
  .withMessage('Password must include a lowercase letter.')
  .matches(/[A-Z]/)
  .withMessage('Password must include an uppercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must include a number.');

export const registerValidator = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters.'),
  email,
  password,
];

export const loginValidator = [email, body('password').isString().notEmpty()];
