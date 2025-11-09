import express from "express";
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, toggleLike, addComment, getTrendingBlogs, getRelatedBlogs, getBlogsByCategory, getPersonalizedFeed, toggleBookmark, addThreadedComment, getBookmarks, updateBookmarkProgress, reactToBlog, recordView, toggleCommentUpvote, toggleFollowUser, getHybridPersonalizedFeed } from "../controllers/blogController.js";
import { protect } from "../middleware/auth.js";

const router = express.Router();


// public routes
router.get('/', getBlogs);
router.get('/:id', getBlogById);
router.get('/feed/trending', getTrendingBlogs);
router.get('/:id/related', getRelatedBlogs);
router.get('/category/:category', getBlogsByCategory);

//protected routes
router.post('/', protect, createBlog);
router.put('/:id', protect, updateBlog);
router.delete('/:id', protect, deleteBlog);

//interactions
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addThreadedComment);
router.post('/:id/comment/:commentId/upvote', protect, toggleCommentUpvote);
router.post('/:id/like-reaction', protect, reactToBlog);


//bookmark & reading
router.post('/:id/bookmark', protect, toggleBookmark);
router.get('/user/bookmarks', protect, getBookmarks);
router.put('/:id/bookmark/progress', protect, updateBookmarkProgress);

//record view / reading session - allow unauthenticated (protect optional)
router.post('/:id/view', recordView);


//follow/unfollow user
router.post('/user/:id/follow', protect, toggleFollowUser);

// personalized feeds
router.get('/feed/personalized', protect, getPersonalizedFeed);
router.get('/feed/hybrid', protect, getHybridPersonalizedFeed);

export default router;