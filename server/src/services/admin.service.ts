import { prisma } from '../db/prisma.js';
import { AppError } from '../utils/AppError.js';
import * as orderService from './order.service.js';

const LOW_STOCK_THRESHOLD = 5;
const USER_STATUSES = ['ACTIVE', 'INACTIVE'];

export async function getDashboard() {
  const [movieCount, activeMovieCount, lowStockCount, userCount, orderAggregate, recentOrders] = await Promise.all([
    prisma.movie.count(),
    prisma.movie.count({ where: { status: 'ACTIVE' } }),
    prisma.movie.count({ where: { status: 'ACTIVE', stock: { lte: LOW_STOCK_THRESHOLD } } }),
    prisma.user.count(),
    prisma.order.aggregate({
      where: { status: 'PAID' },
      _count: { orderId: true },
      _sum: { totalCents: true },
    }),
    prisma.order.findMany({
      where: { status: 'PAID' },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  return {
    movieCount,
    activeMovieCount,
    lowStockCount,
    userCount,
    orderCount: orderAggregate._count.orderId,
    revenueCents: orderAggregate._sum.totalCents ?? 0,
    recentOrders: recentOrders.map((order) => ({
      orderId: order.orderId,
      totalCents: order.totalCents,
      createdAt: order.createdAt,
      customerName: order.user.name,
      customerEmail: order.user.email,
    })),
  };
}

export async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      orders: {
        where: { status: 'PAID' },
        select: { totalCents: true },
      },
    },
  });

  return users.map((user) => ({
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    orderCount: user.orders.length,
    totalSpentCents: user.orders.reduce((sum, order) => sum + order.totalCents, 0),
  }));
}

export async function getUserDetail(userId: string) {
  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'This user account was not found.');
  }

  const orders = user.role === 'ADMIN' ? [] : await orderService.listOrders(userId);

  return {
    userId: user.userId,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
    createdAt: user.createdAt,
    orderCount: orders.length,
    totalSpentCents: orders.reduce((sum, order) => sum + order.totalCents, 0),
    orders,
  };
}

export async function updateUserStatus(userId: string, status: string, actingUserId: string) {
  if (!USER_STATUSES.includes(status)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Status must be either ACTIVE or INACTIVE.');
  }

  const user = await prisma.user.findUnique({ where: { userId } });
  if (!user) {
    throw new AppError(404, 'USER_NOT_FOUND', 'This user account was not found.');
  }
  if (user.role === 'ADMIN') {
    throw new AppError(400, 'CANNOT_UPDATE_ADMIN', 'Administrator accounts cannot be deactivated.');
  }
  if (userId === actingUserId) {
    throw new AppError(400, 'CANNOT_UPDATE_SELF', 'You cannot change the status of your own account.');
  }

  const updated = await prisma.user.update({ where: { userId }, data: { status } });
  return { userId: updated.userId, status: updated.status };
}

export async function getOrders() {
  const orders = await prisma.order.findMany({
    where: { status: 'PAID' },
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { name: true, email: true } },
      details: { select: { quantity: true } },
    },
  });

  return orders.map((order) => ({
    orderId: order.orderId,
    customerName: order.user.name,
    customerEmail: order.user.email,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    itemCount: order.details.reduce((sum, detail) => sum + detail.quantity, 0),
  }));
}

export async function getOrderDetail(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { orderId },
    include: {
      user: { select: { name: true, email: true } },
      details: { include: { movie: { select: { posterUrl: true } } } },
    },
  });
  if (!order || order.status !== 'PAID') {
    throw new AppError(404, 'ORDER_NOT_FOUND', 'This order was not found.');
  }

  return {
    orderId: order.orderId,
    customerName: order.user.name,
    customerEmail: order.user.email,
    totalCents: order.totalCents,
    createdAt: order.createdAt,
    details: order.details.map((detail) => ({
      id: detail.id,
      movieId: detail.movieId,
      title: detail.title,
      quantity: detail.quantity,
      unitPriceCents: detail.unitPriceCents,
      posterUrl: detail.movie.posterUrl,
    })),
  };
}
