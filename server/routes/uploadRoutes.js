import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadImage, serveUpload, serveThumbnail, updateUploadMetadata, deleteUpload } from '../controllers/uploadController.js';
import { protect } from '../middleware/auth.js';
import { uploadRateLimiter } from '../middleware/rateLimiter.js';
import { ensureUploaderOrAdmin } from '../middleware/permission.js';

const router = express.Router();

// multer memory storage (we stream processed buffers into GridFS)
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 12 * 1024 * 1024 } // 12MB limit (tweak as needed)
});

// POST /api/uploads
// Protected: user must be authenticated
router.post('/', protect, uploadRateLimiter, upload.single('file'), uploadImage);

// GET original file by upload id
router.get('/:id', serveUpload);

// GET thumbnail by size (small|medium|large)
router.get('/:id/thumbnail/:size', serveThumbnail);

// PATCH metadata (alt/caption/display)
router.patch('/:id/metadata', protect, updateUploadMetadata);

//delete upload (protected; only owner or admin)
router.delete('/:id', protect, ensureUploaderOrAdmin, deleteUpload);

export default router;