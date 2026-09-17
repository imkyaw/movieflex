import type { RequestHandler } from 'express';
import * as watchlistService from '../services/watchlist.service.js';

export const listWatchlist: RequestHandler = async (req, res) => {
  res.status(200).json(await watchlistService.listWatchlist(req.user!.userId));
};

export const addToWatchlist: RequestHandler = async (req, res) => {
  await watchlistService.addToWatchlist(req.user!.userId, String(req.params.id));
  res.status(204).send();
};

export const removeFromWatchlist: RequestHandler = async (req, res) => {
  await watchlistService.removeFromWatchlist(req.user!.userId, String(req.params.id));
  res.status(204).send();
};
