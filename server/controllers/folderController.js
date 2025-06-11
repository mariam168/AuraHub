const Folder = require('../models/Folder');
const Media = require('../models/Media');

const checkFolderAccess = async (folderId, userId, password) => {
    if (!folderId) return true;
    const folder = await Folder.findById(folderId).select('+password');
    if (!folder || folder.user.toString() !== userId) throw new Error('Folder not found');
    if (folder.password) {
        if (!password) throw new Error('Password required');
        const isMatch = await folder.comparePassword(password);
        if (!isMatch) throw new Error('Incorrect password');
    }
    return true;
};

exports.getContent = async (req, res) => {
    const { folderId } = req.params;
    const { password, search, type, view } = req.query;
    try {
        const parentId = folderId === 'root' ? null : folderId;

        if (view !== 'trash') {
            await checkFolderAccess(parentId, req.user.id, password);
        }

        let folderQuery = { user: req.user.id, parentFolder: parentId };
        let mediaQuery = { user: req.user.id, folder: parentId };

        if (view === 'trash') {
            folderQuery.isDeleted = true;
            mediaQuery.isDeleted = true;
        } else {
            folderQuery.isDeleted = false;
            mediaQuery.isDeleted = false;
        }

        if (search) {
            const regex = new RegExp(search, 'i');
            folderQuery.name = regex;
            mediaQuery.filename = regex;
        }

        if (type) {
            if (type === 'favorites') {
                mediaQuery.isFavorite = true;
                folderQuery = { _id: null }; 
            } else {
                 mediaQuery.type = type;
            }
        }
        
        const folders = await Folder.find(folderQuery);
        const media = await Media.find(mediaQuery);
        
        const foldersWithPasswordStatus = folders.map(f => ({ ...f.toObject(), hasPassword: !!f.password }));
        res.json({ folders: foldersWithPasswordStatus, media });
    } catch (e) {
        if (e.message === 'Password required') return res.status(403).json({ msg: e.message, requiresPassword: true });
        if (e.message === 'Incorrect password') return res.status(401).json({ msg: e.message });
        res.status(404).json({ msg: e.message });
    }
};

exports.getAllFoldersForNav = async (req, res) => {
    try {
        const folders = await Folder.find({ user: req.user.id, isDeleted: false }).select('name parentFolder');
        res.json(folders);
    } catch(e) {
        res.status(500).json({ msg: "Error fetching all folders." });
    }
};

exports.createFolder = async (req, res) => {
    const { name, parentFolder, password } = req.body;
    try {
        const newFolder = new Folder({ name, parentFolder: parentFolder || null, password, user: req.user.id });
        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (e) { res.status(400).json({ msg: e.message }); }
};

exports.updateFolder = async (req, res) => {
    const { name, currentPassword, newPassword } = req.body;
    try {
        const folder = await Folder.findById(req.params.id).select('+password');
        if (!folder || folder.user.toString() !== req.user.id) return res.status(404).json({ msg: 'Folder not found' });
        if (folder.password) {
            if (!currentPassword) return res.status(401).json({ msg: 'Current password is required' });
            const isMatch = await folder.comparePassword(currentPassword);
            if (!isMatch) return res.status(401).json({ msg: 'Incorrect current password' });
        }
        if (name) folder.name = name;
        if (newPassword !== undefined) folder.password = newPassword;
        await folder.save();
        res.json({ msg: 'Folder updated' });
    } catch (e) { res.status(400).json({ msg: e.message }); }
};

exports.softDeleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
        if (!folder) return res.status(404).json({ msg: "Folder not found" });
        const deleteRecursively = async (folderId) => {
            await Media.updateMany({ folder: folderId, user: req.user.id }, { isDeleted: true, deletedAt: new Date() });
            const subFolders = await Folder.find({ parentFolder: folderId, user: req.user.id });
            for (const sub of subFolders) {
                await deleteRecursively(sub._id);
                await Folder.updateOne({ _id: sub._id }, { isDeleted: true, deletedAt: new Date() });
            }
        };
        await deleteRecursively(req.params.id);
        await Folder.updateOne({ _id: req.params.id }, { isDeleted: true, deletedAt: new Date() });
        res.json({ msg: 'Folder and its content moved to trash.' });
    } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.restoreFolder = async (req, res) => {
    try {
        const folder = await Folder.findOne({ _id: req.params.id, user: req.user.id });
        if (!folder) return res.status(404).json({ msg: "Folder not found" });
        const restoreRecursively = async (folderId) => {
            await Media.updateMany({ folder: folderId, user: req.user.id }, { isDeleted: false, deletedAt: null });
            const subFolders = await Folder.find({ parentFolder: folderId, user: req.user.id });
            for (const sub of subFolders) {
                await restoreRecursively(sub._id);
                await Folder.updateOne({ _id: sub._id }, { isDeleted: false, deletedAt: null });
            }
        };
        await restoreRecursively(req.params.id);
        await Folder.updateOne({ _id: req.params.id }, { isDeleted: false, deletedAt: null });
        res.json({ msg: 'Folder and its content restored.' });
    } catch (e) { res.status(500).json({ msg: e.message }); }
};