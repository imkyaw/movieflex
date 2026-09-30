import { body, param, query } from 'express-validator';

export const listMoviesValidator = [
  query('search').optional().trim().isLength({ max: 100 }),
  query('genre').optional().trim().isLength({ min: 1, max: 50 }),
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 50 }).toInt(),
];

export const movieIdValidator = [
  param('id').isUUID().withMessage('Movie id must be a valid UUID.'),
];

const movieFields = [
  body('title').trim().isLength({ min: 1, max: 150 }),
  body('description').trim().isLength({ min: 1, max: 2000 }),
  body('genre').trim().isLength({ min: 1, max: 50 }),
  body('director').trim().isLength({ min: 1, max: 100 }),
  body('releaseDate').isISO8601({ strict: true, strictSeparator: true }),
  body('classification').trim().isLength({ min: 1, max: 20 }),
  body('runtimeMinutes').isInt({ min: 1, max: 1000 }).toInt(),
  body('priceCents').isInt({ min: 0 }).toInt(),
  body('stock').isInt({ min: 0 }).toInt(),
  body('status').optional().isIn(['ACTIVE', 'DISCONTINUED']),
];

export const createMovieValidator = movieFields;
export const updateMovieValidator = [...movieIdValidator, ...movieFields];
