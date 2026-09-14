import type { User } from '@prisma/client';
import { prisma } from '../db/prisma.js';

function serializeUser(user: User) {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });
  return users.map(serializeUser);
}
