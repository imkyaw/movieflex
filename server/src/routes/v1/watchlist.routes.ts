import { Router } from 'express';
import * as watchlistController from '../../controllers/watchlist.controller.js';
import { requireAuth } from '../../middleware/auth.middleware.js';

export const watchlistRouter = Router();

watchlistRouter.get('/', requireAuth, watchlistController.listWatchlist);
