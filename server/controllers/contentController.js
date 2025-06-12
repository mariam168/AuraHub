const Folder = require('../models/Folder');
const Media = require('../models/Media');
const User = require('../models/User');
const hasAccess = (item, userId) => {
    if (item.owner.toString() === userId) return true;
    return item.collaborators?.some(c => c.user.toString() === userId);
};

exports.getSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const myFolders = await Folder.find({ owner: userId, parentFolder: null });
        const sharedFolders = await Folder.find({ 'collaborators.user': userId, parentFolder: null });
        res.json({ myFolders, sharedFolders });
    } catch (e) { res.status(500).json({ msg: e.message });}
}

exports.getFolderContent = async (req, res) => {
    try {
        const { folderId } = req.params;
        const userId = req.user.id;
        const folders = await Folder.find({ owner: userId, parentFolder: folderId === 'root' ? null : folderId });
        const media = await Media.find({ owner: userId, folder: folderId === 'root' ? null : folderId });
        const populatedFolders = await Promise.all(folders.map(async f => {
            const folder = await Folder.findById(f._id).populate('owner', 'username').populate('collaborators.user', 'username email');
            return folder;
        }));
        res.json({ folders: populatedFolders, media });
    } catch (e) { res.status(500).json({ msg: e.message });}
};
exports.createFolder = async (req, res) => {
    const { name, parentFolder } = req.body;
    try {
        const newFolder = new Folder({ name, owner: req.user.id, parentFolder: parentFolder === 'root' ? null : parentFolder });
        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (e) { res.status(400).json({ msg: e.message }); }
};
exports.uploadFiles = async (req, res) => {
    const { folderId } = req.body;
    try {
        if (!req.files || req.files.length === 0) return res.status(400).json({ msg: 'No files uploaded' });
        const mediaItems = req.files.map(file => ({
            owner: req.user.id,
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

exports.addCollaborator = async (req, res) => {
    const { email, role } = req.body;
    const { folderId } = req.params;
    try {
        const folder = await Folder.findById(folderId);
        if (!folder || folder.owner.toString() !== req.user.id) return res.status(404).json({ msg: 'Folder not found or you are not the owner' });
        
        const userToadd = await User.findOne({ email });
        if (!userToadd) return res.status(404).json({ msg: 'User with this email not found' });
        if(userToadd.id === req.user.id) return res.status(400).json({ msg: "You cannot add yourself as a collaborator." });

        if (folder.collaborators.some(c => c.user.toString() === userToadd.id)) {
            return res.status(400).json({ msg: 'User is already a collaborator' });
        }
        
        folder.collaborators.push({ user: userToadd.id, role });
        await folder.save();
        const updatedFolder = await Folder.findById(folderId).populate('collaborators.user', 'username email');
        res.json(updatedFolder.collaborators);
    } catch(e) { res.status(500).json({ msg: e.message }); }
}