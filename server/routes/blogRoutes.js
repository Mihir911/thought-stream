import express from "express";
import {
    createBlog,
    getBlogs,
    getMyBlogs,
    getBlogById,
    updateBlog,
    deleteBlog,
    toggleLike,
    getTrendingBlogs,
    getRelatedBlogs,
    getBlogsByCategory,
    getPersonalizedFeed,
    toggleBookmark,
    addThreadedComment,
    getBookmarks,
    updateBookmarkProgress,
    reactToBlog,
    recordView,
    toggleCommentUpvote,
    toggleFollowUser,
    getHybridPersonalizedFeed
} from "../controllers/blogController.js";

import { protect } from "../middleware/auth.js";

const router = express.Router();

// -------------------- STATIC ROUTES MUST COME FIRST --------------------

// bookmarks BEFORE /:id
router.get('/user/bookmarks', protect, getBookmarks);

// trending BEFORE /:id
router.get('/feed/trending', getTrendingBlogs);

router.get('/my', protect, getMyBlogs);

// personalized feeds BEFORE /:id
router.get('/feed/personalized', protect, getPersonalizedFeed);
router.get('/feed/hybrid', protect, getHybridPersonalizedFeed);

// category BEFORE /:id
router.get('/category/:category', getBlogsByCategory);

router.get('/:id/related', getRelatedBlogs);

router.get('/', getBlogs);
// -------------------- PUBLIC LIST ROUTE --------------------
router.get('/:id', getBlogById);

// -------------------- ID ROUTES (MUST BE AT BOTTOM) --------------------

router.post('/', protect, createBlog);


// -------------------- PROTECTED ACTION ROUTES --------------------
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

// interactions
router.post('/:id/like', protect, toggleLike);
router.post('/:id/like-reaction', protect, reactToBlog);
router.post('/:id/comment', protect, addThreadedComment);
router.post('/:id/comment/:commentId/upvote', protect, toggleCommentUpvote);


// bookmark actions
router.post('/:id/bookmark', protect, toggleBookmark);
router.put('/:id/bookmark/progress', protect, updateBookmarkProgress);

// record view
router.post('/:id/view', recordView);

// follow/unfollow user
router.post('/user/:id/follow', protect, toggleFollowUser);

export default router;