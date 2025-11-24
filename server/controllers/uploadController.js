import Upload from "../models/Upload.js";
import { v2 as cloudinary } from 'cloudinary';
import dotenv from "dotenv";

dotenv.config();

//configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/** 
 * POST /api/uploads
 * upload image to CLOUDINARY and create upload document
 */
export const uploadImage = async (req, res) => {
  try {


    // Check if Cloudinary is properly configured
    if (!process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET) {
      console.error('❌ Cloudinary env vars missing');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration missing. Please check server configuration.'
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'no file uploaded'
      });
    }

    // validate file type
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      return res.status(400).json({
        success: false,
        message: 'Unsupported file type. Only JPEG, PNG, WebP, and GIF are allowed.'
      });
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024;
    if (req.file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10mb.'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'blogspace',
          transformation: [
            { width: 1920, crop: 'limit', quality: 'auto', fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );

      uploadStream.end(req.file.buffer);
    });


    // Generate thumbnail URLs using Cloudinary transformations
    const thumbnails = {
      small: cloudinary.url(uploadResult.public_id, {
        width: 400,
        height: 300,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      medium: cloudinary.url(uploadResult.public_id, {
        width: 800,
        height: 600,
        crop: 'fill',
        gravity: 'auto',
        quality: 'auto',
        fetch_format: 'auto'
      }),
      large: cloudinary.url(uploadResult.public_id, {
        width: 1200,
        height: 900,
        crop: 'limit',
        quality: 'auto',
        fetch_format: 'auto'
      })
    };

    // Create Upload document
    const uploadDoc = await Upload.create({
      publicId: uploadResult.public_id,
      url: uploadResult.secure_url,
      originalname: req.file.originalname,
      mimeType: req.file.mimetype,
      size: req.file.size,
      width: uploadResult.width,
      height: uploadResult.height,
      thumbnails,
      uploadedBy: req.userId
    });

    res.status(201).json({
      success: true,
      upload: {
        id: uploadDoc._id,
        publicId: uploadDoc.publicId,
        url: uploadDoc.url,
        thumbnails: uploadDoc.thumbnails,
        originalname: uploadDoc.originalname,
        mimeType: uploadDoc.mimeType,
        size: uploadDoc.size,
        width: uploadDoc.width,
        height: uploadDoc.height
      }
    });

  } catch (error) {
    console.error('Upload error:', error);

    if (error.message.includes('File size too large')) {
      return res.status(400).json({
        success: false,
        message: 'File too large for Cloudinary'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Upload failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * DELETE /api/uploads/:id
 * Delete from Cloudinary and remove Upload document
 */
export const deleteUpload = async (req, res) => {
  try {
    const upload = await Upload.findById(req.params.id);
    if (!upload) {
      return res.status(404).json({
        success: false,
        message: 'Upload not found'
      });
    }

    // Check permissions
    const user = req.user;
    const isOwner = upload.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: 'Forbidden'
      });
    }

    // Delete from Cloudinary
    try {
      await cloudinary.uploader.destroy(upload.publicId);
    } catch (cloudinaryError) {
      console.warn('Cloudinary deletion failed:', cloudinaryError);
      // Continue with database deletion even if Cloudinary fails
    }

    // Remove from database
    await Upload.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Upload deleted successfully'
    });

  } catch (error) {
    console.error('Delete upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting upload'
    });
  }
};
