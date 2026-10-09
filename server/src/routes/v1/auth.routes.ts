import { Router } from 'express';
import * as authController from '../../controllers/auth.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  changePasswordValidator,
  forgotPasswordValidator,
  loginValidator,
  registerValidator,
  resetPasswordValidator,
  updateProfileValidator,
} from '../../validators/auth.validator.js';

export const authRouter = Router();

authRouter.post('/register', registerValidator, validateRequest, authController.register);
authRouter.post('/login', loginValidator, validateRequest, authController.login);
authRouter.get('/me', requireAuth, authController.me);
authRouter.put('/me', requireAuth, updateProfileValidator, validateRequest, authController.updateMe);
authRouter.post('/change-password', requireAuth, changePasswordValidator, validateRequest, authController.changePassword);

authRouter.post('/forgot-password', forgotPasswordValidator, validateRequest, authController.forgotPassword);
authRouter.post('/reset-password', resetPasswordValidator, validateRequest, authController.resetPassword);