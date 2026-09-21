import { Router } from 'express';
import { adminRouter } from './admin.routes.js';
import { authRouter } from './auth.routes.js';
import { movieRouter } from './movie.routes.js';
import { orderRouter } from './order.routes.js';
import { uploadRouter } from './upload.routes.js';

export const v1Router = Router();

v1Router.use('/auth', authRouter);
v1Router.use('/movies', movieRouter);
v1Router.use('/orders', orderRouter);
v1Router.use('/admin', adminRouter);
v1Router.use('/uploads', uploadRouter);
