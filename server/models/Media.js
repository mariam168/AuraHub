const mongoose = require('mongoose');
const MediaSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    filename: { type: String, required: true },
    path: { type: String, required: true },
    mimetype: { type: String, required: true },
    type: { type: String, required: true },
    folder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    isFavorite: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date }
}, { timestamps: true });
module.exports = mongoose.model('Media', MediaSchema);