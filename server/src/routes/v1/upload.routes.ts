import { Router } from 'express';
import * as uploadController from '../../controllers/upload.controller.js';
import { requireAdmin, requireAuth } from '../../middleware/auth.middleware.js';
import { uploadPosterFile } from '../../middleware/upload.middleware.js';

export const uploadRouter = Router();

uploadRouter.post('/poster', requireAuth, requireAdmin, uploadPosterFile, uploadController.uploadPoster);
