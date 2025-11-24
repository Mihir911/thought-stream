import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { uploadImage, deleteUpload } from '../controllers/uploadController.js';
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

//delete upload (protected; only owner or admin)
router.delete('/:id', protect, ensureUploaderOrAdmin, deleteUpload);

export default router;