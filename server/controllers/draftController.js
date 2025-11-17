import { json } from 'express';
import Draft from '../models/Draft.js';
/**
 * POST /api/drafts
 * create a new draft for the user
 */

export const createDraft = async (req, res) => {
    try {
        const author = req.userId;
        const payload = {
            author,
            title: req.body.title || '',
            contentBlocks: Array.isArray(req.body.contentBlocks) ? req.body.contentBlocks : [],
            coverUpload: req.body.coverUpload || null,
            tags: Array.isArray(req.body.tags) ? req.body.tags : [],
            categories: Array.isArray(req.body.categories) ? req.body.categories : [],
            isPublished: !!req.body.isPublished
        };

        const draft = await Draft.create(payload);
        res.status(201).json({ success: true, draft });

    } catch (error) {
        console.error('createDraft error:', error);
        res.status(500).json({ success: false, message: 'Error creating draft' });
    }
};

/**
 * GET /api/drafts
 * List drafts for current user
 */

export const getDrafts = async (req, res) => {
    try {
        const drafts = await Draft.find(
            {
                author: req.userId
            }
        ).sort(
            {
                updatedAt: -1
            }
        );
        res.json(
            {
                success: true,
                drafts
            }
        );
    } catch (error) {
        console.error('getdrafts error:', error);
        res.status(500),json(
            {
                success: false, message: 'Error fetching drafts'
            });
    }
};


/**
 * GET /api/drafts/:id
 * Return the draft if owned by the user
 */
export const getDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (draft.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    res.json({ success: true, draft });
  } catch (error) {
    console.error('getDraft error:', error);
    res.status(500).json({ success: false, message: 'Error fetching draft' });
  }
};




/**
 * PUT /api/drafts/:id
 * Update draft (author only)
 */
export const updateDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    if (draft.author.toString() !== req.userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    draft.title = req.body.title !== undefined ? req.body.title : draft.title;
    if (Array.isArray(req.body.contentBlocks)) draft.contentBlocks = req.body.contentBlocks;
    if (req.body.coverUpload !== undefined) draft.coverUpload = req.body.coverUpload;
    if (Array.isArray(req.body.tags)) draft.tags = req.body.tags;
    if (Array.isArray(req.body.categories)) draft.categories = req.body.categories;
    if (req.body.isPublished !== undefined) draft.isPublished = !!req.body.isPublished;
    draft.lastSavedAt = new Date();

    await draft.save();
    res.json({ success: true, draft });
  } catch (error) {
    console.error('updateDraft error:', error);
    res.status(500).json({ success: false, message: 'Error updating draft' });
  }
};

/**
 * DELETE /api/drafts/:id
 * Delete a draft (author or admin)
 */
export const deleteDraft = async (req, res) => {
  try {
    const draft = await Draft.findById(req.params.id);
    if (!draft) return res.status(404).json({ success: false, message: 'Draft not found' });
    const user = req.user;
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized' });
    const isOwner = draft.author.toString() === req.userId;
    const isAdmin = user.role === 'admin';
    if (!isOwner && !isAdmin) return res.status(403).json({ success: false, message: 'Forbidden' });

    await Draft.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Draft deleted' });
  } catch (error) {
    console.error('deleteDraft error:', error);
    res.status(500).json({ success: false, message: 'Error deleting draft' });
  }
};