import type { RequestHandler } from 'express';
import * as orderService from '../services/order.service.js';

export const checkout: RequestHandler = async (req, res) => {
  const order = await orderService.checkout(req.user!.userId, req.body.items as orderService.CheckoutItem[]);
  res.status(201).json(order);
};

export const listMyOrders: RequestHandler = async (req, res) => {
  res.status(200).json(await orderService.listOrders(req.user!.userId));
};
