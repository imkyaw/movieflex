import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { routes } from './routes/index.js';
import {
  errorHandler,
  notFoundHandler,
} from './middleware/error.middleware.js';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: env.CLIENT_ORIGIN,
    }),
  );
  app.use(express.json());

  app.use(routes);
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
