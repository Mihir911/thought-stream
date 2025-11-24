import express from "express";
import { registerUser, loginUser, forgotPassword, resetPassword } from "../controllers/authController.js";
import { protect } from "../middleware/auth.js";
import { getMe } from "../controllers/userController.js";

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getMe);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

export default router;
