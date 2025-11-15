import mongoose, { mongo } from "mongoose";


const uploadSchema = new mongoose.Schema({
    // Reference to GridFS file id (objectId stored in fs.files)
    fileId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },

    filename: { type: String, required: true },
    originalname: { type: String, required: true },
    mimetype: { type: String, required: true },
    size: { type: Number, required: true },

    //optional
    width: { type: Number, default: null },
    height: { type: Number, default: null },

    //thumbnail fileIDs
    thumbnails: {
        small: { type: mongoose.Schema.Types.ObjectId, default: null },
        medium: { type: mongoose.Schema.Types.ObjectId, default: null },
        large: { type: mongoose.Schema.Types.ObjectId, default: null }
    },

    //Display metadata (editable by user)
    alt: { type: String, default: '' },
    caption: { type: String, default: '' },
    display: {
        width: { type: String, default: '' }, // e.g. "50%", "500px"
        float: { type: String, enum: ['', 'left', 'right', 'center', 'full'], default: '' }
    },

    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    usageCount: { type: Number, default: 0 }, 
}, { timestamps: true });

export default mongoose.model('upload', uploadSchema);