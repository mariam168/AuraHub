const Folder = require('../models/Folder');
const Media = require('../models/Media');
const User = require('../models/User');

const hasWriteAccess = (folder, userId) => {
    if (folder.user.equals(userId)) return true;
    const collaborator = folder.collaborators.find(c => c.user.equals(userId));
    return collaborator && collaborator.role === 'editor';
};

const hasReadAccess = (folder, userId) => {
    if (folder.user.equals(userId)) return true;
    return folder.collaborators.some(c => c.user.equals(userId));
};

exports.getSidebar = async (req, res) => {
    try {
        const userId = req.user.id;
        const myFolders = await Folder.find({ user: userId, parentFolder: null, isDeleted: false }).select('name _id');
        const sharedWithMe = await Folder.find({ 'collaborators.user': userId, isDeleted: false }).select('name _id parentFolder');
        res.json({ myFolders, sharedWithMe });
    } catch (e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.getContent = async (req, res) => {
    const { folderId } = req.params;
    const { password, search, type, view } = req.query;
    const userId = req.user.id;

    try {
        const parentId = folderId === 'root' ? null : folderId;
        let queryOwnerId = userId;
        let userRole = 'owner';
        let currentFolder = null;

        if (parentId) {
            currentFolder = await Folder.findById(parentId).select('+password').populate('user', 'username').populate('collaborators.user', 'username email');
            if (!currentFolder) return res.status(404).json({ msg: 'Folder not found' });
            if (!hasReadAccess(currentFolder, userId)) return res.status(403).json({ msg: 'Access Denied.' });
            
            const collaborator = currentFolder.collaborators.find(c => c.user._id.equals(userId));
            if (collaborator) {
                queryOwnerId = currentFolder.user._id;
                userRole = collaborator.role;
            }

            if (currentFolder.password) {
                if (!password) return res.status(403).json({ msg: 'Password required', requiresPassword: true });
                const isMatch = await currentFolder.comparePassword(password);
                if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });
            }
        }

        let folderQuery = { user: queryOwnerId, parentFolder: parentId };
        let mediaQuery = { user: queryOwnerId, folder: parentId };
        
        const isTrashView = view === 'trash';
        folderQuery.isDeleted = isTrashView;
        mediaQuery.isDeleted = isTrashView;

        if (search) {
            const regex = new RegExp(search, 'i');
            folderQuery.name = regex;
            mediaQuery.filename = regex;
        }
        
        if (type && type !== 'all') {
            if (type === 'favorites') {
                mediaQuery.isFavorite = true;
                folderQuery = { _id: null };
            } else {
                // [الحل النهائي] استخدام النوع مباشرة بدون استدعاء دالة غير موجودة
                mediaQuery.type = type;
            }
        }

        const folders = await Folder.find(folderQuery).populate('user', 'username').populate('collaborators.user', 'username email');
        const media = await Media.find(mediaQuery).populate('user', 'username');
        const foldersWithPasswordStatus = folders.map(f => ({ ...f.toObject(), hasPassword: !!f.password }));
        res.json({ folders: foldersWithPasswordStatus, media, userRole, currentFolder });
    } catch (e) {
        if (e.message.includes('Password')) return res.status(401).json({ msg: e.message, requiresPassword: true });
        res.status(500).json({ msg: e.message });
    }
};

exports.getAllFoldersForNav = async (req, res) => {
    try {
        const userId = req.user.id;
        const myFolders = await Folder.find({ user: userId, isDeleted: false }).select('name parentFolder');
        const sharedFolders = await Folder.find({ 'collaborators.user': userId, isDeleted: false }).select('name parentFolder');
        const allFoldersMap = new Map();
        [...myFolders, ...sharedFolders].forEach(folder => {
            if (!allFoldersMap.has(folder._id.toString())) {
                allFoldersMap.set(folder._id.toString(), folder);
            }
        });
        const allFolders = Array.from(allFoldersMap.values());
        res.json(allFolders);
    } catch(e) {
        res.status(500).json({ msg: e.message });
    }
};

