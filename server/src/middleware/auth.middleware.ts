import type { RequestHandler } from 'express';
import { prisma } from '../db/prisma.js';
import { identityProvider } from '../identity/index.js';
import { AppError } from '../utils/AppError.js';

export const requireAuth: RequestHandler = async (req, _res, next) => {
  const authorization = req.header('authorization');
  if (!authorization?.startsWith('Bearer ')) {
    next(new AppError(401, 'AUTH_REQUIRED', 'A valid bearer token is required.'));
    return;
  }

  try {
    const claims = await identityProvider.verify(authorization.slice(7));
    const user = await prisma.user.findUnique({
      where: { cognitoSub: claims.sub },
    });
    if (!user) {
      next(new AppError(401, 'LOCAL_USER_NOT_FOUND', 'Application account not found.'));
      return;
    }
    req.user = user;
    next();
  } catch {
    next(new AppError(401, 'INVALID_TOKEN', 'Token is invalid or expired.'));
  }
};

export const requireAdmin: RequestHandler = (req, _res, next) => {
  if (!req.user) {
    next(new AppError(401, 'AUTH_REQUIRED', 'Authentication is required.'));
    return;
  }
  if (req.user.role !== 'ADMIN') {
    next(new AppError(403, 'ADMIN_REQUIRED', 'Administrator access is required.'));
    return;
  }
  next();
};
