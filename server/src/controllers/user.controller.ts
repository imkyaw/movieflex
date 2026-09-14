import type { RequestHandler } from 'express';
import * as userService from '../services/user.service.js';

export const listUsers: RequestHandler = async (_req, res) => {
  res.status(200).json(await userService.listUsers());
};
