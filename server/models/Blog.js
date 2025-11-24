import mongoose from "mongoose";

/* ---------------------- COMMENT SCHEMA ---------------------- */

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    default: null // threaded comments handled manually
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

  upvotes: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    }
  ],

  lastActivity: {
    type: Date,
    default: Date.now
  }
});

/* ---------------------- BLOCK SCHEMA ---------------------- */

const blockSchema = new mongoose.Schema(
  {
    type: { type: String, required: true },
    data: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  { _id: false }
);

/* ---------------------- BLOG SCHEMA ---------------------- */

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Blog title is required"],
      trim: true,
      minlength: 5,
      maxlength: 200
    },

    content: {
      type: String,
      default: ""
    },
    views: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
      },
      viewedAt: {
        type: Date,
        default: Date.now
      }
    }],
    viewsCount: {
      type: Number,
      default: 0
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
      default: ""
    },

    coverUpload: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Upload",
      default: null
    },

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    categories: [
      {
        type: String,
        trim: true
      }
    ],

    tags: [
      {
        type: String,
        trim: true
      }
    ],

    isPublished: {
      type: Boolean,
      default: true
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [commentSchema],

    reactions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        type: {
          type: String,
          enum: ["like", "love", "clap", "insightful", "angry"],
          default: "like"
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    viewsCount: { type: Number, default: 0 },

    readSessions: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
        timeSpent: Number,
        readAt: { type: Number, default: 0 }
      }
    ],

    totalReadTime: { type: Number, default: 0 },

    readTime: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

/* ---------------------- TEXT EXTRACTION ---------------------- */

function extractTextFromBlocks(blocks = []) {
  try {
    if (!Array.isArray(blocks) || blocks.length === 0) return "";
    let text = "";

    for (const b of blocks) {
      if (!b || !b.type) continue;
      const d = b.data || {};

      switch (b.type) {
        case "heading":
        case "paragraph":
        case "quote":
          text += (d.text || "") + "\n\n";
          break;

        case "list":
          if (Array.isArray(d.items)) text += d.items.join(" ") + "\n\n";
          break;

        case "code":
          text += (d.code || "") + "\n\n";
          break;

        case "image":
          text += (d.caption || d.alt || "") + "\n\n";
          break;

        default:
          if (d.text) text += d.text + "\n\n";
          break;
      }
    }
    return text.trim();
  } catch (err) {
    return "";
  }
}

/* ---------------------- PRE-SAVE HOOK ---------------------- */

blogSchema.pre("save", function (next) {
  const sourceText =
    this.contentBlocks?.length > 0
      ? extractTextFromBlocks(this.contentBlocks)
      : this.content || "";

  if (sourceText) {
    const plain = sourceText.replace(/\s+/g, " ").trim();

    this.excerpt =
      plain.substring(0, 150) + (plain.length > 150 ? "..." : "");

    const words = plain.split(/\s+/).filter(Boolean);
    this.readTime = Math.max(1, Math.ceil(words.length / 200));
  }

  next();
});

/* ---------------------- INDEXES ---------------------- */

blogSchema.index({ title: "text", content: "text" });
blogSchema.index({ author: 1, createdAt: -1 });

/* ---------------------- EXPORT MODEL ---------------------- */

export default mongoose.model("Blog", blogSchema);