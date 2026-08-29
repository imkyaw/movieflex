import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(process.cwd(), '.env') });

type NodeEnv = 'development' | 'test' | 'production';
type IdentityProviderName = 'local' | 'cognito';

export type Env = {
  NODE_ENV: NodeEnv;
  PORT: number;
  CLIENT_ORIGIN: string;
  DATABASE_URL: string;
  IDENTITY_PROVIDER: IdentityProviderName;
  LOCAL_JWT_SECRET?: string;
  AWS_REGION?: string;
  COGNITO_USER_POOL_ID?: string;
  COGNITO_CLIENT_ID?: string;
};

function requireString(name: string): string {
  const value = process.env[name];
  if (value === undefined || value.trim() === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value.trim();
}

function parseNodeEnv(value: string): NodeEnv {
  if (value === 'development' || value === 'test' || value === 'production') {
    return value;
  }
  throw new Error(
    `Invalid NODE_ENV "${value}". Expected development | test | production.`,
  );
}

function parsePort(value: string): number {
  const port = Number(value);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error(`Invalid PORT "${value}". Expected an integer 1–65535.`);
  }
  return port;
}

function optionalString(name: string): string | undefined {
  const value = process.env[name]?.trim();
  return value === '' ? undefined : value;
}

function parseIdentityProvider(value: string): IdentityProviderName {
  if (value === 'local' || value === 'cognito') return value;
  throw new Error(
    `Invalid IDENTITY_PROVIDER "${value}". Expected local | cognito.`,
  );
}

function loadEnv(): Env {
  const identityProvider = parseIdentityProvider(
    requireString('IDENTITY_PROVIDER'),
  );
  const localJwtSecret = optionalString('LOCAL_JWT_SECRET');
  const awsRegion = optionalString('AWS_REGION');
  const cognitoUserPoolId = optionalString('COGNITO_USER_POOL_ID');
  const cognitoClientId = optionalString('COGNITO_CLIENT_ID');

  if (identityProvider === 'local' && (localJwtSecret?.length ?? 0) < 32) {
    throw new Error('LOCAL_JWT_SECRET must contain at least 32 characters.');
  }

  if (
    identityProvider === 'cognito' &&
    (!awsRegion || !cognitoUserPoolId || !cognitoClientId)
  ) {
    throw new Error(
      'AWS_REGION, COGNITO_USER_POOL_ID and COGNITO_CLIENT_ID are required for Cognito.',
    );
  }

  return {
    NODE_ENV: parseNodeEnv(requireString('NODE_ENV')),
    PORT: parsePort(requireString('PORT')),
    CLIENT_ORIGIN: requireString('CLIENT_ORIGIN'),
    DATABASE_URL: requireString('DATABASE_URL'),
    IDENTITY_PROVIDER: identityProvider,
    LOCAL_JWT_SECRET: localJwtSecret,
    AWS_REGION: awsRegion,
    COGNITO_USER_POOL_ID: cognitoUserPoolId,
    COGNITO_CLIENT_ID: cognitoClientId,
  };
}

export const env: Env = loadEnv();
