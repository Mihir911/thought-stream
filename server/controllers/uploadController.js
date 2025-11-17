import mongoose from 'mongoose';
import sharp from 'sharp';
import stream from 'stream';
import Upload from '../models/Upload.js';

/**
 * Helper: stream buffer into GridFSBucket and return fileId (ObjectId)
 */
const bufferToGridFS = (buffer, filename, contentType) => {
  return new Promise((resolve, reject) => {
    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'fs' }); // use default fs bucket
    const uploadStream = bucket.openUploadStream(filename, {
      contentType
    });
    const passthrough = new stream.PassThrough();
    passthrough.end(buffer);
    passthrough.pipe(uploadStream)
      .on('error', (err) => reject(err))
      .on('finish', (file) => resolve(file._id));
  });
};

/**
 * POST /api/uploads
 * Protected.
 * Expects multipart/form-data file='file'
 * Returns Upload document with api URLs (GET /api/uploads/:id etc.)
 */
export const uploadImage = async (req, res) => {
  try {
    // multer memoryStorage puts buffer at req.file.buffer
    if (!req.file || !req.file.buffer) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const fileBuffer = req.file.buffer;
    const originalname = req.file.originalname || 'upload';
    const mimeType = req.file.mimetype || 'application/octet-stream';
    const size = req.file.size || fileBuffer.length;

    // Basic validation (allow images)
    const allowed = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowed.includes(mimeType)) {
      return res.status(400).json({ success: false, message: 'Unsupported file type' });
    }

    // Use sharp to read metadata and create thumbnails (non-destructive)
    const image = sharp(fileBuffer);
    const metadata = await image.metadata();

    // normalize/orient original (do not enlarge). We'll stream original bytes as-is (or as converted)
    // Get a buffer of normalized original (auto-orient) to ensure consistent orientation
    const normalizedBuffer = await image.rotate().toBuffer();

    // store original in GridFS
    const originalFileName = `${Date.now()}-${originalname}`.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_\.\-]/g, '');
    const originalFileId = await bufferToGridFS(normalizedBuffer, originalFileName, mimeType);

    // generate medium and small thumbnails
    const thumbnails = {};
    try {
      // medium: 1200px width max
      const mediumBuf = await sharp(normalizedBuffer).resize({ width: 1200, withoutEnlargement: true }).toBuffer();
      thumbnails.medium = await bufferToGridFS(mediumBuf, `medium-${originalFileName}`, mimeType);
    } catch (err) {
      // ignore thumbnail errors, log later
      console.warn('Medium thumbnail generation failed:', err.message || err);
    }

    try {
      // small: 400px width
      const smallBuf = await sharp(normalizedBuffer).resize({ width: 400, withoutEnlargement: true }).toBuffer();
      thumbnails.small = await bufferToGridFS(smallBuf, `small-${originalFileName}`, mimeType);
    } catch (err) {
      console.warn('Small thumbnail generation failed:', err.message || err);
    }

    // Create Upload document
    const uploadDoc = await Upload.create({
      fileId: originalFileId,
      filename: originalFileName,
      originalname,
      mimeType,
      size,
      width: metadata.width || null,
      height: metadata.height || null,
      thumbnails: {
        small: thumbnails.small || null,
        medium: thumbnails.medium || null,
        large: null
      },
      uploadedBy: req.userId
    });

    // Build API URLs (GET endpoints)
    const baseUrl = `${req.protocol}://${req.get('host')}/api/uploads`;
    const urls = {
      download: `${baseUrl}/${uploadDoc._id.toString()}`,
      thumbnailSmall: thumbnails.small ? `${baseUrl}/${uploadDoc._id.toString()}/thumbnail/small` : null,
      thumbnailMedium: thumbnails.medium ? `${baseUrl}/${uploadDoc._id.toString()}/thumbnail/medium` : null
    };

    res.status(201).json({
      success: true,
      upload: {
        id: uploadDoc._id,
        fileId: originalFileId,
        filename: uploadDoc.filename,
        originalname: uploadDoc.originalname,
        mimeType: uploadDoc.mimeType,
        size: uploadDoc.size,
        width: uploadDoc.width,
        height: uploadDoc.height,
        thumbnails: uploadDoc.thumbnails,
        urls
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Upload failed', error: error.message });
  }
};

/**
 * GET /api/uploads/:id
 * Streams the original file from GridFS by Upload document id
 */
export const serveUpload = async (req, res) => {
  try {
    const id = req.params.id;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ success: false, message: 'Upload not found' });

    const fileId = upload.fileId;
    if (!fileId) return res.status(404).json({ success: false, message: 'File bytes missing' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });

    // set caching headers
    res.setHeader('Content-Type', upload.mimeType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const downloadStream = bucket.openDownloadStream(fileId);
    downloadStream.on('error', (err) => {
      console.error('GridFS download error:', err);
      res.status(500).end();
    });
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Serve upload error:', error);
    res.status(500).json({ success: false, message: 'Error serving file' });
  }
};

