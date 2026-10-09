import {
  AdminConfirmSignUpCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
  ForgotPasswordCommand,
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

  async changePassword(email: string, currentPassword: string, newPassword: string): Promise<void> {
    // Prove the user knows the current password before replacing it.
    await this.login(email, currentPassword);
    try {
      await this.client.send(
        new AdminSetUserPasswordCommand({
          UserPoolId: this.userPoolId,
          Username: email,
          Password: newPassword,
          Permanent: true,
        }),
      );
    } catch {
      throw new IdentityProviderError('PROVIDER_ERROR', 'Unable to change the password.');
    }
  }

  async requestPasswordReset(email: string): Promise<void> {
    const sendCode = () =>
      this.client.send(new ForgotPasswordCommand({ ClientId: this.clientId, Username: email }));
    try {
      await sendCode();
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      // Unknown or unusable accounts look the same as success, so emails cannot be probed.
      if (name === 'UserNotFoundException' || name === 'NotAuthorizedException') return;
      if (name === 'InvalidParameterException') {
        // Sign-up confirms accounts itself, so the email may not be marked verified yet.
        // Cognito only sends codes to verified emails, and the code goes to this address anyway.
        try {
          await this.client.send(
            new AdminUpdateUserAttributesCommand({
              UserPoolId: this.userPoolId,
              Username: email,
              UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
            }),
          );
          await sendCode();
          return;
        } catch (retryError) {
          const retryName = retryError instanceof Error ? retryError.name : '';
          if (retryName === 'UserNotFoundException') return;
        }
      }
      if (name === 'LimitExceededException') {
        throw new IdentityProviderError(
          'PROVIDER_ERROR',
          'Too many attempts. Please wait a while and try again.',
        );
      }
      throw new IdentityProviderError('PROVIDER_ERROR', 'Unable to send the reset code.');
    }
  }

  async confirmPasswordReset(email: string, code: string, newPassword: string): Promise<void> {
    try {
      await this.client.send(
        new ConfirmForgotPasswordCommand({
          ClientId: this.clientId,
          Username: email,
          ConfirmationCode: code,
          Password: newPassword,
        }),
      );
    } catch (error) {
      const name = error instanceof Error ? error.name : '';
      if (
        name === 'CodeMismatchException' ||
        name === 'ExpiredCodeException' ||
        name === 'UserNotFoundException' ||
        name === 'NotAuthorizedException'
      ) {
        throw new IdentityProviderError('INVALID_CODE', 'The code is incorrect or has expired.');
      }
      if (name === 'InvalidPasswordException') {
        throw new IdentityProviderError('PROVIDER_ERROR', 'The new password does not meet the requirements.');
      }
      if (name === 'LimitExceededException' || name === 'TooManyFailedAttemptsException') {
        throw new IdentityProviderError(
          'PROVIDER_ERROR',
          'Too many attempts. Please wait a while and try again.',
        );
      }
      throw new IdentityProviderError('PROVIDER_ERROR', 'Unable to reset the password.');
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
