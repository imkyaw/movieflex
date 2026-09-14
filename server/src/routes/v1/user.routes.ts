import { Router } from 'express';
import * as userController from '../../controllers/user.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';

export const userRouter = Router();

userRouter.get('/', requireAuth, requireAdmin, userController.listUsers);
