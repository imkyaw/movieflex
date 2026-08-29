import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  loginValidator,
  registerValidator,
} from '../../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', registerValidator, validateRequest, authController.register);
authRouter.post('/login', loginValidator, validateRequest, authController.login);
authRouter.get('/me', requireAuth, authController.me);
