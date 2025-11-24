import Blog from "../models/Blog.js";
import User from "../models/User.js";
import Upload from "../models/Upload.js";
import Notification from "../models/Notification.js";
import { calculateBlogScore } from "../utils/feedAlgorithm.js";
import { getTopSimilar } from "../utils/similarity.js";
import mongoose from "mongoose";

// @desc create a new blog
// @route POST /api/blogs
//@access private
export const createBlog = async (req, res) => {
    try {
        const { title, content, categories, tags, coverImage, contentBlocks, coverUpload, isPublished } = req.body;

        const blogData = {
            title,
            content: content || '',
            contentBlocks: Array.isArray(contentBlocks) ? contentBlocks : [],
            categories: categories || [],
            tags: tags || [],
            coverImage: coverImage || '',
            coverUpload: coverUpload || null,
            isPublished: isPublished !== undefined ? isPublished : true,
            author: req.userId
        };


        const blog = await Blog.create(blogData);

        // For each referenced upload in blocks or cover, increment usageCount so we can track usage
        const uploadIdsToInc = new Set();
        if (blog.coverUpload) uploadIdsToInc.add(blog.coverUpload.toString());

        // scan blocks for image types with uploadId
        if (Array.isArray(blog.contentBlocks)) {
            for (const b of blog.contentBlocks) {
                if (b && b.type === 'image' && b.data && b.data.uploadId) {
                    uploadIdsToInc.add(b.data.uploadId.toString());
                }
            }
        }

        if (uploadIdsToInc.size > 0) {
            await Upload.updateMany(
                { _id: { $in: Array.from(uploadIdsToInc) } },
                { $inc: { usageCount: 1 } }
            );
        }


        //populate author info
        await blog.populate('author', 'username profilePicture');

        res.status(201).json({
            success: true,
            message: 'Blog created successfully',
            blog
        });
    } catch (error) {
        console.error('create blog error:', error);
        res.status(500).json({
            success: false,
            message: 'error creating blog',
            error: error.message
        });
    }
};


// @desc    Get all blogs with filters
// @route   GET /api/blogs
// @access  Public
export const getBlogs = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 10,
            search,
            category,
            author,
            sortBy = 'createdAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter object
        const filter = { isPublished: true };

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        if (category) {
            filter.categories = { $in: [category] };
        }

        if (author) {
            filter.author = author;
        }

        // Sort options
        const sort = {};
        sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

        // Execute query with pagination
        const blogs = await Blog.find(filter)
            .populate('author', 'username profilePicture')
            .populate('coverUpload')
            .sort(sort)
            .limit(limit * 1)
            .skip((page - 1) * limit);

        // Get total count for pagination
        const total = await Blog.countDocuments(filter);

        res.json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBlogs: total,
                hasNext: page < Math.ceil(total / limit),
                hasPrev: page > 1
            }
        });

    } catch (error) {
        console.error('Get blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blogs'
        });
    }
};


// @desc    Get single blog by ID
// @route   GET /api/blogs/:id
// @access  Public
export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('author', 'username profilePicture bio')
            .populate('comments.user', 'username profilePicture')
            .populate('coverUpload');

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        res.json({
            success: true,
            blog
        });

    } catch (error) {
        console.error('Get blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching blog'
        });
    }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Author only)
export const updateBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({ success: false, message: 'Not authorized to update this blog' });
        }

        // Optionally compute the difference in upload usage counts:
        // For simplicity we won't decrement usageCount for removed uploads here;
        // a periodic cleanup job can find orphaned uploads (usageCount === 0).
        const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        await updated.populate('author', 'username profilePicture');

        res.json({ success: true, message: 'Blog updated successfully', blog: updated });
    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({ success: false, message: 'Error updating blog' });
    }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Author only)
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Check if user is the author
        if (blog.author.toString() !== req.userId) {
            return res.status(403).json({
                success: false,
                message: 'Not authorized to delete this blog'
            });
        }

        await Blog.findByIdAndDelete(req.params.id);

        res.json({
            success: true,
            message: 'Blog deleted successfully'
        });

    } catch (error) {
        console.error('Delete blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting blog'
        });
    }
};

