import { mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { randomUUID } from 'node:crypto';

export const postersDir = resolve(process.cwd(), 'uploads', 'posters');
mkdirSync(postersDir, { recursive: true });

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
};

export function isSupportedPosterMimeType(mimeType: string): boolean {
  return mimeType in EXTENSION_BY_MIME_TYPE;
}

export function posterFilename(mimeType: string): string {
  return `${randomUUID()}${EXTENSION_BY_MIME_TYPE[mimeType]}`;
}

export function posterUrl(req: { protocol: string; get(name: string): string | undefined }, filename: string): string {
  return `${req.protocol}://${req.get('host')}/uploads/posters/${filename}`;
}
