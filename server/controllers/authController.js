import User from "../models/User.js";
import { generateToken } from '../utils/generateToken.js';

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

//@desc get current user profile
// @route GET /api/auth/profile
//@access Private
export const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.userId);

        res.json({
            success: true,
            user
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching profile'
        });
    };
};