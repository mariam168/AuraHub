const Media = require('../models/Media');
const Folder = require('../models/Folder');
const path = require('path');
const fs = require('fs/promises');
const getFileType = (mimetype) => {
    if (mimetype.startsWith('image/')) return 'image';
    if (mimetype.startsWith('video/')) return 'video';
    if (mimetype.startsWith('audio/')) return 'audio';
    if (mimetype === 'application/pdf') return 'pdf';
    if (mimetype.startsWith('application/vnd.openxmlformats-officedocument') || mimetype.startsWith('application/msword') || mimetype.startsWith('application/vnd.ms-excel') || mimetype.startsWith('application/vnd.ms-powerpoint')) {
        return 'document';
    }
    if (mimetype.startsWith('text/')) return 'text';
    return 'other';
};

const hasWriteAccess = (folder, userId) => {
    if (folder.user.equals(userId)) return true;
    const collaborator = folder.collaborators.find(c => c.user.equals(userId));
    return collaborator && collaborator.role === 'editor';
};

const checkMediaAccess = async (mediaId, userId) => {
    const media = await Media.findById(mediaId).populate('folder');
    if (!media) return null;
    if (media.user.equals(userId)) return media;
    if (media.folder && hasWriteAccess(media.folder, userId)) return media;
    return null;
}

exports.uploadMedia = async (req, res) => {
    const { folderId } = req.body;
    const userId = req.user.id;
    try {
        let ownerId = userId;
        if (folderId && folderId !== 'root') {
            const parentFolder = await Folder.findById(folderId);
            if (!parentFolder) return res.status(404).json({ msg: "Target folder not found." });
            if (!hasWriteAccess(parentFolder, userId)) return res.status(403).json({ msg: 'You do not have permission to upload to this folder.' });
            ownerId = parentFolder.user;
        }
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded' });
        
        const mediaItems = req.files.map(file => ({
            user: ownerId,
            filename: file.originalname,
            path: `uploads/${file.filename}`,
            mimetype: file.mimetype,
            type: getFileType(file.mimetype), 
            folder: folderId === 'root' ? null : folderId
        }));

        await Media.insertMany(mediaItems);
        res.status(201).json({ msg: 'Files uploaded successfully' });
    } catch (e) { res.status(400).json({ msg: e.message }); }
};
exports.updateMedia = async (req, res) => {
    const { filename, folderId } = req.body;
    try {
        const media = await checkMediaAccess(req.params.id, req.user.id);
        if (!media) return res.status(404).json({ msg: "File not found or access denied" });
        if (filename) media.filename = filename;
        if (folderId !== undefined) media.folder = folderId === 'null' ? null : folderId;
        await media.save();
        res.json(media);
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.toggleFavorite = async (req, res) => {
    try {
        const media = await checkMediaAccess(req.params.id, req.user.id);
        if (!media) return res.status(404).json({ msg: "File not found or access denied" });
        media.isFavorite = !media.isFavorite;
        await media.save();
        res.json(media);
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.softDeleteMedia = async (req, res) => {
    try {
        const media = await checkMediaAccess(req.params.id, req.user.id);
        if (!media) return res.status(404).json({ msg: "File not found or access denied" });
        await Media.updateOne({ _id: req.params.id }, { isDeleted: true, deletedAt: new Date() });
        res.json({ msg: 'File moved to trash.' });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.restoreMedia = async (req, res) => {
    try {
        const media = await checkMediaAccess(req.params.id, req.user.id);
        if (!media) return res.status(404).json({ msg: "File not found or access denied" });
        await Media.updateOne({ _id: req.params.id }, { isDeleted: false, deletedAt: null });
        res.json({ msg: 'File restored.' });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.deleteMediaPermanently = async (req, res) => {
    try {
        const media = await checkMediaAccess(req.params.id, req.user.id);
        if (!media) return res.status(404).json({ msg: "File not found or access denied" });
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