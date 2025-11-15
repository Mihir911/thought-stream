import mongoose from "mongoose";

const draftSchema = new mongoose.Schema({
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, default: '' },

    //structured document: ordered array of blocks (keeps editor JSON)
    contentBlocks: [{
        type: {type: String, required: true },
        data: { type: mongoose.Schema.Types.Mixed, default: {} }
    }],

    //optional cover (reference to upload)
    coverUpload: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', default: null },
    tags: [{ type: String }],
    categories: [{ type: String }],
    isPublished: { type: Boolean, default: false },
    lastSavedAt: { type: Date, default: Date.now }
}, { timestamps: true });

export default mongoose.model('Draft', draftSchema);