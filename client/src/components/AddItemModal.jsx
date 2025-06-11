import React, { useState } from 'react';
import { X, FolderPlus, UploadCloud } from 'lucide-react';

const AddItemModal = ({ isOpen, onClose, onCreateFolder, onUploadMedia }) => {
    const [isFolder, setIsFolder] = useState(false);
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [files, setFiles] = useState(null);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (isFolder) {
            onCreateFolder(name, password);
        } else if (files) {
            onUploadMedia(files);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{isFolder ? 'Create New Folder' : 'Upload Files'}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
                </div>
                <div className="flex border-b mb-4">
                    <button onClick={() => setIsFolder(false)} className={`py-2 px-4 font-semibold ${!isFolder ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>Upload</button>
                    <button onClick={() => setIsFolder(true)} className={`py-2 px-4 font-semibold ${isFolder ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>New Folder</button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {isFolder ? (
                        <>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Folder Name" required className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password (Optional)" className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                        </>
                    ) : (
                        <input type="file" multiple onChange={e => setFiles(e.target.files)} className="w-full p-2 border rounded-md file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    )}
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center">
                        {isFolder ? <FolderPlus className="mr-2"/> : <UploadCloud className="mr-2"/>}
                        {isFolder ? 'Create Folder' : 'Upload'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default AddItemModal;