import mongoose from "mongoose";

const uploadSchema = new mongoose.Schema({
    // Cloudinary public_id and secure_url
    publicId: {
        type: String,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    originalname: { 
        type: String, 
        required: true 
    },
    mimeType: { 
        type: String, 
        required: true 
    },
    size: { 
        type: Number, 
        required: true 
    },

    // Image dimensions
    width: { type: Number, default: null },
    height: { type: Number, default: null },

    // Thumbnails - Cloudinary transformations
    thumbnails: {
        small: { type: String, default: null },  // w_400
        medium: { type: String, default: null }, // w_800
        large: { type: String, default: null }   // w_1200
    },

    // Display metadata
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    display: {
        width: { type: String, default: '' },
        float: { type: String, enum: ['', 'left', 'right', 'center', 'full'], default: '' }
    },

    uploadedBy: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    usageCount: { 
        type: Number, 
        default: 0 
    },
}, { 
    timestamps: true 
});

export default mongoose.model('Upload', uploadSchema);