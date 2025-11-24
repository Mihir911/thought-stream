import express from 'express';
import { protect } from '../middleware/auth.js';
import {
    getMe,
    updateProfile,
    updatePreferences,
    updateInterests,
    followUser,
    unfollowUser,
    getNotifications,
    markNotificationRead,
    markAllNotificationsRead,
    getUserProfile
} from '../controllers/userController.js';
import { getBookmarks } from '../controllers/blogController.js';

const router = express.Router();

// convenience: return current user profile (alias of /api/auth/profile)
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);

// update newsletter/digest preferences
router.put('/preferences', protect, updatePreferences);

// replace/update interests
router.put('/interests', protect, updateInterests);

router.get('/bookmarks', protect, getBookmarks);

// Follow system
router.post('/follow/:id', protect, followUser);
router.post('/unfollow/:id', protect, unfollowUser);

// Notifications
router.get('/notifications', protect, getNotifications);
router.put('/notifications/:id/read', protect, markNotificationRead);
router.put('/notifications/read-all', protect, markAllNotificationsRead);

// Public profile (must be last to avoid conflicts)
router.get('/:id', getUserProfile);

export default router;