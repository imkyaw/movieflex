import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
import { serializeMovie } from './movie.service.js';

async function requireMovie(movieId: string) {
  const movie = await prisma.movie.findUnique({ where: { movieId } });
  if (!movie) throw new AppError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
}

export async function listWatchlist(userId: string) {
  const items = await prisma.watchlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { movie: true },
  });
  return items.map((item) => serializeMovie(item.movie));
}

export async function addToWatchlist(userId: string, movieId: string) {
  await requireMovie(movieId);
  await prisma.watchlistItem.upsert({
    where: { userId_movieId: { userId, movieId } },
    create: { userId, movieId },
    update: {},
  });
}

export async function removeFromWatchlist(userId: string, movieId: string) {
  await prisma.watchlistItem.deleteMany({ where: { userId, movieId } });
}
