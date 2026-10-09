import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'node:crypto';
import type {
  IdentityClaims,
  IdentityProvider,
  RegisterIdentityInput,
} from './identity-provider.js';
import { IdentityProviderError } from './identity-provider.js';

type LocalAccount = {
  sub: string;
  email: string;
  passwordHash: string;
};

export class LocalIdentityProvider implements IdentityProvider {
  private readonly accounts = new Map<string, LocalAccount>();
  private readonly resetCodes = new Map<string, { code: string; expiresAt: number }>();

  constructor(private readonly secret: string) {}

  async register(input: RegisterIdentityInput): Promise<{ sub: string }> {
    const email = input.email.toLowerCase();
    if (this.accounts.has(email)) {
      throw new IdentityProviderError(
        'DUPLICATE_ACCOUNT',
        'An account with this email already exists.',
      );
    }

    const account = {
      sub: randomUUID(),
      email,
      passwordHash: await bcrypt.hash(input.password, 10),
    };
    this.accounts.set(email, account);
    return { sub: account.sub };
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    const account = this.accounts.get(email.toLowerCase());
    if (!account || !(await bcrypt.compare(password, account.passwordHash))) {
      throw new IdentityProviderError(
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    }

    return {
      token: jwt.sign(
        { email: account.email },
        this.secret,
        { subject: account.sub, expiresIn: '24h' },
      ),
    };
  }

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    await this.login(email, currentPassword);
    const account = this.accounts.get(email.toLowerCase())!;
    account.passwordHash = await bcrypt.hash(newPassword, 10);
  }

  async requestPasswordReset(email: string): Promise<void> {
    const key = email.toLowerCase();
    if (!this.accounts.has(key)) return;
    const code = String(Math.floor(100000 + Math.random() * 900000));
    this.resetCodes.set(key, { code, expiresAt: Date.now() + 15 * 60 * 1000 });
    // There is no email service locally, so the code is printed here instead.
    console.info(`[local identity] password reset code for ${key}: ${code}`);
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    const key = email.toLowerCase();
    const entry = this.resetCodes.get(key);
    const account = this.accounts.get(key);
    if (!entry || !account || entry.code !== code || entry.expiresAt < Date.now()) {
      throw new IdentityProviderError('INVALID_CODE', 'The code is incorrect or has expired.');
    }
    account.passwordHash = await bcrypt.hash(newPassword, 10);
    this.resetCodes.delete(key);
  }

  async verify(token: string): Promise<IdentityClaims> {
    try {
      const payload = jwt.verify(token, this.secret);
      if (typeof payload === 'string' || !payload.sub) throw new Error();
      return {
        sub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
    } catch {
      throw new IdentityProviderError('INVALID_CREDENTIALS', 'Token is invalid or expired.');
    }
  }
}
