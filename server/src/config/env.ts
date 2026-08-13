import { config as loadDotenv } from 'dotenv';
import { resolve } from 'node:path';

loadDotenv({ path: resolve(process.cwd(), '.env') });

type NodeEnv = 'development' | 'test' | 'production';

export type Env = {
  NODE_ENV: NodeEnv;
  PORT: number;
  CLIENT_ORIGIN: string;
  DATABASE_URL: string;
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

function loadEnv(): Env {
  return {
    NODE_ENV: parseNodeEnv(requireString('NODE_ENV')),
    PORT: parsePort(requireString('PORT')),
    CLIENT_ORIGIN: requireString('CLIENT_ORIGIN'),
    DATABASE_URL: requireString('DATABASE_URL'),
  };
}

export const env: Env = loadEnv();
