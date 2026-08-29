import { Router } from 'express';
import { healthRouter } from './health.routes.js';
import { v1Router } from './v1/index.js';

export const routes = Router();

routes.use('/health', healthRouter);
routes.use('/api/v1', v1Router);
