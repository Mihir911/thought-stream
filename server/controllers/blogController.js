import Blog from "../models/Blog.js";
import User from "../models/User.js";

// @desc create a new blog
// @route POST /api/blogs
//@access private
export const createBlog = async (req, res) => {
    try {
        const { title, content, categories, tags, coverImage, isPublished } = req.body;

        const blog = await Blog.create({
            title,
            content,
            categories: categories || [],
            tags: tags || [],
            coverImage: coverImage || '',
            isPublished: isPublished !== undefined ? isPublished : true,
            author: req.userId
        });

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
            .populate('comments.user', 'username profilePicture');

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
                message: 'Not authorized to update this blog'
            });
        }

        const updatedBlog = await Blog.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        ).populate('author', 'username profilePicture');

        res.json({
            success: true,
            message: 'Blog updated successfully',
            blog: updatedBlog
        });

    } catch (error) {
        console.error('Update blog error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating blog'
        });
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

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comment
// @access  Private
export const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        
        if (!text || text.trim().length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Comment text is required'
            });
        }

        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }

        blog.comments.push({
            user: req.userId,
            text: text.trim()
        });

        await blog.save();
        
        // UPDATE USER INTERESTS WHEN THEY COMMENT ON A BLOG
        await updateUserInterests(req.userId, blog);
        
        // Populate the new comment with user info
        await blog.populate('comments.user', 'username profilePicture');

        const newComment = blog.comments[blog.comments.length - 1];

        res.status(201).json({
            success: true,
            message: 'Comment added successfully',
            comment: newComment
        });

    } catch (error) {
        console.error('Add comment error:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding comment'
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
        .sort({ likes: -1, createdAt: -1 })
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
        const blog = await Blog.findById(req.params.id);
        
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found'
            });
        }
        
        const relatedBlogs = await Blog.find({
            _id: { $ne: blog._id },
            isPublished: true,
            $or: [
                { categories: { $in: blog.categories } },
                { tags: { $in: blog.tags } },
                { author: blog.author }
            ]
        })
        .populate('author', 'username profilePicture')
        .limit(6)
        .sort({ likes: -1, createdAt: -1 });
        
        res.json({
            success: true,
            relatedBlogs
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