import { Router } from 'express';
import * as movieController from '../../controllers/movie.controller.js';
import * as reviewController from '../../controllers/review.controller.js';
import * as watchlistController from '../../controllers/watchlist.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';
import { validateRequest } from '../../middleware/validate.middleware.js';
import {
  createMovieValidator,
  listMoviesValidator,
  movieIdValidator,
  updateMovieValidator,
} from '../../validators/movie.validator.js';
import { movieReviewsParamValidator, upsertReviewValidator } from '../../validators/review.validator.js';

export const movieRouter = Router();

movieRouter.get('/', listMoviesValidator, validateRequest, movieController.listMovies);
movieRouter.get('/:id', movieIdValidator, validateRequest, movieController.getMovie);
movieRouter.post('/', requireAuth, requireAdmin, createMovieValidator, validateRequest, movieController.createMovie);
movieRouter.put('/:id', requireAuth, requireAdmin, updateMovieValidator, validateRequest, movieController.updateMovie);
movieRouter.delete('/:id', requireAuth, requireAdmin, movieIdValidator, validateRequest, movieController.discontinueMovie);

movieRouter.get('/:id/reviews', movieReviewsParamValidator, validateRequest, reviewController.listReviews);
movieRouter.put('/:id/reviews', requireAuth, upsertReviewValidator, validateRequest, reviewController.upsertReview);

movieRouter.put('/:id/watchlist', requireAuth, movieIdValidator, validateRequest, watchlistController.addToWatchlist);
movieRouter.delete('/:id/watchlist', requireAuth, movieIdValidator, validateRequest, watchlistController.removeFromWatchlist);
