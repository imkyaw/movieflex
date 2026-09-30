import type { RequestHandler } from 'express';
import * as movieService from '../services/movie.service.js';
import * as uploadService from '../services/upload.service.js';
import { AppError } from '../utils/AppError.js';

export const uploadPoster: RequestHandler = async (req, res) => {
  if (!req.file) {
    throw new AppError(400, 'FILE_REQUIRED', 'A poster image file is required.');
  }
  const movieId = String(req.params.id);
  await movieService.getMovie(movieId);
  const uploaded = await uploadService.uploadPoster(movieId, req.file);
  await movieService.setPosterKey(movieId, uploaded.posterKey);
  res.status(201).json(uploaded);
};
