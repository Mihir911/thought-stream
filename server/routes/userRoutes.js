import express from 'express';
import { protect } from '../middleware/auth.js';
import { getMe, updatePreferences, updateInterests } from '../controllers/userController.js';

const router = express.Router();

// convenience: return current user profile (alias of /api/auth/profile)
router.get('/me', protect, getMe);

// update newsletter/digest preferences
router.put('/preferences', protect, updatePreferences);

// replace/update interests
router.put('/interests', protect, updateInterests);

export default router;