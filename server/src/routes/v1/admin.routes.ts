import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';

export const adminRouter = Router();

adminRouter.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboard);