// @desc    Like/Unlike a blog
// @route   POST /api/blogs/:id/like
// @access  Private
export const toggleLike = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        const hasLiked = blog.likes.includes(req.userId);

        if (hasLiked) {
            // Unlike
            blog.likes = blog.likes.filter(like => like.toString() !== req.userId);
        } else {
            // Like
            blog.likes.push(req.userId);
            // UPDATE USER INTERESTS WHEN THEY LIKE A BLOG
            await updateUserInterests(req.userId, blog);

            // Create notification if not liking own blog
            if (blog.author.toString() !== req.userId) {
                await Notification.create({
                    recipient: blog.author,
                    sender: req.userId,
                    type: 'like',
                    blog: blog._id,
                    message: `liked your blog "${blog.title}"`
                });
            }
        }

        await blog.save();

        res.json({
            success: true,
            message: hasLiked ? 'Blog unliked' : 'Blog liked',
            likes: blog.likes.length,
            isLiked: !hasLiked
        });

    } catch (error) {
        console.error('Like blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating like'
        });
    }
};


export const getMyBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ author: req.userId })
            .sort({ createdAt: -1 }) // newest first
            .populate('author', 'username profilePicture')
            .populate('coverUpload');

        res.json({
            success: true,
            blogs
        });
    } catch (error) {
        console.error('Get my blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching your blogs'
        });
    }
};


// Helper function to update user interests
const updateUserInterests = async (userId, blog) => {
    try {
        const user = await User.findById(userId);

        if (!user.interests) {
            user.interests = [];
        }

        blog.categories.forEach(category => {
            const existingInterest = user.interests.find(i => i.category === category);
            if (existingInterest) {
                existingInterest.score += 0.1;
            } else {
                user.interests.push({ category, score: 1 });
            }
        });

        await user.save();
    } catch (error) {
        console.error('Update user interests error:', error);
        // Don't throw error - this shouldn't break the main functionality
    }
};


//@desc get personalized feed
// #route GET /api/blogs/feed/personalized
//@access private
export const getPersonalizedFeed = async (req, res) => {
    try {
        const user = await User.findById(req.userId).populate('interests');
        const { page = 1, limit = 10 } = req.query;

        // Get all published blogs
        let blogs = await Blog.find({ isPublished: true })
            .populate('author', 'username profilePicture')
            .populate('coverUpload')
            .lean();

        // Calculate scores for each blog
        blogs = blogs.map(blog => ({
            ...blog,
            score: calculateBlogScore(blog, user.interests)
        }));

        // Sort by score (highest first)
        blogs.sort((a, b) => b.score - a.score);

        // Paginate
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginatedBlogs = blogs.slice(startIndex, endIndex);

        res.json({
            success: true,
            blogs: paginatedBlogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(blogs.length / limit),
                totalBlogs: blogs.length
            }
        });

    } catch (error) {
        console.error('Personalized feed error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching personalized feed'
        });
    }
};

// @desc    Get trending blogs
// @route   GET /api/blogs/feed/trending
// @access  Public
export const getTrendingBlogs = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const blogs = await Blog.find({
            isPublished: true,
            createdAt: { $gte: sevenDaysAgo }
        })
            .populate('author', 'username profilePicture')
            .populate('coverUpload')
            .sort({
                viewsCount: -1,        // Unique views count
                likes: -1,            // Engagement
                createdAt: -1         // Recency
            })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        res.json({
            success: true,
            blogs,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(await Blog.countDocuments({
                    isPublished: true,
                    createdAt: { $gte: sevenDaysAgo }
                }) / limit)
            }
        });

    } catch (error) {
        console.error('Trending blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching trending blogs'
        });
    }
};

