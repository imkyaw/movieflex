import { Router } from 'express';
import * as adminController from '../../controllers/admin.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { orderIdValidator, userIdValidator, userStatusValidator } from '../../validators/admin.validator.js';

export const adminRouter = Router();

adminRouter.get('/dashboard', requireAuth, requireAdmin, adminController.getDashboard);
adminRouter.get('/users', requireAuth, requireAdmin, adminController.listUsers);
adminRouter.get('/users/:id', requireAuth, requireAdmin, userIdValidator, validateRequest, adminController.getUserDetail);
adminRouter.patch('/users/:id/status', requireAuth, requireAdmin, userStatusValidator, validateRequest, adminController.updateUserStatus);
adminRouter.get('/orders', requireAuth, requireAdmin, adminController.listOrders);
adminRouter.get('/orders/:id', requireAuth, requireAdmin, orderIdValidator, validateRequest, adminController.getOrderDetail);
