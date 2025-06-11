const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');

// @route   GET /api/folders/content/:folderId
// @desc    Get content of a specific folder ('root' for the main directory)
router.get('/content/:folderId', authMiddleware, folderController.getContent);

// @route   GET /api/folders/all
// @desc    Get all folders for navigation purposes
router.get('/all', authMiddleware, folderController.getAllFoldersForNav);

// @route   POST /api/folders
// @desc    Create a new folder
router.post('/', authMiddleware, folderController.createFolder);

// @route   PUT /api/folders/:id
// @desc    Update a folder's details
router.put('/:id', authMiddleware, folderController.updateFolder);

// @route   DELETE /api/folders/:id
// @desc    Move a folder to trash (soft delete)
router.delete('/:id', authMiddleware, folderController.softDeleteFolder);

// @route   POST /api/folders/:id/restore
// @desc    Restore a folder from trash
router.post('/:id/restore', authMiddleware, folderController.restoreFolder);

module.exports = router;