export type IdentityClaims = {
  sub: string;
  email?: string;
};

export type RegisterIdentityInput = {
  email: string;
  password: string;
  name: string;
};

export interface IdentityProvider {
  register(input: RegisterIdentityInput): Promise<{ sub: string }>;
  login(email: string, password: string): Promise<{ token: string }>;
  verify(token: string): Promise<IdentityClaims>;
}

export class IdentityProviderError extends Error {
  constructor(
    public readonly code: 'DUPLICATE_ACCOUNT' | 'INVALID_CREDENTIALS' | 'PROVIDER_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'IdentityProviderError';
  }
}
