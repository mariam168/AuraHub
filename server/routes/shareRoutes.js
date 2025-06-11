const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/', authMiddleware, shareController.createShareLink);
router.post('/:accessKey', shareController.getSharedContent); // Public access with optional password in body

module.exports = router;