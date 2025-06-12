const express = require('express');
const router = express.Router();
const mediaController = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');
router.post('/upload', authMiddleware, upload.array('mediaFiles'), mediaController.uploadMedia);
router.put('/:id/favorite', authMiddleware, mediaController.toggleFavorite);
router.delete('/:id', authMiddleware, mediaController.softDeleteMedia);
router.post('/:id/restore', authMiddleware, mediaController.restoreMedia);
router.delete('/:id/permanent', authMiddleware, mediaController.deleteMediaPermanently);

module.exports = router;