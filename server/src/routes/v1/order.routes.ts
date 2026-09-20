import { Router } from 'express';
import * as orderController from '../../controllers/order.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  addCartItemValidator,
  cartMovieIdValidator,
  updateCartItemValidator,
} from '../../validators/order.validator.js';

export const orderRouter = Router();

orderRouter.get('/', requireAuth, orderController.listMyOrders);
orderRouter.post('/checkout', requireAuth, orderController.checkout);

orderRouter.get('/cart', requireAuth, orderController.getCart);
orderRouter.post('/cart/items', requireAuth, addCartItemValidator, validateRequest, orderController.addCartItem);
orderRouter.patch('/cart/items/:movieId', requireAuth, updateCartItemValidator, validateRequest, orderController.updateCartItem);
orderRouter.delete('/cart/items/:movieId', requireAuth, cartMovieIdValidator, validateRequest, orderController.removeCartItem);
