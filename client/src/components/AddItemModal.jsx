import React, { useState, useEffect } from 'react';
import { X, FolderPlus, UploadCloud, Shield } from 'lucide-react';

const AddItemModal = ({ isOpen, onClose, onCreateFolder, onUploadMedia }) => {
    const [activeTab, setActiveTab] = useState('upload'); // 'upload' or 'folder'
    const [name, setName] = useState('');
    const [password, setPassword] = useState('');
    const [files, setFiles] = useState(null);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen) {
            // Reset state when modal opens
            setActiveTab('upload');
            setName('');
            setPassword('');
            setFiles(null);
            setIsAnimatingOut(false);
        }
    }, [isOpen]);

    if (!isOpen && !isAnimatingOut) return null;

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300); // Animation duration
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (activeTab === 'folder') {
            if (name) onCreateFolder(name, password);
        } else if (files && files.length > 0) {
            onUploadMedia(files);
        }
    };
    
    const modalAnimation = isAnimatingOut ? 'animate-out fade-out-0 zoom-out-95' : 'animate-in fade-in-0 zoom-in-95';

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4 transition-opacity duration-300"
            onClick={handleClose}
        >
            <div 
                className={`bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-lg
                            transform transition-all duration-300 ${modalAnimation}`}
                onClick={e => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">
                        {activeTab === 'folder' ? 'Create New Folder' : 'Upload Files'}
                    </h2>
                    <button onClick={handleClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <div className="flex border-b border-neutral-800 mb-6">
                    <button 
                        onClick={() => setActiveTab('upload')} 
                        className={`py-3 px-5 font-semibold text-sm transition-all duration-200 relative
                                    ${activeTab === 'upload' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <UploadCloud size={18} className="inline-block mr-2" /> Upload
                        {activeTab === 'upload' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></div>}
                    </button>
                    <button 
                        onClick={() => setActiveTab('folder')} 
                        className={`py-3 px-5 font-semibold text-sm transition-all duration-200 relative
                                    ${activeTab === 'folder' ? 'text-white' : 'text-neutral-400 hover:text-white'}`}
                    >
                        <FolderPlus size={18} className="inline-block mr-2" /> New Folder
                        {activeTab === 'folder' && <div className="absolute bottom-0 left-0 w-full h-0.5 bg-white rounded-full"></div>}
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {activeTab === 'folder' ? (
                        <div className="space-y-4 animate-in fade-in-0">
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2">Folder Name</label>
                                <input 
                                    type="text" 
                                    value={name} 
                                    onChange={e => setName(e.target.value)} 
                                    placeholder="e.g. 'Vacation Photos'" 
                                    required 
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-neutral-400 block mb-2 flex items-center">
                                    <Shield size={14} className="mr-2" /> Optional Password
                                </label>
                                <input 
                                    type="password" 
                                    value={password} 
                                    onChange={e => setPassword(e.target.value)} 
                                    placeholder="Leave blank for no password" 
                                    className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                                />
                            </div>
                        </div>
                    ) : (
                        <div className="animate-in fade-in-0">
                             <label 
                                htmlFor="file-upload" 
                                className="w-full flex flex-col items-center justify-center p-8 border-2 border-dashed border-neutral-700 rounded-lg cursor-pointer hover:bg-neutral-800 hover:border-neutral-600 transition-colors"
                             >
                                <UploadCloud size={40} className="text-neutral-500 mb-3" />
                                <span className="text-lg font-semibold text-white">Click to browse or drag files here</span>
                                <span className="text-sm text-neutral-400 mt-1">Maximum file size: 100MB</span>
                                <input 
                                    id="file-upload"
                                    type="file" 
                                    multiple 
                                    onChange={e => setFiles(e.target.files)} 
                                    className="hidden"
                                />
                                {files && files.length > 0 && (
                                    <p className="mt-4 text-sm text-green-400 bg-green-900/50 px-3 py-1 rounded-md">
                                        {files.length} file(s) selected.
                                    </p>
                                )}
                             </label>
                        </div>
                    )}
                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-300"
                        >
                            {activeTab === 'folder' ? <FolderPlus className="mr-2"/> : <UploadCloud className="mr-2"/>}
                            {activeTab === 'folder' ? 'Create Folder' : 'Upload Files'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default AddItemModal;