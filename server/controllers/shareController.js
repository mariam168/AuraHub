const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const ShareLink = require('../models/ShareLink');
const Folder = require('../models/Folder');
const Media = require('../models/Media');

exports.createShareLink = async (req, res) => {
    const { itemId, itemType, password, expiresAt } = req.body;
    try {
        const accessKey = crypto.randomBytes(8).toString('hex');
        const newLink = new ShareLink({
            itemId, itemType, owner: req.user.id, accessKey, password, expiresAt
        });
        await newLink.save();
        res.status(201).json({ link: `${req.protocol}://${req.get('host')}/share/${accessKey}` });
    } catch (e) { res.status(500).json({ msg: e.message }); }
};

exports.getSharedContent = async (req, res) => {
    const { accessKey } = req.params;
    const { password } = req.body;
    try {
        const link = await ShareLink.findOne({ accessKey }).select('+password');
        if (!link || (link.expiresAt && new Date() > link.expiresAt)) {
            return res.status(404).json({ msg: 'Link not found or has expired' });
        }
        if (link.password) {
            if (!password) return res.status(401).json({ msg: 'Password required', requiresPassword: true });
            const isMatch = await bcrypt.compare(password, link.password);
            if (!isMatch) return res.status(401).json({ msg: 'Incorrect password' });
        }
        
        let content;
        if (link.itemType === 'folder') {
            const folder = await Folder.findById(link.itemId);
            const folders = await Folder.find({ parentFolder: link.itemId });
            const media = await Media.find({ folder: link.itemId });
            content = { type: 'folder', name: folder.name, folders, media };
        } else {
            const media = await Media.findById(link.itemId);
            content = { type: 'media', ...media.toObject() };
        }
        res.json(content);
    } catch(e) { res.status(500).json({ msg: e.message }); }
};