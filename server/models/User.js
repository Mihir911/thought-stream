import mongoose from "mongoose";
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 character'],
        maxlength: [30, 'Username cannot exceed 30 characters']
    },

    email: {
        type: String,
        required: [true, 'Email is requied'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },

    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 char long']
    },

    profilePicture: {
        type: String,
        default: ''
    },

    bio: {
        type: String,
        maxlength: 500,
        default: ''
    },

    interests: [{
        category: String,
        score: { type: Number, default: 1 }
    }],
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],

    // bookmarks and reading progress for 'save for latter'
    bookmarks: [{
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog',
            required: true
        },
        savedAt: { type: Date, default: Date.now },
        //reading progress in second or percentage (frontend choose)
        progress: { type: Number, default: 0 },
        //mart if saved offline for the user (PWA)
        offline: { type: Boolean, default: false }
    }],
    readingHistory: [{
        blog: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        },
        readAt: {
            type: Date,
            default: Date.now
        },
        timeSpent: Number // in seconds
    }],


    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },

    // user preferances for email digest / newsletters
    preferences: {
        newsletter: { type: Boolean, default: false },
        digestFrequency: { type: String, enum: ['daily', 'weekly', 'monthly', 'none'], default: 'weekly' }
    }
}, { timestamps: true });

//pass hashing
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();

    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

//compare pass
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

//remove pass
userSchema.methods.toJSON = function () {
    const user = this.toObject();
    delete user.password;
    return user;
};

export default mongoose.model('User', userSchema);
