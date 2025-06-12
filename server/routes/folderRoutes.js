const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');
router.get('/content/:folderId', authMiddleware, folderController.getContent);
router.get('/all', authMiddleware, folderController.getAllFoldersForNav);
router.post('/', authMiddleware, folderController.createFolder);
router.put('/:id', authMiddleware, folderController.updateFolder);
router.delete('/:id', authMiddleware, folderController.softDeleteFolder);
router.post('/:id/restore', authMiddleware, folderController.restoreFolder);

module.exports = router;