import { Router } from 'express';
import { authRouter } from './auth.routes.js';
import { movieRouter } from './movie.routes.js';
import { orderRouter } from './order.routes.js';
import { watchlistRouter } from './watchlist.routes.js';

export const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/movies', movieRouter);
v1Router.use('/orders', orderRouter);
v1Router.use('/watchlist', watchlistRouter);
