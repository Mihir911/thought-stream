import express from 'express';
import { protect } from '../middleware/auth.js';
import { createDraft, getDrafts, getDraft, updateDraft, deleteDraft } from '../controllers/draftController.js';


const router = express.Router();

//all routes protected
router.use(protect);

router.post('/', createDraft);
router.get('/', getDrafts);
router.get('/:id', getDraft);
router.put('/:id', updateDraft);
router.delete('/:id', deleteDraft);

export default router;