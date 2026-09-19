import type { RequestHandler } from 'express';
import * as orderService from '../services/order.service.js';

export const getCart: RequestHandler = async (req, res) => {
  res.status(200).json(await orderService.getCart(req.user!.userId));
};

export const addCartItem: RequestHandler = async (req, res) => {
  const { movieId, quantity } = req.body as { movieId: string; quantity: number };
  res.status(200).json(await orderService.addCartItem(req.user!.userId, movieId, quantity));
};

export const updateCartItem: RequestHandler = async (req, res) => {
  const { quantity } = req.body as { quantity: number };
  res.status(200).json(await orderService.updateCartItem(req.user!.userId, String(req.params.movieId), quantity));
};

export const removeCartItem: RequestHandler = async (req, res) => {
  res.status(200).json(await orderService.removeCartItem(req.user!.userId, String(req.params.movieId)));
};

export const checkout: RequestHandler = async (req, res) => {
  const order = await orderService.checkout(req.user!.userId);
  res.status(201).json(order);
};

export const listMyOrders: RequestHandler = async (req, res) => {
  res.status(200).json(await orderService.listOrders(req.user!.userId));
};
