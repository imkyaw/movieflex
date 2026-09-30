import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { isSupportedPosterMimeType } from '../services/upload.service.js';

const POSTER_MAX_BYTES = 5 * 1024 * 1024;

export const uploadPosterFile = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: POSTER_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedPosterMimeType(file.mimetype)) {
      cb(new AppError(400, 'UNSUPPORTED_FILE_TYPE', 'Only JPEG or PNG images are allowed.'));
      return;
    }
    cb(null, true);
  },
}).single('file');
