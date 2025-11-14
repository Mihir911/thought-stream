import path from 'path';

/**
 * upload controller
 * expects multer to populate req.file
 */
export const uploadImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        // Buils a public URL for the uploaded file
        const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

        res.status(201).json({
            success: true,
            url: fileUrl,
            filename: req.file.filename,
            originalName: req.file.originalName,
            MimeType: req.file.MimeType,
            size: req.file.size
        });

    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ success: false, message: 'Upload failed' });
    }
};