import mongoose, { mongo } from "mongoose";

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

const blockSchema = new mongoose.Schema({
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { _id: false });

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
        default: ''
    },

    contentBlocks: {
    type: [blockSchema],
    default: []
    },

    excerpt: {
        type: String,
        maxlength: 300
    },

    coverImage: {
        type: String,
        default: ''
    },
    coverUpload: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Upload',
    default: null
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



function extractTextFromBlocks(blocks = []) {
  try {
    if (!Array.isArray(blocks) || blocks.length === 0) return '';
    let text = '';
    for (const b of blocks) {
      if (!b || !b.type) continue;
      const d = b.data || {};
      switch (b.type) {
        case 'heading':
          text += (d.text || '') + '\n\n';
          break;
        case 'paragraph':
          text += (d.text || '') + '\n\n';
          break;
        case 'list':
          if (Array.isArray(d.items)) text += d.items.join(' ') + '\n\n';
          break;
        case 'quote':
          text += (d.text || '') + '\n\n';
          break;
        case 'code':
          text += (d.code || '') + '\n\n';
          break;
        case 'image':
          // use caption or alt as text representation
          text += (d.caption || d.alt || '') + '\n\n';
          break;
        default:
          // generic fallback: try text field
          if (d.text) text += d.text + '\n\n';
          break;
      }
    }
    return text.trim();
  } catch (err) {
    return '';
  }
}


// generate excerpt & readtime before saving
blogSchema.pre('save', function (next) {
    const sourceText = (this.contentBlocks && this.contentBlocks.length > 0 )
    ? extractTextFromBlocks(this.contentBlocks)
    : (this.content || '');

    if (sourceText) {
        // excerpt: first ~150 characters of meaningful text
        const plain = sourceText.replace(/\s+/g, ' ').trim();
        this.excerpt = plain.substring(0, 150) + (plain.length > 150 ? '...' : '');

        //readTime : approximate 200 wpm
        const words = plain.split(/\s+/).filter(Boolean);
        const wordCount = words.length;
        this.readTime = Math.max(1, Math.ceil(wordCount / 200));
    } else {
        // leave defaults 
        if (!this.excerpt) this.excerpt = '';
        if (!this.readTime) this.readTime = 0;
        
    }

    next();
});

//index for better search performanceb
blogSchema.index({ title: 'text', content: 'text' });
blogSchema.index({ author: 1, createdAt: -1 });


export default mongoose.model('blog', blogSchema);