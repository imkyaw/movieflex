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
