import type { RequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { posterUrl } from '../services/upload.service.js';

export const uploadPoster: RequestHandler = (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'A poster image file is required.');
  }
  res.status(201).json({ url: posterUrl(req, req.file.filename) });
};
