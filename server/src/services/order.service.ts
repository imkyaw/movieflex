import type { Order, OrderDetail, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';

type DetailMovie = { posterUrl: string | null; genre: string; classification: string; releaseDate: Date; stock: number };
type OrderWithDetails = Order & { details: (OrderDetail & { movie: DetailMovie })[] };

const detailMovieSelect = { posterUrl: true, genre: true, classification: true, releaseDate: true, stock: true } as const;
const cartInclude = { details: { include: { movie: { select: detailMovieSelect } } } } as const;

function serializeOrder(order: OrderWithDetails) {
  return {
    orderId: order.orderId,
    userId: order.userId,
    totalCents: order.totalCents,
    status: order.status,
    createdAt: order.createdAt,
    details: order.details.map((detail) => ({
      id: detail.id,
      orderId: detail.orderId,
      movieId: detail.movieId,
      title: detail.title,
      quantity: detail.quantity,
      unitPriceCents: detail.unitPriceCents,
      posterUrl: detail.movie.posterUrl,
      genre: detail.movie.genre,
      classification: detail.movie.classification,
      releaseDate: detail.movie.releaseDate.toISOString().slice(0, 10),
      stock: detail.movie.stock,
    })),
  };
}

async function recalculateTotal(tx: Prisma.TransactionClient, orderId: string) {
  const details = await tx.orderDetail.findMany({ where: { orderId } });
  const totalCents = details.reduce((sum, detail) => sum + detail.unitPriceCents * detail.quantity, 0);
  await tx.order.update({ where: { orderId }, data: { totalCents } });
}

async function findOrCreateCart(userId: string) {
  const existing = await prisma.order.findFirst({ where: { userId, status: 'CART' } });
  if (existing) return existing;
  return prisma.order.create({ data: { userId, status: 'CART', totalCents: 0 } });
}

export async function getCart(userId: string) {
  const cart = await findOrCreateCart(userId);
  const full = await prisma.order.findUniqueOrThrow({
    where: { orderId: cart.orderId },
    include: cartInclude,
  });
  return serializeOrder(full);
}

export async function addCartItem(userId: string, movieId: string, quantity: number) {
  const movie = await prisma.movie.findUnique({ where: { movieId } });
  if (!movie || movie.status !== 'ACTIVE') {
    throw new AppError(404, 'MOVIE_NOT_FOUND', 'This movie is not available.');
  }

  const cart = await findOrCreateCart(userId);

  await prisma.$transaction(async (tx) => {
    const existingDetail = await tx.orderDetail.findUnique({
      where: { orderId_movieId: { orderId: cart.orderId, movieId } },
    });
    const nextQuantity = Math.min((existingDetail?.quantity ?? 0) + quantity, movie.stock);
    if (nextQuantity <= 0) {
      throw new AppError(409, 'OUT_OF_STOCK', `“${movie.title}” is out of stock.`);
    }

    if (existingDetail) {
      await tx.orderDetail.update({
        where: { id: existingDetail.id },
        data: { quantity: nextQuantity, unitPriceCents: movie.priceCents, title: movie.title },
      });
    } else {
      await tx.orderDetail.create({
        data: {
          orderId: cart.orderId,
          movieId,
          title: movie.title,
          quantity: nextQuantity,
          unitPriceCents: movie.priceCents,
        },
      });
    }

    await recalculateTotal(tx, cart.orderId);
  });

  return getCart(userId);
}

export async function updateCartItem(userId: string, movieId: string, quantity: number) {
  const cart = await findOrCreateCart(userId);
  const detail = await prisma.orderDetail.findUnique({
    where: { orderId_movieId: { orderId: cart.orderId, movieId } },
  });
  if (!detail) throw new AppError(404, 'CART_ITEM_NOT_FOUND', 'This movie is not in your cart.');

  const movie = await prisma.movie.findUniqueOrThrow({ where: { movieId } });
  const cappedQuantity = Math.min(quantity, movie.stock);

  await prisma.$transaction(async (tx) => {
    if (cappedQuantity <= 0) {
      await tx.orderDetail.delete({ where: { id: detail.id } });
    } else {
      await tx.orderDetail.update({ where: { id: detail.id }, data: { quantity: cappedQuantity } });
    }
    await recalculateTotal(tx, cart.orderId);
  });

  return getCart(userId);
}

export async function removeCartItem(userId: string, movieId: string) {
  const cart = await findOrCreateCart(userId);
  await prisma.$transaction(async (tx) => {
    await tx.orderDetail.deleteMany({ where: { orderId: cart.orderId, movieId } });
    await recalculateTotal(tx, cart.orderId);
  });
  return getCart(userId);
}

export async function checkout(userId: string) {
  const cart = await findOrCreateCart(userId);
  const details = await prisma.orderDetail.findMany({ where: { orderId: cart.orderId } });
  if (details.length === 0) {
    throw new AppError(400, 'CART_EMPTY', 'Your cart is empty.');
  }

  await prisma.$transaction(async (tx) => {
    for (const detail of details) {
      const movie = await tx.movie.findUnique({ where: { movieId: detail.movieId } });
      if (!movie || movie.status !== 'ACTIVE') {
        throw new AppError(404, 'MOVIE_NOT_FOUND', `“${detail.title}” is no longer available.`);
      }
      if (movie.stock < detail.quantity) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', `Only ${movie.stock} left in stock for “${movie.title}”.`);
      }
      const updated = await tx.movie.updateMany({
        where: { movieId: detail.movieId, stock: { gte: detail.quantity } },
        data: { stock: { decrement: detail.quantity } },
      });
      if (updated.count === 0) {
        throw new AppError(409, 'INSUFFICIENT_STOCK', `Only a few copies of “${movie.title}” are left. Please review your cart.`);
      }
    }

    await tx.order.update({
      where: { orderId: cart.orderId },
      data: { status: 'PAID', createdAt: new Date() },
    });
  });

  const paid = await prisma.order.findUniqueOrThrow({
    where: { orderId: cart.orderId },
    include: cartInclude,
  });
  return serializeOrder(paid);
}

export async function listOrders(userId: string) {
  const orders = await prisma.order.findMany({
    where: { userId, status: { not: 'CART' } },
    orderBy: { createdAt: 'desc' },
    include: cartInclude,
  });

  return orders.map(serializeOrder);
}
