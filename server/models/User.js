const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    isVerified: { type: Boolean, default: false },
    verificationToken: { 
        type: String,
        select: false 
    },
    resetPasswordToken: { 
        type: String,
        select: false 
    },
    resetPasswordExpires: { 
        type: Date,
        select: false 
    }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);