// @desc    Get related blogs
// @route   GET /api/blogs/:id/related
// @access  Public
export const getRelatedBlogs = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id).lean();

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        // Get candidates for similarity comparison
        const candidates = await Blog.find({
            _id: { $ne: blog._id },
            isPublished: true,
            $or: [
                { categories: { $in: blog.categories || [] } },
                { tags: { $in: blog.tags || [] } },
                { author: blog.author }
            ]
        })
            .populate('author', 'username profilePicture')
            .populate('coverUpload')
            .limit(50) // Increased limit for better results
            .lean();

        // If not enough candidates, add some popular posts as fallback
        let relatedBlogs = [...candidates];

        if (candidates.length < 4) {
            const fallback = await Blog.find({
                _id: { $ne: blog._id },
                isPublished: true
            })
                .populate('author', 'username profilePicture')
                .sort({ likes: -1, viewsCount: -1, createdAt: -1 })
                .limit(10)
                .lean();

            // Merge unique candidates
            const existingIds = new Set(candidates.map(c => c._id.toString()));
            fallback.forEach(f => {
                if (!existingIds.has(f._id.toString())) {
                    relatedBlogs.push(f);
                }
            });
        }

        // Prepare docs for similarity engine
        // We need to construct a "text" representation for each blog including the current one
        const docs = [blog, ...relatedBlogs].map(b => {
            const text = [
                b.title,
                b.content,
                ...(b.categories || []),
                ...(b.tags || [])
            ].join(' ');

            return {
                id: b._id,
                text,
                ...b
            };
        });

        // Get top similar blogs using the utility
        const topRelated = await getTopSimilar(docs, 6);

        res.json({
            success: true,
            relatedBlogs: topRelated
        });

    } catch (error) {
        console.error('Related blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching related blogs'
        });
    }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
export const getBlogsByCategory = async (req, res) => {
    try {
        const { category } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const blogs = await Blog.find({
            isPublished: true,
            categories: { $in: [category] }
        })
            .populate('author', 'username profilePicture')
            .populate('coverUpload')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Blog.countDocuments({
            isPublished: true,
            categories: { $in: [category] }
        });

        res.json({
            success: true,
            blogs,
            category,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(total / limit),
                totalBlogs: total
            }
        });

    } catch (error) {
        console.error('Category blogs error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching category blogs'
        });
    }
};

// @desc bookmark/save AND remove a blog
// @route POST /api/blogs/:id/bookark
// @access Private
export const toggleBookmark = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const blogId = req.params.id;

        const existing = user.bookmarks.find(b => b.blog.toString() === blogId);

        if (existing) {
            // remove bookmark
            user.bookmarks = user.bookmarks.filter(b => b.blog.toString() !== blogId);
            await user.save();
            return res.json({ success: true, message: 'bookmark removed' });
        }

        user.bookmarks.push({ blog: blogId, savedAt: new Date(), progress: 0, offline: false });
        await user.save();
        res.json({ success: true, message: 'bookmarked' });
    } catch (error) {
        console.error('Toggle bookmark error:', error);
        res.status(500).json({ success: false, message: 'Error toggling bookmark' });

    }
};

