import { Router } from 'express';
import * as orderController from '../../controllers/order.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import { checkoutValidator } from '../../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.get('/', requireAuth, orderController.listMyOrders);
orderRouter.post('/', requireAuth, checkoutValidator, validateRequest, orderController.checkout);
