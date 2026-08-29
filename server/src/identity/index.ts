import { env } from '../config/env.js';
import { CognitoIdentityProvider } from './cognito-identity-provider.js';
import type { IdentityProvider } from './identity-provider.js';
import { LocalIdentityProvider } from './local-identity-provider.js';

function createIdentityProvider(): IdentityProvider {
  if (env.IDENTITY_PROVIDER === 'cognito') {
    return new CognitoIdentityProvider(
      env.AWS_REGION!,
      env.COGNITO_USER_POOL_ID!,
      env.COGNITO_CLIENT_ID!,
    );
  }
  return new LocalIdentityProvider(env.LOCAL_JWT_SECRET!);
}

export const identityProvider = createIdentityProvider();
