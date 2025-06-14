import React, { useState, useEffect } from 'react';
import { X, Save, KeyRound, Unlock } from 'lucide-react';

const EditFolderModal = ({ isOpen, onClose, folder, onSave }) => {
    const [name, setName] = useState('');
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen && folder) {
            setName(folder.name);
            setCurrentPassword('');
            setNewPassword('');
            setIsAnimatingOut(false);
        }
    }, [isOpen, folder]);

    if (!isOpen && !isAnimatingOut) return null;

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
            setIsAnimatingOut(false);
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(folder._id, { name, currentPassword, newPassword });
    };

    const modalAnimation = isAnimatingOut ? 'animate-out fade-out-0 zoom-out-95' : 'animate-in fade-in-0 zoom-in-95';

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                className={`bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-md
                            transform transition-all duration-300 ${modalAnimation}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Edit Folder</h2>
                        <p className="text-sm text-neutral-400 truncate pr-4">
                            Editing: <span className="font-semibold text-white">{folder?.name}</span>
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="text-sm font-medium text-neutral-400 block mb-2">Folder Name</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="Folder Name" 
                            required 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                        />
                    </div>

                    {folder.hasPassword && (
                        <div>
                            <label className="text-sm font-medium text-neutral-400 block mb-2 flex items-center">
                                <Unlock size={14} className="mr-2" /> Current Password
                            </label>
                            <input 
                                type="password" 
                                value={currentPassword} 
                                onChange={e => setCurrentPassword(e.target.value)} 
                                placeholder="Required to make changes" 
                                required 
                                className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                            />
                        </div>
                    )}
                    
                    <div>
                        <label className="text-sm font-medium text-neutral-400 block mb-2 flex items-center">
                            <KeyRound size={14} className="mr-2" /> New Password
                        </label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={e => setNewPassword(e.target.value)} 
                            placeholder="Leave blank to keep or remove password" 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                        />
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" 
                            className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-300"
                        >
                            <Save className="mr-2" size={20} /> Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
export default EditFolderModal;