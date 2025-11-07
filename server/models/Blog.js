import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    parent: { //allow threaded replies
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog.comments',
        default: null
    },
    text: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    upVotes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // last activity used for trending in comment thread
    lastActivity: {
        type: Date,
        default: Date.now
    }
});

const blogSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Blog title is required'],
        trim: true,
        minlength: [5, 'Title must be at least 5 characters'],
        maxlength: [200, 'Title cannot exceed 200 characters']
    },

    content: {
        type: String,
        required: [true, 'Blog content is required'],
        minlength: [50, 'Content must be at least 50 characters']
    },

    excerpt: {
        type: String,
        maxlength: 300
    },

    coverImage: {
        type: String,
        default: ''
    },

    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    categories: [{
        type: String,
        trim: true
    }],

    tags: [{
        type: String,
        trim: true
    }],

    isPublished: {
        type: Boolean,
        default: true
    },

    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    comments: [commentSchema],

    // reaction: allow multiple reaction types (love, clap, etc.)
    reactions: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        type: { type: String, enum: ['like', 'love', 'clap', 'insightful', 'angry'], default: 'like' },
        createdAt: { type: Date, default: Date.now }
    }],

    // analytics
    viewsCount: { type: Number, default: 0 },
    readSessions: [{ //store lightweight read sessions
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        timeSpent: Number, //seconds
        readAt: { type: Number, default: 0 }
    }],
    totalReadTime: { type: Number, default: 0 }, //seconds

    readTime: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

//generate excerpt from content before saving
blogSchema.pre('save', function (next) {
    if (this.isModified('content')) {
        //create excerpt from fisrt 150 character of content
        this.excerpt = this.content.substring(0, 150) + '...';

        //calculate readt time (assuming 200 words per minute)
        const words = this.content.split(/\s+/);
        const wordCount = words.length;
        this.readTime = Math.ceil(wordCount / 200);
    }
    next();
});

//index for better search performanceb
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ author: 1, createdAt: -1 });


export default mongoose.model('blog', blogSchema);