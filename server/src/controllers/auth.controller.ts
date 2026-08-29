import type { RequestHandler } from 'express';
import * as authService from '../services/auth.service.js';
import { AppError } from '../utils/AppError.js';

export const register: RequestHandler = async (req, res) => {
  const result = await authService.register(req.body as {
    email: string;
    password: string;
    name: string;
  });
  res.status(201).json(result);
};

export const login: RequestHandler = async (req, res) => {
  const result = await authService.login(req.body as {
    email: string;
    password: string;
  });
  res.status(200).json(result);
};

export const me: RequestHandler = (req, res) => {
  if (!req.user) throw new AppError(401, 'AUTH_REQUIRED', 'Authentication is required.');
  res.status(200).json(authService.getProfile(req.user));
};
