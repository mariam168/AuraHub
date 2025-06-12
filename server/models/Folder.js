const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const CollaboratorSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['viewer', 'editor'], default: 'viewer' }
}, { _id: false }); 
const FolderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    parentFolder: { type: mongoose.Schema.Types.ObjectId, ref: 'Folder', default: null },
    password: { type: String, select: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    collaborators: [CollaboratorSchema]
}, { timestamps: true });
FolderSchema.pre('save', async function(next) {
    if (this.isModified('password') && this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    if (!this.password) {
        this.password = undefined;
    }
    next();
});
FolderSchema.methods.comparePassword = async function(candidatePassword) {
    if (!this.password || !candidatePassword) return false;
    return await bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('Folder', FolderSchema);