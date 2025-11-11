import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";


//  GET /api/user/me
export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, user });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching profile' });
    }
};


// PUT /api/user/preferences
export const updatePreferences = async (req, res) => {
  try {
    const { newsletter, digestFrequency } = req.body;
    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (newsletter !== undefined) user.preferences.newsletter = Boolean(newsletter);
    if (digestFrequency) {
      const allowed = ['daily', 'weekly', 'monthly', 'none'];
      if (!allowed.includes(digestFrequency)) {
        return res.status(400).json({ success: false, message: 'Invalid digestFrequency' });
      }
      user.preferences.digestFrequency = digestFrequency;
    }

    await user.save();
    res.json({ success: true, preferences: user.preferences });
  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, message: 'Server error updating preferences' });
  }
};

// PUT /api/user/interests
export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;
    if (!Array.isArray(interests)) {
      return res.status(400).json({ success: false, message: 'Interests must be an array' });
    }

    // validate shape and normalize
    const normalized = interests.map((i) => {
      if (typeof i === 'string') return { category: i, score: 1 };
      if (typeof i === 'object' && i.category && typeof i.category === 'string') {
        return { category: i.category, score: typeof i.score === 'number' ? i.score : 1 };
      }
      throw new Error('Invalid interest format');
    });

    const user = await User.findById(req.userId);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.interests = normalized;
    await user.save();

    res.json({ success: true, interests: user.interests });
  } catch (error) {
    console.error('Update interests error:', error.message || error);
    if (error.message && error.message.includes('Invalid interest format')) {
      return res.status(400).json({ success: false, message: 'Invalid interest format, expecting array of strings or {category,score}' });
    }
    res.status(500).json({ success: false, message: 'Server error updating interests' });
  }
};