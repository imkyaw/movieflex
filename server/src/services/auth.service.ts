import type { User } from '@prisma/client';
import { prisma } from '../db/prisma.js';
import { env } from '../config/env.js';
import { identityProvider } from '../identity/index.js';
import { IdentityProviderError } from '../identity/identity-provider.js';
import { AppError } from '../utils/AppError.js';

type RegisterInput = { email: string; password: string; name: string };
type LoginInput = { email: string; password: string };

export type PublicUser = {
  userId: string;
  email: string;
  name: string;
  role: string;
  createdAt: Date;
};

function publicUser(user: User): PublicUser {
  return {
    userId: user.userId,
    email: user.email,
    name: user.name,
    role: user.role,
    createdAt: user.createdAt,
  };
}

function mapIdentityError(error: unknown): never {
  if (error instanceof IdentityProviderError) {
    if (error.code === 'DUPLICATE_ACCOUNT') {
      throw new AppError(409, 'EMAIL_IN_USE', error.message);
    }
    if (error.code === 'INVALID_CREDENTIALS') {
      throw new AppError(401, 'INVALID_CREDENTIALS', error.message);
    }
    throw new AppError(502, 'IDENTITY_PROVIDER_ERROR', error.message);
  }
  throw error;
}

export async function register(input: RegisterInput) {
  const email = input.email.toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && env.IDENTITY_PROVIDER === 'cognito') {
    throw new AppError(409, 'EMAIL_IN_USE', 'An account with this email already exists.');
  }

  try {
    const identity = await identityProvider.register({ ...input, email });
    const user = existing
      ? await prisma.user.update({
          where: { userId: existing.userId },
          data: { cognitoSub: identity.sub, name: input.name },
        })
      : await prisma.user.create({
          data: {
            cognitoSub: identity.sub,
            email,
            name: input.name,
          },
        });
    const { token } = await identityProvider.login(email, input.password);
    return { token, user: publicUser(user) };
  } catch (error) {
    mapIdentityError(error);
  }
}

export async function login(input: LoginInput) {
  try {
    const { token } = await identityProvider.login(
      input.email.toLowerCase(),
      input.password,
    );
    const claims = await identityProvider.verify(token);
    const user = await prisma.user.findUnique({
      where: { cognitoSub: claims.sub },
    });
    if (!user) {
      throw new AppError(401, 'LOCAL_USER_NOT_FOUND', 'Application account not found.');
    }
    return { token, user: publicUser(user) };
  } catch (error) {
    mapIdentityError(error);
  }
}

export function getProfile(user: User): PublicUser {
  return publicUser(user);
}
