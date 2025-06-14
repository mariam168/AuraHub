const express = require('express');
const router = express.Router();

const { 
    register, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    getMe 
} = require('../controllers/authController');

const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/me', authMiddleware, getMe);

module.exports = router;