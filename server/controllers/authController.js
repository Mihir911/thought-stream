import User from "../models/User.js";
import { generateToken } from '../utils/generateToken.js';
import sendEmail from '../utils/email.js';
import crypto from 'crypto';

//@desc Register new user
// @route POST /api/auth/register
//@access public
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, interests } = req.body;

        //check if user exist
        const existingUser = await User.findOne({
            $or: [{ email }, { username }]
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists Please log in with Password'
            });
        }

        //create user
        const user = await User.create({
            username,
            email,
            password,
            interests: Array.isArray(interests) ? interests : []
        });

        if (user) {
            res.status(201).json({
                success: true,
                message: 'User registered successfuly',
                user,
                token: generateToken(user._id)
            });
        }

    } catch (error) {
        console.error('Register error: ', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });

    };
};

//@desc login user
// @route POST /api/auth/login
// @access public
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        //find user by email
        const user = await User.findOne({ email });

        if (user && (await user.comparePassword(password))) {
            res.json({
                success: true,
                message: 'login successfull',
                user,
                token: generateToken(user._id)
            });
        } else {
            res.status(401).json({
                success: false,
                message: 'Invalid email or passsword'
            });

        }
    } catch (error) {
        console.error('login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc Forgot Password
// @route POST /api/auth/forgot-password
// @access Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        // Hash OTP before saving (optional security measure, but storing plain for simplicity here as it's short lived)
        // For better security, we should hash it. Let's store plain for now as per request for "simple" system, 
        // but typically we'd hash. Actually, let's just store it.
        user.otp = otp;
        user.otpExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

        await user.save();

        const message = `Your password reset OTP is: ${otp}. It expires in 10 minutes.`;

        try {
            await sendEmail({
                email: user.email,
                subject: 'Password Reset OTP',
                message,
                html: `<h1>Password Reset</h1><p>Your OTP is: <strong>${otp}</strong></p><p>It expires in 10 minutes.</p>`
            });

            res.json({ success: true, message: 'OTP sent to email' });
        } catch (error) {
            user.otp = undefined;
            user.otpExpires = undefined;
            await user.save();
            console.error('Email send error:', error);
            return res.status(500).json({ success: false, message: error.message });
        }

    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc Reset Password
// @route POST /api/auth/reset-password
// @access Public
export const resetPassword = async (req, res) => {
    try {
        const { email, otp, password } = req.body;

        const user = await User.findOne({
            email,
            otp,
            otpExpires: { $gt: Date.now() }
        }).select('+otp +otpExpires');

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
        }

        user.password = password;
        user.otp = undefined;
        user.otpExpires = undefined;
        await user.save();

        res.json({ success: true, message: 'Password reset successful' });

    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};