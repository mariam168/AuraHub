const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    try {
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User with this email already exists.' });
        }

        user = new User({ username, email, password });
        user.password = await bcrypt.hash(password, 10);
        user.verificationToken = crypto.randomBytes(20).toString('hex');

        console.log('--- Step 1: Token generated ---');
        console.log(user.verificationToken);
        
        await user.save();

        console.log('--- Step 2: Token being sent in email ---');
        console.log(user.verificationToken);
        
        const verificationUrl = `http://localhost:5173/verify-email?token=${user.verificationToken}`;
        
        await transporter.sendMail({
            to: user.email,
            subject: 'Verify Your Email Address for Notakok',
            html: `<p>Thank you for registering! Please click this link to verify your email address:</p><p><a href="${verificationUrl}">${verificationUrl}</a></p>`,
        });
        
        res.status(201).json({ msg: 'Registration successful! Please check your email to verify your account.' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error during registration. Please check server logs.' });
    }
};

exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials. Please check your email and password.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials. Please check your email and password.' });
        }

        if (!user.isVerified) {
            return res.status(401).json({ msg: 'Your account is not verified. Please check your email for the verification link.' });
        }

        const payload = { id: user.id };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });

        res.json({
            token,
            user: { id: user.id, username: user.username, email: user.email }
        });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error during login.' });
    }
};

exports.verifyEmail = async (req, res) => {
    try {
        const { token } = req.query;

        console.log('--- Step 3: Token received from URL ---');
        console.log(token);
        
        const user = await User.findOne({ verificationToken: token }).select('+verificationToken');

        if (!user) {
            console.log('--- Step 4: User NOT FOUND with this token ---');
            return res.status(400).json({ msg: 'This verification link is invalid or has already been used.' });
        }

        console.log('--- Step 4: User FOUND with this token ---');

        user.isVerified = true;
        user.verificationToken = undefined;
        await user.save();

        res.status(200).json({ msg: 'Email verified successfully! You can now log in.' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error during email verification.' });
    }
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(200).json({ msg: 'If an account with that email exists, a password reset link has been sent.' });
        }

        const resetToken = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000;
        await user.save();

        const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;
        
        await transporter.sendMail({
            to: user.email,
            subject: 'Password Reset Request for Notakok',
            html: `<p>You requested a password reset. Please click the following link to complete the process within one hour:</p><p><a href="${resetUrl}">${resetUrl}</a></p><p>If you did not request this, please ignore this email.</p>`,
        });

        res.status(200).json({ msg: 'If an account with that email exists, a password reset link has been sent.' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error during forgot password process.' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { token } = req.query;
        const { password } = req.body;

        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ msg: 'Password reset link is invalid or has expired.' });
        }

        user.password = await bcrypt.hash(password, 10);
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        user.isVerified = true; 
        
        await user.save();

        res.status(200).json({ msg: 'Your password has been successfully reset.' });

    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server error during password reset.' });
    }
};

exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }
        res.json(user);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Server Error' });
    }
};