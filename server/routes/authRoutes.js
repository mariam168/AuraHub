const express = require('express');
const router = express.Router();

// استيراد جميع الدوال من وحدة التحكم
const { 
    register, 
    login, 
    verifyEmail, 
    forgotPassword, 
    resetPassword,
    getMe // ** استيراد الدالة الجديدة **
} = require('../controllers/authController');

// استيراد وظيفة التحقق من التوكن
const authMiddleware = require('../middleware/authMiddleware'); // تأكد من أن هذا هو المسار الصحيح لملف الـ middleware

// --- المسارات العامة (لا تتطلب توكن) ---
router.post('/register', register);
router.post('/login', login);
router.get('/verify-email', verifyEmail);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// --- المسار الخاص (يتطلب توكن صالح) ---
// ** هذا هو السطر المفقود الذي يجب إضافته **
// عندما يتم طلب GET /api/auth/me، سيتم أولاً تشغيل authMiddleware.
// إذا كان التوكن صالحًا، سيتم الانتقال إلى دالة getMe.
router.get('/me', authMiddleware, getMe);

module.exports = router;