// @desc Get user's bookmarks(paginated)
// @route GET /api/user/bookmarks
// @ACCESS private
export const getBookmarks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;

        if (!req.userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }

        const user = await User.findById(req.userId).populate({
            path: 'bookmarks.blog',
            populate: { path: 'author', select: 'username profilePicture' }
        });

        if (!user) return res.status(404).json({ success: false, message: 'User not found' });

        const bookmarks = user.bookmarks || [];

        const start = (page - 1) * limit;
        const end = page * limit;

        const paginated = bookmarks.slice(start, end);

        res.json({
            success: true,
            bookmarks: paginated,
            pagination: {
                currentPage: page,
                totalBookmarks: bookmarks.length,
                totalPages: Math.ceil(bookmarks.length / limit)
            }
        });
    } catch (error) {
        console.error('Get bookmarks error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// @desc update bookmark progress (e.g. user reads 40% -> save)
// @route PUT /api/user/:id/bookmark/progress
// @access Private
export const updateBookmarkProgress = async (req, res) => {
    try {
        const { progress } = req.body; //progress in seconds or percent (frontend decides)
        const blogId = req.params.id;
        const user = await User.findById(req.userId);

        const b = user.bookmarks.find(bk => bk.blog.toString() === blogId);
        if (!b) {
            return res.status(404).json({ success: false, message: 'Bookmark not found' });
        }

        b.progress = progress;
        await user.save();

        res.json({ success: true, message: "Progress updated", bookmark: b });
    } catch (error) {
        console.error('Update bookmark progres error:', error);
        res.status(500).json({ success: false, mesage: 'Error updating bookmark' });
    }
};

// @desc Record a view/read session (allow anonymous if user not logged in)
// @route POST /api/blogs/:id/view
// @access public
export const recordView = async (req, res) => {
    try {
        const blogId = req.params.id;
        const userId = req.userId || null; // null for anonymous users

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        // Check if user has already viewed this blog
        const hasViewed = blog.views.some(view => {
            if (userId) {
                // For logged-in users, check by user ID
                return view.user && view.user.toString() === userId.toString();
            } else {
                // For anonymous users, we can't track individual views reliably
                // So we'll allow multiple views from anonymous users
                return false;
            }
        });

        if (!hasViewed) {
            // Add view only if user hasn't viewed before
            blog.views.push({
                user: userId,
                viewedAt: new Date()
            });

            // Update views count (unique users)
            blog.viewsCount = blog.views.filter(view => view.user !== null).length;

            await blog.save();
        }

        // For anonymous users, we can implement IP-based tracking if needed
        // But for now, we'll allow multiple anonymous views

        res.json({
            success: true,
            message: 'View recorded',
            isNewView: !hasViewed
        });
    } catch (error) {
        console.error('Record view error:', error);
        res.status(500).json({ success: false, message: 'Error recording view' });
    }
};

// React to a blog ( flexible reaction types)
export const reactToBlog = async (req, res) => {
    try {
        const { type } = req.body; //like, love, clap, insightfull, angry
        const blogId = req.params.id;
        const userId = req.userId;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: 'Blog not found' });

        const userIdStr = String(userId);
        const existingIndex = blog.reactions.findIndex(r => String(r.user._id || r.user) === userIdStr);

        if (existingIndex !== -1) {
            const existing = blog.reactions[existingIndex];
            if (existing.type === type) {
                // If same type, remove it (toggle off)
                blog.reactions.splice(existingIndex, 1);
            } else {
                // If different type, switch it
                blog.reactions[existingIndex].type = type;
            }
        } else {
            // New reaction
            blog.reactions.push({ user: userId, type });

            // Create notification if not reacting to own blog
            if (blog.author.toString() !== userId) {
                await Notification.create({
                    recipient: blog.author,
                    sender: userId,
                    type: 'reaction',
                    blog: blog._id,
                    message: `reacted with ${type} to your blog "${blog.title}"`
                });
            }
        }

        await blog.save();

        res.json({ success: true, message: 'Reaction recorded', reactions: blog.reactions.length });
    } catch (error) {
        console.error('React error:', error);
        res.status(500).json({ success: false, message: 'Error reacting to blog' });
    }
};

