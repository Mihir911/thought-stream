import express from "express";
import { createBlog, getBlogs, getBlogById, updateBlog, deleteBlog, toggleLike, addComment, getTrendingBlogs, getRelatedBlogs, getBlogsByCategory, getPersonalizedFeed } from "../controllers/blogController.js";
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
router.post('/:id/like', protect, toggleLike);
router.post('/:id/comment', protect, addComment);
router.get('/feed/personalized', protect, getPersonalizedFeed);

export default router;