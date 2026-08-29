import {
  AdminConfirmSignUpCommand,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
  SignUpCommand,
} from '@aws-sdk/client-cognito-identity-provider';
import { CognitoJwtVerifier } from 'aws-jwt-verify';
import type {
  IdentityClaims,
  IdentityProvider,
  RegisterIdentityInput,
} from './identity-provider.js';
import { IdentityProviderError } from './identity-provider.js';

export class CognitoIdentityProvider implements IdentityProvider {
  private readonly client: CognitoIdentityProviderClient;
  private readonly verifier;

  constructor(
    region: string,
    private readonly userPoolId: string,
    private readonly clientId: string,
  ) {
    this.client = new CognitoIdentityProviderClient({ region });
    this.verifier = CognitoJwtVerifier.create({
      userPoolId,
      clientId,
      tokenUse: 'id',
    });
  }

  async register(input: RegisterIdentityInput): Promise<{ sub: string }> {
    try {
      const result = await this.client.send(
        new SignUpCommand({
          ClientId: this.clientId,
          Username: input.email,
          Password: input.password,
          UserAttributes: [
            { Name: 'email', Value: input.email },
            { Name: 'name', Value: input.name },
          ],
        }),
      );
      if (!result.UserSub) throw new Error('Cognito did not return a user sub.');

      await this.client.send(
        new AdminConfirmSignUpCommand({
          UserPoolId: this.userPoolId,
          Username: input.email,
        }),
      );
      return { sub: result.UserSub };
    } catch (error) {
      if (error instanceof Error && error.name === 'UsernameExistsException') {
        throw new IdentityProviderError(
          'DUPLICATE_ACCOUNT',
          'An account with this email already exists.',
        );
      }
      throw new IdentityProviderError('PROVIDER_ERROR', 'Unable to create the account.');
    }
  }

  async login(email: string, password: string): Promise<{ token: string }> {
    try {
      const result = await this.client.send(
        new InitiateAuthCommand({
          ClientId: this.clientId,
          AuthFlow: 'USER_PASSWORD_AUTH',
          AuthParameters: { USERNAME: email, PASSWORD: password },
        }),
      );
      const token = result.AuthenticationResult?.IdToken;
      if (!token) throw new Error('Cognito did not return an ID token.');
      return { token };
    } catch {
      throw new IdentityProviderError(
        'INVALID_CREDENTIALS',
        'Email or password is incorrect.',
      );
    }
  }

  async verify(token: string): Promise<IdentityClaims> {
    try {
      const payload = await this.verifier.verify(token);
      return {
        sub: payload.sub,
        email: typeof payload.email === 'string' ? payload.email : undefined,
      };
    } catch {
      throw new IdentityProviderError('INVALID_CREDENTIALS', 'Token is invalid or expired.');
    }
  }
}
