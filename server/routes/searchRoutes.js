import express from "express";
import { globalSearch } from "../controllers/searchController.js";
import { protect } from "../middleware/auth.js"; // optional: protect if needed

const router = express.Router();

// Public search endpoint
router.get("/", globalSearch);

export default router;