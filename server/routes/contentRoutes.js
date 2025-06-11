const express = require('express');
const router = express.Router();

// --- Middleware ---
// <--- [الحل] لازم نعمل استدعاء للـ middleware هنا عشان نقدر نستخدمه
const auth = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// --- Controllers ---
const folderController = require('../controllers/folderController');
const mediaController = require('../controllers/mediaController');

// ===================
// --- Folder Routes ---
// ===================
router.post('/folders', auth, folderController.createFolder);
router.get('/folders/nav', auth, folderController.getAllFoldersForNav);
router.get('/folders/:folderId', auth, folderController.getContent);
router.put('/folders/:id', auth, folderController.updateFolder);
router.post('/folders/:id/delete', auth, folderController.softDeleteFolder);
router.post('/folders/:id/restore', auth, folderController.restoreFolder);
// You might want a permanent delete for folders from trash view later
// router.delete('/folders/:id/permanent', auth, folderController.deleteFolderPermanently);


// ==================
// --- Media Routes ---
// ==================
router.post('/media/upload', auth, upload.array('files'), mediaController.uploadMedia);
router.put('/media/:id/favorite', auth, mediaController.toggleFavorite);
router.post('/media/:id/delete', auth, mediaController.softDeleteMedia);
router.post('/media/:id/restore', auth, mediaController.restoreMedia);
router.post('/media/:id/permanent', auth, mediaController.deleteMediaPermanently); // Using POST to match others
router.put('/media/:id', auth, mediaController.updateMedia); // <-- The route that caused the error is now correct

module.exports = router;