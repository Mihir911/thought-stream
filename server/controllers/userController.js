import express from "express";
import { protect } from "../middleware/auth.js";
import User from "../models/User.js";
import Notification from "../models/Notification.js";


//  GET /api/user/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const followersCount = await User.countDocuments({ following: req.userId });

    res.json({ success: true, user: { ...user.toObject(), followersCount } });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Server error fetching profile' });
  }
};

// GET /api/user/:id
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const followersCount = await User.countDocuments({ following: req.params.id });

    res.json({ success: true, user: { ...user.toObject(), followersCount } });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/user/profile
export const updateProfile = async (req, res) => {
  try {
    const { username, bio, location, website, profilePicture } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    if (username) user.username = username;
    if (bio !== undefined) user.bio = bio;
    if (location !== undefined) user.location = location;
    if (website !== undefined) user.website = website;
    if (profilePicture) user.profilePicture = profilePicture;

    await user.save();

    const followersCount = await User.countDocuments({ following: req.userId });

    res.json({ success: true, user: { ...user.toObject(), followersCount } });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ success: false, message: 'Server error updating profile' });
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

// POST /api/user/follow/:id
export const followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToFollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (userToFollow._id.toString() === currentUser._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }

    if (currentUser.following.includes(userToFollow._id)) {
      return res.status(400).json({ success: false, message: 'You are already following this user' });
    }

    currentUser.following.push(userToFollow._id);
    await currentUser.save();

    // Create notification
    await Notification.create({
      recipient: userToFollow._id,
      sender: currentUser._id,
      type: 'follow',
      message: `${currentUser.username} started following you`
    });

    res.json({ success: true, message: 'User followed successfully' });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// POST /api/user/unfollow/:id
export const unfollowUser = async (req, res) => {
  try {
    const userToUnfollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.userId);

    if (!userToUnfollow || !currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!currentUser.following.includes(userToUnfollow._id)) {
      return res.status(400).json({ success: false, message: 'You are not following this user' });
    }

    currentUser.following = currentUser.following.filter(
      (id) => id.toString() !== userToUnfollow._id.toString()
    );
    await currentUser.save();

    res.json({ success: true, message: 'User unfollowed successfully' });
  } catch (error) {
    console.error('Unfollow user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// GET /api/user/notifications
export const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.userId })
      .sort({ createdAt: -1 })
      .populate('sender', 'username profilePicture')
      .populate('blog', 'title slug')
      .limit(50);

    res.json({ success: true, notifications });
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/user/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);

    if (!notification) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }

    if (notification.recipient.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json({ success: true, notification });
  } catch (error) {
    console.error('Mark notification read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// PUT /api/user/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    console.error('Mark all notifications read error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};