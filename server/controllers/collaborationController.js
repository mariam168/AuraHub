const Folder = require('../models/Folder');
const User = require('../models/User');
exports.addCollaborator = async (req, res) => {
    const { email, role } = req.body;
    const { folderId } = req.params;
    const ownerId = req.user.id;

    try {
        const folder = await Folder.findById(folderId);
        if (!folder || !folder.user.equals(ownerId)) {
            return res.status(403).json({ msg: 'Access denied. You are not the owner.' });
        }
        const userToAdd = await User.findOne({ email });
        if (!userToAdd) {
            return res.status(404).json({ msg: 'User with this email not found.' });
        }
        if (userToAdd.id === ownerId) {
            return res.status(400).json({ msg: 'You cannot add yourself as a collaborator.' });
        }
        if (folder.collaborators.some(c => c.user.equals(userToAdd._id))) {
            return res.status(400).json({ msg: 'User is already a collaborator.' });
        }
        folder.collaborators.push({ user: userToAdd._id, role });
        await folder.save();
        await folder.populate('collaborators.user', 'username email');
        res.json(folder.collaborators);

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server error' });
    }
};
exports.removeCollaborator = async (req, res) => {
    const { folderId, collaboratorId } = req.params;
    const ownerId = req.user.id;
    try {
        const folder = await Folder.findById(folderId);

        if (!folder || !folder.user.equals(ownerId)) {
            return res.status(403).json({ msg: 'Access denied. You are not the owner.' });
        }
        folder.collaborators = folder.collaborators.filter(
            c => c.user.toString() !== collaboratorId
        );
        await folder.save();

        await folder.populate('collaborators.user', 'username email');
        res.json(folder.collaborators);

    } catch (e) {
        console.error(e);
        res.status(500).json({ msg: 'Server error' });
    }
};