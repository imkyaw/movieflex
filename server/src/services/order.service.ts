import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';

export type CheckoutItem = { movieId: string; quantity: number };

export async function checkout(userId: string, items: CheckoutItem[]) {
  const merged = new Map<string, number>();
  for (const item of items) {
    merged.set(item.movieId, (merged.get(item.movieId) ?? 0) + item.quantity);
  }

  return prisma.$transaction(async (tx) => {
    const details: { movieId: string; title: string; quantity: number; unitPriceCents: number }[] = [];
    let totalCents = 0;

    for (const [movieId, quantity] of merged) {
      const movie = await tx.movie.findUnique({ where: { movieId } });
      if (!movie || movie.status !== 'ACTIVE') {
        throw new AppError(404, 'MOVIE_NOT_FOUND', 'One of the movies in your cart is no longer available.');
      }
      if (movie.stock < quantity) {
        throw new AppError(
          409,
          'INSUFFICIENT_STOCK',
          `Only ${movie.stock} left in stock for “${movie.title}”.`,
        );
      }

      const updated = await tx.movie.updateMany({
        where: { movieId, stock: { gte: quantity } },
        data: { stock: { decrement: quantity } },
      });
      if (updated.count === 0) {
        throw new AppError(
          409,
          'INSUFFICIENT_STOCK',
          `Only a few copies of “${movie.title}” are left. Please review your cart.`,
        );
      }

      details.push({ movieId, title: movie.title, quantity, unitPriceCents: movie.priceCents });
      totalCents += movie.priceCents * quantity;
    }

    return tx.order.create({
      data: {
        userId,
        totalCents,
        details: { create: details },
      },
      include: { details: true },
    });
  });
}

export async function listOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { details: true },
  });
}

export async function returnItem(userId: string, orderId: string, itemId: string) {
  return prisma.$transaction(async (tx) => {
    const detail = await tx.orderDetail.findUnique({ where: { id: itemId } });
    if (!detail || detail.orderId !== orderId) {
      throw new AppError(404, 'RENTAL_ITEM_NOT_FOUND', 'Rental item not found.');
    }

    const order = await tx.order.findUnique({ where: { orderId } });
    if (!order || order.userId !== userId) {
      throw new AppError(404, 'RENTAL_ITEM_NOT_FOUND', 'Rental item not found.');
    }

    if (detail.returnedAt) {
      throw new AppError(409, 'ALREADY_RETURNED', 'This rental has already been returned.');
    }

    const updated = await tx.orderDetail.update({
      where: { id: itemId },
      data: { returnedAt: new Date() },
    });

    await tx.movie.update({
      where: { movieId: detail.movieId },
      data: { stock: { increment: detail.quantity } },
    });

    return updated;
  });
}
