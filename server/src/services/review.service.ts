import type { Review } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';

type ReviewWithUser = Review & { user: { name: string } };

function serializeReview(review: ReviewWithUser) {
  return {
    reviewId: review.reviewId,
    movieId: review.movieId,
    userId: review.userId,
    userName: review.user.name,
    rating: review.rating,
    comment: review.comment,
    createdAt: review.createdAt,
    updatedAt: review.updatedAt,
  };
}

async function requireMovie(movieId: string) {
  const movie = await prisma.movie.findUnique({ where: { movieId } });
  if (!movie) throw new AppError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
}

export async function listReviews(movieId: string) {
  await requireMovie(movieId);

  const reviews = await prisma.review.findMany({
    where: { movieId },
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { name: true } } },
  });

  const count = reviews.length;
  const average = count === 0 ? 0 : Math.round((reviews.reduce((sum, review) => sum + review.rating, 0) / count) * 10) / 10;

  return { data: reviews.map(serializeReview), meta: { count, average } };
}

export async function upsertReview(movieId: string, userId: string, input: { rating: number; comment: string }) {
  await requireMovie(movieId);

  const review = await prisma.review.upsert({
    where: { movieId_userId: { movieId, userId } },
    create: { movieId, userId, rating: input.rating, comment: input.comment },
    update: { rating: input.rating, comment: input.comment },
    include: { user: { select: { name: true } } },
  });

  return serializeReview(review);
}
