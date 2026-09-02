import type { Movie, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';

export type MovieInput = {
  title: string;
  description: string;
  genre: string;
  director: string;
  releaseDate: string;
  classification: string;
  runtimeMinutes: number;
  priceCents: number;
  stock: number;
  status?: 'ACTIVE' | 'DISCONTINUED';
};

function serializeMovie(movie: Movie) {
  return {
    movieId: movie.movieId,
    title: movie.title,
    description: movie.description,
    genre: movie.genre,
    director: movie.director,
    releaseDate: movie.releaseDate.toISOString().slice(0, 10),
    classification: movie.classification,
    runtimeMinutes: movie.runtimeMinutes,
    priceCents: movie.priceCents,
    stock: movie.stock,
    status: movie.status,
    posterUrl: null,
    createdAt: movie.createdAt,
    updatedAt: movie.updatedAt,
  };
}

export async function listMovies(input: {
  search?: string;
  genre?: string;
  page: number;
  limit: number;
}) {
  const where: Prisma.MovieWhereInput = {
    status: 'ACTIVE',
    ...(input.genre ? { genre: input.genre } : {}),
    ...(input.search
      ? {
          OR: [
            { title: { contains: input.search } },
            { director: { contains: input.search } },
            { genre: { contains: input.search } },
          ],
        }
      : {}),
  };

  const [movies, total] = await prisma.$transaction([
    prisma.movie.findMany({
      where,
      orderBy: { title: 'asc' },
      skip: (input.page - 1) * input.limit,
      take: input.limit,
    }),
    prisma.movie.count({ where }),
  ]);

  return {
    data: movies.map(serializeMovie),
    meta: {
      page: input.page,
      limit: input.limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / input.limit)),
    },
  };
}

export async function getMovie(movieId: string) {
  const movie = await prisma.movie.findUnique({ where: { movieId } });
  if (!movie) throw new AppError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
  return serializeMovie(movie);
}

export async function createMovie(input: MovieInput) {
  const movie = await prisma.movie.create({
    data: {
      ...input,
      releaseDate: new Date(`${input.releaseDate}T00:00:00.000Z`),
      status: input.status ?? 'ACTIVE',
    },
  });
  return serializeMovie(movie);
}

export async function updateMovie(movieId: string, input: MovieInput) {
  await getMovie(movieId);
  const movie = await prisma.movie.update({
    where: { movieId },
    data: {
      ...input,
      releaseDate: new Date(`${input.releaseDate}T00:00:00.000Z`),
    },
  });
  return serializeMovie(movie);
}

export async function discontinueMovie(movieId: string) {
  await getMovie(movieId);
  const movie = await prisma.movie.update({
    where: { movieId },
    data: { status: 'DISCONTINUED' },
  });
  return serializeMovie(movie);
}
