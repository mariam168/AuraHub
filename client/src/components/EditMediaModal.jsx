import React, { useState, useEffect } from 'react';
import { X, Edit, Loader2 } from 'lucide-react';

const EditMediaModal = ({ isOpen, onClose, onSave, media, allFolders, loading, error }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [folderId, setFolderId] = useState(null);

    useEffect(() => {
        if (media) {
            setTitle(media.filename || '');
            setDescription(media.description || '');
            setTags(Array.isArray(media.tags) ? media.tags.join(', ') : '');
            setFolderId(media.folder || 'null');
        }
    }, [media, isOpen]);

    const buildFolderOptions = (folders, parentId = null, depth = 0) => {
        const options = [];
        if (!Array.isArray(folders)) return options;
        const sortedFolders = [...folders].sort((a, b) => a.name.localeCompare(b.name));
        const children = sortedFolders.filter(f => (f.parentFolder === parentId || (f.parentFolder === null && parentId === null)));

        children.forEach(folder => {
            const prefix = "— ".repeat(depth);
            options.push(
                <option key={folder._id} value={folder._id}>
                    {prefix}{folder.name}
                </option>
            );
            options.push(...buildFolderOptions(sortedFolders, folder._id, depth + 1));
        });
        return options;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(media._id, {
            filename: title,
            description,
            tags,
            folderId: folderId === 'null' ? null : folderId,
        });
    };

    if (!isOpen || !media) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full">
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-2xl font-bold">Edit Media</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200"><X size={24} /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full p-2 border rounded-md" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Description</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full p-2 border rounded-md"></textarea>
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
                        <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} className="w-full p-2 border rounded-md" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-1">Move to Folder</label>
                        <select value={folderId || 'null'} onChange={(e) => setFolderId(e.target.value)} className="w-full p-2 border rounded-md">
                            <option value="null">Root Folder</option>
                            {buildFolderOptions(allFolders, null, 0)}
                        </select>
                    </div>
                    {error && <p className="text-sm text-red-500">{error}</p>}
                    <button type="submit" className="w-full flex items-center justify-center py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <><Edit className="mr-2" /> Save</>}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default EditMediaModal;