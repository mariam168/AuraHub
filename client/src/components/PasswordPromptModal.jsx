import React, { useState, useEffect } from 'react';
import { X, KeyRound, Unlock } from 'lucide-react';

const PasswordPromptModal = ({ isOpen, onClose, folderName, onSubmit }) => {
    const [password, setPassword] = useState('');
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);
    
    useEffect(() => {
        if (!isOpen) {
            setPassword('');
        }
    }, [isOpen]);

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
        if (password) {
            onSubmit(password);
        }
    };

    const modalAnimation = isAnimatingOut ? 'animate-out fade-out-0 zoom-out-95' : 'animate-in fade-in-0 zoom-in-95';

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                className={`bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-sm
                            transform transition-all duration-300 ${modalAnimation}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="text-center mb-6">
                    <div className="inline-block p-4 bg-neutral-800 border border-neutral-700 rounded-full mb-4 shadow-inner">
                        <KeyRound className="text-white" size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Password Required</h2>
                    <p className="text-sm text-neutral-400 truncate mt-1">
                        To access "<span className="font-semibold text-white">{folderName}</span>"
                    </p>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="folder-password" className="sr-only">Password</label>
                        <input 
                            id="folder-password"
                            type="password" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            placeholder="Enter folder password" 
                            required 
                            autoFocus
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300"
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed"
                    >
                        <Unlock className="mr-2" size={18} /> Unlock
                    </button>
                </form>
            </div>
        </div>
    );
};
export default PasswordPromptModal;