exports.createFolder = async (req, res) => {
    const { name, parentFolder, password } = req.body;
    const userId = req.user.id;
    try {
        let ownerId = userId;
        if (parentFolder && parentFolder !== 'root') {
            const parent = await Folder.findById(parentFolder);
            if(parent) {
                if(!hasWriteAccess(parent, userId)) return res.status(403).json({ msg: 'Viewers cannot create folders here.' });
                ownerId = parent.user;
            }
        }
        const newFolder = new Folder({ name, user: ownerId, parentFolder: parentFolder === 'root' ? null : parentFolder, password });
        await newFolder.save();
        res.status(201).json(newFolder);
    } catch (e) { res.status(400).json({ msg: e.message }); }
};

exports.updateFolder = async (req, res) => {
    const { name, currentPassword, newPassword } = req.body;
    try {
        const folder = await Folder.findById(req.params.id).select('+password');
        if (!folder || !hasWriteAccess(folder, req.user.id)) return res.status(403).json({ msg: 'Access denied.' });
        
        if (folder.password) {
            if (!currentPassword) return res.status(401).json({ msg: 'Current password is required to modify a protected folder.' });
            const isMatch = await folder.comparePassword(currentPassword);
            if (!isMatch) return res.status(401).json({ msg: 'Incorrect current password.' });
        }

        if (name) folder.name = name;
        if (newPassword !== undefined) {
             folder.password = newPassword || undefined;
        }
        await folder.save();
        res.json({ msg: 'Folder updated' });
    } catch (e) { res.status(400).json({ msg: e.message }); }
};

exports.softDeleteFolder = async (req, res) => {
    try {
        const folder = await Folder.findById(req.params.id);
        if (!folder || !hasWriteAccess(folder, req.user.id)) return res.status(404).json({ msg: "Folder not found or access denied" });
        const deleteRecursively = async (folderId) => {
            await Media.updateMany({ folder: folderId }, { isDeleted: true, deletedAt: new Date() });
            const subFolders = await Folder.find({ parentFolder: folderId });
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
        const folder = await Folder.findById(req.params.id);
        if (!folder || !hasWriteAccess(folder, req.user.id)) return res.status(404).json({ msg: "Folder not found or access denied" });
        const restoreRecursively = async (folderId) => {
            await Media.updateMany({ folder: folderId }, { isDeleted: false, deletedAt: null });
            const subFolders = await Folder.find({ parentFolder: folderId });
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

exports.addCollaborator = async (req, res) => {
    const { email, role } = req.body;
    const { folderId } = req.params;
    const ownerId = req.user.id;
    try {
        const folder = await Folder.findById(folderId);
        if (!folder || !folder.user.equals(ownerId)) return res.status(403).json({ msg: 'Access denied. You are not the owner.' });
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) return res.status(404).json({ msg: 'User with this email not found.' });
        if (userToAdd.id === ownerId) return res.status(400).json({ msg: 'You cannot add yourself as a collaborator.' });
        if (folder.collaborators.some(c => c.user.equals(userToAdd._id))) return res.status(400).json({ msg: 'User is already a collaborator.' });
        folder.collaborators.push({ user: userToAdd._id, role });
        await folder.save();
        await folder.populate('collaborators.user', 'username email');
        res.json(folder.collaborators);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
};

exports.removeCollaborator = async (req, res) => {
    const { folderId, collaboratorId } = req.params;
    const ownerId = req.user.id;
    try {
        const folder = await Folder.findById(folderId);
        if (!folder || !folder.user.equals(ownerId)) return res.status(403).json({ msg: 'Access denied. You are not the owner.' });
        folder.collaborators = folder.collaborators.filter(c => c.user.toString() !== collaboratorId);
        await folder.save();
        await folder.populate('collaborators.user', 'username email');
        res.json(folder.collaborators);
    } catch (e) {
        res.status(500).json({ msg: 'Server error' });
    }
};