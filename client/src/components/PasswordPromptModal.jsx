import React, { useState } from 'react';
import { X, Key } from 'lucide-react';

const PasswordPromptModal = ({ isOpen, onClose, folderName, onSubmit }) => {
    const [password, setPassword] = useState('');
    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(password);
        setPassword('');
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Unlock "{folderName}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" required autoFocus className="w-full p-2 border rounded-md focus:ring-2 focus:ring-blue-500" />
                    <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-lg font-bold hover:bg-blue-700 flex items-center justify-center">
                        <Key className="mr-2" /> Unlock
                    </button>
                </form>
            </div>
        </div>
    );
};
export default PasswordPromptModal;