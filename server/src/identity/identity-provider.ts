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
  changePassword(email: string, currentPassword: string, newPassword: string): Promise<void>;
  /** Sends a reset code to the account's email. Resolves quietly when no such account exists. */
  requestPasswordReset(email: string): Promise<void>;
  confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void>;
}

export class IdentityProviderError extends Error {
  constructor(
    public readonly code: 'DUPLICATE_ACCOUNT' | 'INVALID_CREDENTIALS' | 'INVALID_CODE' | 'PROVIDER_ERROR',
    message: string,
  ) {
    super(message);
    this.name = 'IdentityProviderError';
  }
}
