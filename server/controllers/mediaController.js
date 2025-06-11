const Media = require('../models/Media');
const path = require('path');
const fs = require('fs/promises');

exports.uploadMedia = async (req, res) => {
    const { folderId } = req.body;
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded' });
        const mediaItems = req.files.map(file => ({
            user: req.user.id,
            filename: file.originalname,
            path: `uploads/${file.filename}`,
            mimetype: file.mimetype,
            type: file.mimetype.split('/')[0] || 'other',
            folder: folderId === 'root' ? null : folderId
        }));
        await Media.insertMany(mediaItems);
        res.status(201).json({ msg: 'Files uploaded successfully' });
    } catch (e) { res.status(400).json({ msg: e.message }); }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media || media.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: "File not found" });
        }
        media.isFavorite = !media.isFavorite;
        await media.save();
        res.json(media);
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.softDeleteMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media || media.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: "File not found" });
        }
        await Media.updateOne({ _id: req.params.id }, { isDeleted: true, deletedAt: new Date() });
        res.json({ msg: 'File moved to trash.' });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.restoreMedia = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media || media.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: "File not found" });
        }
        await Media.updateOne({ _id: req.params.id }, { isDeleted: false, deletedAt: null });
        res.json({ msg: 'File restored.' });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.deleteMediaPermanently = async (req, res) => {
    try {
        const media = await Media.findById(req.params.id);
        if (!media || media.user.toString() !== req.user.id) {
            return res.status(404).json({ msg: "File not found" });
        }
        const fullPath = path.join(__dirname, '..', '..', 'public', media.path);
        try {
            await fs.unlink(fullPath);
        } catch(e) {
            console.warn("File not on disk but deleting DB record:", fullPath);
        }
        await media.deleteOne();
        res.json({ msg: 'File permanently deleted.' });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};
// Add this function to your mediaController.js file

exports.updateMedia = async (req, res) => {
    const { filename, description, tags, folderId } = req.body;
    try {
        const media = await Media.findOne({ _id: req.params.id, user: req.user.id });
        if (!media) {
            return res.status(404).json({ msg: "File not found" });
        }

        if (filename) media.filename = filename;
        // The model doesn't have description/tags, but we can add them if needed.
        // For now, we'll just handle moving the file.
        if (folderId !== undefined) {
             media.folder = folderId === 'null' ? null : folderId;
        }
        
        await media.save();
        res.json(media);
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};