import { prisma } from '../db/prisma.js';

const LOW_STOCK_THRESHOLD = 5;

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
