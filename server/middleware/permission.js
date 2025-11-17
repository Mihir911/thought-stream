import Upload from '../models/Upload.js';

/**
 * Ensures the currently-authenticated user is the uploader or an admin.
 * Use after `protect` so req.user is populated.
 */
export const ensureUploaderOrAdmin = async (req, res, next) => {
  try {
    const uploadId = req.params.id;
    const upload = await Upload.findById(uploadId);
    if (!upload) return res.status(404).json({ success: false, message: 'Upload not found' });

    // req.user is set by protect() middleware
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });

    const isOwner = upload.uploadedBy && upload.uploadedBy.toString() === user._id.toString();
    const isAdmin = user.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: not upload owner or admin' });
    }

    // expose upload doc to next middleware/controller to avoid refetch
    req._uploadDoc = upload;
    next();
  } catch (error) {
    console.error('ensureUploaderOrAdmin error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};