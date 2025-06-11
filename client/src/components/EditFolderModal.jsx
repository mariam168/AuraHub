import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const EditFolderModal = ({ isOpen, onClose, folder, onSave }) => {
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');

    useEffect(() => {
        if (folder) {
            setName(folder.name);
            setCurrentPassword('');
            setNewPassword('');
        }
    }, [folder]);

    if (!isOpen || !folder) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(folder._id, { name, currentPassword, newPassword });
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                 <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Edit Folder: {folder.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Folder Name" required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                    {folder.hasPassword && <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Current Password" required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />}
                    <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} placeholder="New or blank to remove" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="w-full bg-green-600 text-white p-3 rounded-lg font-bold hover:bg-green-700 flex items-center justify-center">
                        <Save className="mr-2" /> Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
};
export default EditFolderModal;