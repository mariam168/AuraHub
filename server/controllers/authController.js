const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

// Setup for the email service (Nodemailer)
// Note: For Gmail, you must use an "App Password" if you have 2-Factor Authentication enabled.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

/**
 * @desc    Register a new user and send a verification email.
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = new User({ username, email, password });

        // Hash password before saving
        user.password = await bcrypt.hash(password, 10);

        // Create a verification token
        user.verificationToken = crypto.randomBytes(20).toString('hex');

        await user.save();

        // **CORRECTED PORT**: Use the frontend's port (5173 for Vite)
        const verificationUrl = `http://localhost:5173/verify-email?token=${user.verificationToken}`;
        
        await transporter.sendMail({
            to: user.email,
            subject: 'Verify Your Email Address for AuraHub',
            html: `<p>Thank you for registering! Please click this link to verify your email address:</p>
                   <p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        });
        
        // On successful registration, we only send a message. The user must verify before logging in.
        res.status(201).json({ msg: 'Registration successful. Please check your email to verify your account.' });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server error during registration.' });
    }
};

/**
 * @desc    Authenticate user and get token (login).
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // **SECURITY CHECK**: Ensure the user has verified their email before allowing login.
        if (!user.isVerified) {
            return res.status(401).json({ msg: 'Please verify your email to log in.' });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

/**
 * @desc    Verify user's email with the token.
 * @route   GET /api/auth/verify-email
 * @access  Public
 */
exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        // Find user by the token. We must use .select() because the token is hidden in the schema.
        const user = await User.findOne({ verificationToken: token }).select('+verificationToken');

        if (!user) {
            return res.status(400).json({ msg: 'Invalid or expired verification token.' });
        }

        user.isVerified = true;
        user.verificationToken = undefined; // Token is used, so we clear it.
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server error during email verification.' });
    }
};

/**
 * @desc    Handle forgot password request by sending a reset link.
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            // We send a generic success message even if the user doesn't exist to prevent email enumeration.
            return res.status(200).json({ msg: 'If a user with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // Expires in 1 hour
        await user.save();

        // **CORRECTED PORT**: Use the frontend's port (5173 for Vite)
        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Please click the following link to complete the process within one hour:</p>
                   <p><a href="${resetUrl}">${resetUrl}</a></p>
                   <p>If you did not request this, please ignore this email.</p>`,
        });

        res.status(200).json({ msg: 'If a user with that email exists, a password reset link has been sent.' });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server error during forgot password process.' });
    }
};

/**
 * @desc    Reset user's password using the token.
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { password } = req.body;

        // Find the user by the valid, non-expired token.
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ msg: 'Password reset token is invalid or has expired.' });
        }

        // Set the new password
        user.password = await bcrypt.hash(password, 10);
        // Clear the reset token fields
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Also verify the user if they were unverified, as a convenience.
        user.isVerified = true; 
        
        await user.save();

        res.status(200).json({ msg: 'Your password has been successfully reset.' });

    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server error during password reset.' });
    }
};


/**
 * @desc    Get the logged-in user's data.
 * @route   GET /api/auth/me
 * @access  Private (Requires a valid token)
 */
exports.getMe = async (req, res) => {
    try {
        // req.user.id is attached by the auth middleware
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        res.json(user);
    } catch (e) {
        console.error(e.message);
        res.status(500).json({ error: 'Server Error' });
    }
};