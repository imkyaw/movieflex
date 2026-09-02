import type { RequestHandler } from 'express';
import * as movieService from '../services/movie.service.js';

export const listMovies: RequestHandler = async (req, res) => {
  const search = Array.isArray(req.query.search) ? req.query.search[0] : req.query.search;
  const genre = Array.isArray(req.query.genre) ? req.query.genre[0] : req.query.genre;
  const result = await movieService.listMovies({
    search: typeof search === 'string' ? search : undefined,
    genre: typeof genre === 'string' ? genre : undefined,
    page: Number(req.query.page ?? 1),
    limit: Number(req.query.limit ?? 12),
  });
  res.status(200).json(result);
};

export const getMovie: RequestHandler = async (req, res) => {
  res.status(200).json(await movieService.getMovie(String(req.params.id)));
};

export const createMovie: RequestHandler = async (req, res) => {
  res.status(201).json(await movieService.createMovie(req.body as movieService.MovieInput));
};

export const updateMovie: RequestHandler = async (req, res) => {
  res.status(200).json(
    await movieService.updateMovie(String(req.params.id), req.body as movieService.MovieInput),
  );
};

export const discontinueMovie: RequestHandler = async (req, res) => {
  res.status(200).json(await movieService.discontinueMovie(String(req.params.id)));
};
