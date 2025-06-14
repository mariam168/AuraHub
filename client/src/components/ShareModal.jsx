import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, Eye, Loader2, Users } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/content';

const ShareModal = ({ isOpen, onClose, folder, onCollaboratorsUpdate }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [collaborators, setCollaborators] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [isAnimatingOut, setIsAnimatingOut] = useState(false);

    useEffect(() => {
        if (isOpen && folder) {
            const populatedCollaborators = folder.collaborators?.filter(c => c.user) || [];
            setCollaborators(populatedCollaborators);
            setIsAnimatingOut(false);
            setError('');
            setEmail('');
        }
    }, [isOpen, folder]);

    if (!isOpen && !isAnimatingOut) return null;

    const handleClose = () => {
        setIsAnimatingOut(true);
        setTimeout(() => {
            onClose();
        }, 300);
    };

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/folders/${folder._id}/collaborators`, { email, role });
            const populatedData = res.data?.filter(c => c.user) || [];
            setCollaborators(populatedData);
            setEmail('');
            if (onCollaboratorsUpdate) onCollaboratorsUpdate();
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add collaborator.');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId) => {
        if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
        try {
            const res = await axios.delete(`${API_URL}/folders/${folder._id}/collaborators/${collaboratorId}`);
            const populatedData = res.data?.filter(c => c.user) || [];
            setCollaborators(populatedData);
            if (onCollaboratorsUpdate) onCollaboratorsUpdate();
        } catch (err) {
            alert('Failed to remove collaborator. Please try again.');
        }
    };

    const modalAnimation = isAnimatingOut ? 'animate-out fade-out-0 zoom-out-95' : 'animate-in fade-in-0 zoom-in-95';

    return (
        <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center z-50 p-4"
            onClick={handleClose}
        >
            <div 
                className={`bg-neutral-900 border border-neutral-800 p-6 sm:p-8 rounded-2xl shadow-2xl w-full max-w-2xl
                            transform transition-all duration-300 ${modalAnimation}`}
                onClick={e => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                     <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Users size={24}/> Share Folder
                        </h2>
                        <p className="text-sm text-neutral-400 truncate pr-4">
                            Folder: <span className="font-semibold text-white">{folder?.name}</span>
                        </p>
                    </div>
                    <button onClick={handleClose} className="p-2 rounded-full text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                <form onSubmit={handleAddCollaborator} className="flex flex-col sm:flex-row items-center gap-3 mb-4">
                    <input 
                        type="email" 
                        value={email} 
                        onChange={e => setEmail(e.target.value)} 
                        placeholder="Enter email to invite..." 
                        required 
                        className="w-full sm:flex-grow px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all"
                    />
                    <div className="w-full sm:w-auto flex gap-3">
                        <select 
                            value={role} 
                            onChange={e => setRole(e.target.value)} 
                            className="w-full sm:w-auto px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all appearance-none"
                        >
                            <option value="viewer" className="bg-neutral-800">Can view</option>
                            <option value="editor" className="bg-neutral-800">Can edit</option>
                        </select>
                        <button 
                            type="submit" 
                            className="bg-white text-black px-4 py-3 rounded-lg font-semibold hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center disabled:bg-neutral-500 disabled:cursor-not-allowed" 
                            disabled={loading}
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <UserPlus size={20} />}
                        </button>
                    </div>
                </form>
                {error && <p className="text-red-400 text-sm mb-4 bg-red-900/50 p-3 rounded-lg">{error}</p>}

                <div className="border-t border-neutral-800 pt-4">
                    <h3 className="font-semibold text-white mb-3">People with access</h3>
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                        {collaborators.length > 0 ? collaborators.map(({ user, role }) => (
                            <div key={user._id} className="flex justify-between items-center p-3 bg-neutral-800/50 rounded-lg animate-in fade-in-0">
                                <div>
                                    <p className="font-semibold text-white">{user.username}</p>
                                    <p className="text-sm text-neutral-400">{user.email}</p>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className={`text-xs capitalize font-semibold flex items-center gap-1.5 px-2 py-1 rounded-full ${role === 'editor' ? 'bg-green-900/50 text-green-300' : 'bg-yellow-900/50 text-yellow-300'}`}>
                                        {role === 'editor' ? <Shield size={14} /> : <Eye size={14} />}
                                        {role}
                                    </span>
                                    <button onClick={() => handleRemoveCollaborator(user._id)} className="p-2 text-neutral-400 hover:bg-neutral-700 hover:text-red-500 rounded-full transition-colors" title="Remove access">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-neutral-500 p-4">Only you have access to this folder.</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShareModal;