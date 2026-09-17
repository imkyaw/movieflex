import type { RequestHandler } from 'express';
import * as reviewService from '../services/review.service.js';

export const listReviews: RequestHandler = async (req, res) => {
  res.status(200).json(await reviewService.listReviews(String(req.params.id)));
};

export const upsertReview: RequestHandler = async (req, res) => {
  const review = await reviewService.upsertReview(String(req.params.id), req.user!.userId, {
    rating: Number(req.body.rating),
    comment: String(req.body.comment),
  });
  res.status(200).json(review);
};
