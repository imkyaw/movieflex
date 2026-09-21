import type { RequestHandler } from 'express';
import * as adminService from '../services/admin.service.js';

export const getDashboard: RequestHandler = async (_req, res) => {
  res.status(200).json(await adminService.getDashboard());
};

export const listUsers: RequestHandler = async (_req, res) => {
  res.status(200).json(await adminService.getUsers());
};

export const getUserDetail: RequestHandler = async (req, res) => {
  res.status(200).json(await adminService.getUserDetail(String(req.params.id)));
};

export const updateUserStatus: RequestHandler = async (req, res) => {
  res.status(200).json(await adminService.updateUserStatus(String(req.params.id), String(req.body.status), req.user!.userId));
};

export const listOrders: RequestHandler = async (_req, res) => {
  res.status(200).json(await adminService.getOrders());
};

export const getOrderDetail: RequestHandler = async (req, res) => {
  res.status(200).json(await adminService.getOrderDetail(String(req.params.id)));
};
