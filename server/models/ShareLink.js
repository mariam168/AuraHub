const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const ShareLinkSchema = new mongoose.Schema({
    itemId: { type: mongoose.Schema.Types.ObjectId, required: true },
    itemType: { type: String, enum: ['folder', 'media'], required: true },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    accessKey: { type: String, required: true, unique: true },
    password: { type: String, select: false },
    expiresAt: { type: Date }
}, { timestamps: true });

ShareLinkSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
});
module.exports = mongoose.model('ShareLink', ShareLinkSchema);