/**
 * GET /api/uploads/:id/thumbnail/:size
 * Streams the requested thumbnail (small|medium|large) if available
 */
export const serveThumbnail = async (req, res) => {
  try {
    const { id, size } = req.params;
    if (!['small', 'medium', 'large'].includes(size)) return res.status(400).json({ success: false, message: 'Invalid size' });

    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ success: false, message: 'Upload not found' });

    const thumbId = upload.thumbnails && upload.thumbnails[size];
    if (!thumbId) return res.status(404).json({ success: false, message: 'Thumbnail not available' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });

    res.setHeader('Content-Type', upload.mimeType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=31536000');

    const streamThumb = bucket.openDownloadStream(thumbId);
    streamThumb.on('error', (err) => {
      console.error('GridFS thumbnail download error:', err);
      res.status(500).end();
    });
    streamThumb.pipe(res);
  } catch (error) {
    console.error('Serve thumbnail error:', error);
    res.status(500).json({ success: false, message: 'Error serving thumbnail' });
  }
};

/**
 * PATCH /api/uploads/:id/metadata
 * Update alt text / caption / display metadata (protected)
 */
export const updateUploadMetadata = async (req, res) => {
  try {
    const id = req.params.id;
    const { alt, caption, display } = req.body;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ success: false, message: 'Upload not found' });

    // optional: restrict updates to uploader or admin (implement as needed)
    if (alt !== undefined) upload.alt = String(alt).slice(0, 500);
    if (caption !== undefined) upload.caption = String(caption).slice(0, 1000);
    if (display !== undefined && typeof display === 'object') {
      upload.display = {
        width: display.width || upload.display.width,
        float: display.float || upload.display.float
      };
    }

    await upload.save();
    res.json({ success: true, upload });
  } catch (error) {
    console.error('Update upload metadata error:', error);
    res.status(500).json({ success: false, message: 'Error updating metadata' });
  }
};



/**
 * DELETE /api/uploads/:id
 * Delete GridFS bytes and Upload doc. Only uploader or admin allowed.
 * Assumes protect middleware has set req.user and req.userId
 */
export const deleteUpload = async (req, res) => {
  try {
    const id = req.params.id;
    const upload = await Upload.findById(id);
    if (!upload) return res.status(404).json({ success: false, message: 'Upload not found' });

    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const isOwner = upload.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    const bucket = new mongoose.mongo.GridFSBucket(mongoose.connection.db, { bucketName: 'fs' });

    // delete original file
    if (upload.fileId) {
      try { await bucket.delete(upload.fileId); } catch (err) { console.warn('Failed to delete original GridFS file:', err.message || err); }
    }

    // delete thumbnails if present
    const thumbs = upload.thumbnails || {};
    for (const sizeKey of ['small', 'medium', 'large']) {
      const fid = thumbs[sizeKey];
      if (fid) {
        try { await bucket.delete(fid); } catch (err) { console.warn(`Failed to delete thumbnail ${sizeKey}:`, err.message || err); }
      }
    }

    // finally remove the Upload doc
    await Upload.findByIdAndDelete(id);

    res.json({ success: true, message: 'Upload deleted' });
  } catch (error) {
    console.error('deleteUpload error:', error);
    res.status(500).json({ success: false, message: 'Error deleting upload' });
  }
};