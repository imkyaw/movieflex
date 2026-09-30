import { randomUUID } from 'node:crypto';
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '../config/env.js';
import { AppError } from '../utils/AppError.js';

const EXTENSION_BY_MIME_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
};
const POSTER_URL_TTL_SECONDS = 15 * 60;
const s3 = new S3Client({ region: env.AWS_REGION });

function bucketName(): string {
  if (!env.POSTER_BUCKET_NAME) {
    throw new AppError(503, 'STORAGE_NOT_CONFIGURED', 'Poster storage is not configured.');
  }
  return env.POSTER_BUCKET_NAME;
}

export function isSupportedPosterMimeType(mimeType: string): boolean {
  return mimeType in EXTENSION_BY_MIME_TYPE;
}

export async function uploadPoster(movieId: string, file: Express.Multer.File) {
  const extension = EXTENSION_BY_MIME_TYPE[file.mimetype];
  if (!extension) {
    throw new AppError(400, 'UNSUPPORTED_FILE_TYPE', 'Only JPEG or PNG images are allowed.');
  }

  const posterKey = `posters/${movieId}/${randomUUID()}.${extension}`;
  await s3.send(new PutObjectCommand({
    Bucket: bucketName(),
    Key: posterKey,
    Body: file.buffer,
    ContentType: file.mimetype,
  }));

  return { posterKey, posterUrl: await getPosterUrl(posterKey) };
}

export async function getPosterUrl(posterKey: string | null): Promise<string | null> {
  if (!posterKey) return null;
  return getSignedUrl(
    s3,
    new GetObjectCommand({ Bucket: bucketName(), Key: posterKey }),
    { expiresIn: POSTER_URL_TTL_SECONDS },
  );
}