// threaded comment (supports parent comment ID)
export const addThreadedComment = async (req, res) => {
    try {
        const { text, parent } = req.body;
        const blogId = req.params.id;

        if (!text || text.trim().length === 0) {
            return res.status(400).json({ success: false, message: 'Comment text is required' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found' });
        }

        const comment = {
            user: req.userId,
            parent: parent || null,
            text: text.trim(),
            createdAt: new Date(),
            upVotes: [],
            lastActivity: new Date()
        };

        // Add comment to blog
        blog.comments.push(comment);
        await blog.save();

        // Populate the user details for the response
        await blog.populate({
            path: 'comments.user',
            select: 'username profilePicture'
        });

        // Get the newly added comment (last one in the array)
        const newComment = blog.comments[blog.comments.length - 1];

        // Optionally update user interests when they comment
        await updateUserInterests(req.userId, blog);

        // Create notification if not commenting on own blog
        if (blog.author.toString() !== req.userId) {
            await Notification.create({
                recipient: blog.author,
                sender: req.userId,
                type: 'comment',
                blog: blog._id,
                comment: newComment._id,
                message: `commented on your blog "${blog.title}"`
            });
        }

        // If it's a reply to another comment, notify the parent comment author
        if (parent) {
            const parentComment = blog.comments.id(parent);
            if (parentComment && parentComment.user.toString() !== req.userId) {
                await Notification.create({
                    recipient: parentComment.user,
                    sender: req.userId,
                    type: 'mention',
                    blog: blog._id,
                    comment: newComment._id,
                    message: `replied to your comment on "${blog.title}"`
                });
            }
        }

        res.json({
            success: true,
            message: 'Comment added successfully',
            comment: newComment
        });

    } catch (error) {
        console.error('Add threaded comment error:', error);
        res.status(500).json({ success: false, message: 'Error adding comment' });
    }
};
// Upvote a comment
export const toggleCommentUpvote = async (req, res) => {
    try {
        const { id: blogId, commentId } = req.params;

        const blog = await Blog.findById(blogId);
        if (!blog) return res.status(404).json({ success: false, message: "Blog not found" });

        const comment = blog.comments.id(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found" });

        // Ensure array exists
        if (!Array.isArray(comment.upvotes)) {
            comment.upvotes = [];
        }

        const userIdStr = String(req.userId);
        const upvoteIndex = comment.upvotes.findIndex(u => String(u._id || u) === userIdStr);

        if (upvoteIndex !== -1) {
            comment.upvotes.splice(upvoteIndex, 1);
        } else {
            comment.upvotes.push(req.userId);
        }

        comment.lastActivity = new Date();
        await blog.save();

        res.json({
            success: true,
            message: upvoteIndex !== -1 ? "Upvote removed" : "Upvoted",
            upvotes: comment.upvotes.length
        });

    } catch (error) {
        console.error("Toggle comment upvote error:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// Follow / unfollow a user
export const toggleFollowUser = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        if (req.userId === targetUserId) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

        const me = await User.findById(req.userId);
        const target = await User.findById(targetUserId);
        if (!target) return res.status(404).json({ success: false, message: 'User not found' });

        const isFollowing = me.following.some(f => f.toString() === targetUserId);
        if (isFollowing) {
            me.following = me.following.filter(f => f.toString() !== targetUserId);
            await me.save();
            return res.json({ success: true, message: 'Unfollowed user' });
        } else {
            me.following.push(targetUserId);
            await me.save();
            return res.json({ success: true, message: 'Following user' });
        }
    } catch (error) {
        console.error('Toggle follow error:', error);
        res.status(500).json({ success: false, message: 'Error following/unfollowing user' });
    }
};

// Enhanced personalized feed: hybridize interests + follows + trending
export const getHybridPersonalizedFeed = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        const { page = 1, limit = 10 } = req.query;

        // 1) Collect candidate blogs:
        // - posts in user's interests
        // - posts by followed authors
        // - trending posts (recent + high engagement)
        const interestCategories = user.interests?.map(i => i.category) || [];
        const followedAuthors = user.following || [];

        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 14);

        // Query a superset of candidates (limit to keep work reasonable)
        const candidates = await Blog.find({
            isPublished: true,
            $or: [
                { categories: { $in: interestCategories } },
                { author: { $in: followedAuthors } },
                { createdAt: { $gte: sevenDaysAgo } }
            ]
        })
            .populate('author', 'username profilePicture')
            .lean()
            .limit(100); // tuneable

        // Compute scores using existing calculateBlogScore plus boosts
        let scored = candidates.map(blog => {
            let base = calculateBlogScore(blog, user.interests);
            // boost if author followed
            if (followedAuthors.map(String).includes(String(blog.author._id))) base += 4;
            // boost if bookmarked
            if (user.bookmarks.some(b => b.blog.toString() === blog._id.toString())) base += 2;
            // time decay already handled in calculateBlogScore if implemented; else add recency
            return { ...blog, score: base };
        });

        // also include some trending popular posts as fallback
        if (scored.length < (limit * 2)) {
            const trending = await Blog.find({ isPublished: true })
                .sort({ likes: -1, viewsCount: -1, createdAt: -1 })
                .limit(30)
                .lean()
                .populate('author', 'username profilePicture');
            // merge unique
            const ids = new Set(scored.map(b => b._id.toString()));
            trending.forEach(t => {
                if (!ids.has(t._id.toString())) {
                    scored.push({ ...t, score: (t.likes?.length || 0) * 0.6 + 1 });
                }
            });
        }

        // sort by score desc
        scored.sort((a, b) => b.score - a.score);

        // paginate
        const startIndex = (page - 1) * limit;
        const endIndex = page * limit;
        const paginated = scored.slice(startIndex, endIndex);

        res.json({
            success: true,
            blogs: paginated,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(scored.length / limit),
                totalBlogs: scored.length
            }
        });
    } catch (error) {
        console.error('Hybrid feed error:', error);
        res.status(500).json({ success: false, message: 'Error fetching hybrid feed' });
    }
};