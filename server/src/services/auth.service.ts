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

function isConfiguredAdmin(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email.toLowerCase());
}

function mapIdentityError(error: unknown): never {
  if (error instanceof IdentityProviderError) {
    if (error.code === 'DUPLICATE_ACCOUNT') {
      throw new AppError(409, 'EMAIL_IN_USE', error.message);
    }
    if (error.code === 'INVALID_CREDENTIALS') {
      throw new AppError(401, 'INVALID_CREDENTIALS', error.message);
    }
    if (error.code === 'INVALID_CODE') {
      throw new AppError(400, 'INVALID_RESET_CODE', error.message);
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
            ...(isConfiguredAdmin(email) && { role: 'ADMIN' }),
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
    let user = await prisma.user.findUnique({
      where: { cognitoSub: claims.sub },
    });
    if (!user) {
      throw new AppError(401, 'LOCAL_USER_NOT_FOUND', 'Application account not found.');
    }
    if (user.status === 'INACTIVE') {
      throw new AppError(403, 'ACCOUNT_INACTIVE', 'This account has been deactivated.');
    }
    if (user.role !== 'ADMIN' && isConfiguredAdmin(user.email)) {
      user = await prisma.user.update({
        where: { userId: user.userId },
        data: { role: 'ADMIN' },
      });
    }
    return { token, user: publicUser(user) };
  } catch (error) {
    mapIdentityError(error);
  }
}

export async function changePassword(
  user: User,
  input: { currentPassword: string; newPassword: string },
): Promise<void> {
  try {
    await identityProvider.changePassword(user.email, input.currentPassword, input.newPassword);
  } catch (error) {
    if (error instanceof IdentityProviderError && error.code === 'INVALID_CREDENTIALS') {
      throw new AppError(400, 'CURRENT_PASSWORD_INCORRECT', 'Your current password is incorrect.');
    }
    mapIdentityError(error);
  }
}

export async function forgotPassword(email: string): Promise<void> {
  try {
    await identityProvider.requestPasswordReset(email.toLowerCase());
  } catch (error) {
    mapIdentityError(error);
  }
}

export async function resetPassword(input: {
  email: string;
  code: string;
  newPassword: string;
}): Promise<void> {
  try {
    await identityProvider.confirmPasswordReset(
      input.email.toLowerCase(),
      input.code,
      input.newPassword,
    );
  } catch (error) {
    mapIdentityError(error);
  }
}

export function getProfile(user: User): PublicUser {
  return publicUser(user);
}

export async function updateProfile(user: User, input: { name: string }): Promise<PublicUser> {
  const updated = await prisma.user.update({
    where: { userId: user.userId },
    data: { name: input.name },
  });
  return publicUser(updated);
}
