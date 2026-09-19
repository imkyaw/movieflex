import type { RequestHandler } from 'express';
import * as adminService from '../services/admin.service.js';

export const getDashboard: RequestHandler = async (_req, res) => {
  res.status(200).json(await adminService.getDashboard());
};
