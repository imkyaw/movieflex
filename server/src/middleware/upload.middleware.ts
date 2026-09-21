import multer from 'multer';
import { AppError } from '../utils/AppError.js';
import { isSupportedPosterMimeType, posterFilename, postersDir } from '../services/upload.service.js';

const POSTER_MAX_BYTES = 5 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, postersDir),
  filename: (_req, file, cb) => cb(null, posterFilename(file.mimetype)),
});

export const uploadPosterFile = multer({
  storage,
  limits: { fileSize: POSTER_MAX_BYTES },
  fileFilter: (_req, file, cb) => {
    if (!isSupportedPosterMimeType(file.mimetype)) {
      cb(new AppError(400, 'UNSUPPORTED_FILE_TYPE', 'Only JPEG or PNG images are allowed.'));
      return;
    }
    cb(null, true);
  },
}).single('file');
