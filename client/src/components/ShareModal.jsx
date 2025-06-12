import React, { useState, useEffect } from 'react';
import { X, UserPlus, Trash2, Shield, Eye, Loader2 } from 'lucide-react';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/content';

const ShareModal = ({ isOpen, onClose, folder, onCollaboratorsUpdate }) => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('viewer');
    const [collaborators, setCollaborators] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (folder) {
            const populatedCollaborators = folder.collaborators?.filter(c => c.user) || [];
            setCollaborators(populatedCollaborators);
        }
    }, [folder]);

    if (!isOpen || !folder) return null;

    const handleAddCollaborator = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const res = await axios.post(`${API_URL}/folders/${folder._id}/collaborators`, { email, role });
            onCollaboratorsUpdate(res.data);
            setCollaborators(res.data);
            setEmail('');
        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to add collaborator');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveCollaborator = async (collaboratorId) => {
        if (!window.confirm("Are you sure you want to remove this collaborator?")) return;
        try {
            const res = await axios.delete(`${API_URL}/folders/${folder._id}/collaborators/${collaboratorId}`);
            onCollaboratorsUpdate(res.data);
            setCollaborators(res.data);
        } catch (err) {
            alert('Failed to remove collaborator');
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-2xl w-full max-w-lg">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Share "{folder.name}"</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200"><X /></button>
                </div>
                
                <form onSubmit={handleAddCollaborator} className="flex items-center gap-2 mb-4">
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter email to invite..." required className="flex-grow p-2 border rounded-md" />
                    <select value={role} onChange={e => setRole(e.target.value)} className="p-2 border rounded-md">
                        <option value="viewer">Viewer</option>
                        <option value="editor">Editor</option>
                    </select>
                    <button type="submit" className="bg-blue-600 text-white p-2 rounded-md hover:bg-blue-700 flex items-center justify-center w-12 h-10" disabled={loading}>
                        {loading ? <Loader2 className="animate-spin" /> : <UserPlus size={20} />}
                    </button>
                </form>
                {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

                <h3 className="font-semibold mb-2">People with access</h3>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                    {collaborators.map(({ user, role }) => (
                        <div key={user._id} className="flex justify-between items-center p-2 bg-gray-100 rounded-md">
                            <div>
                                <p className="font-bold">{user.username}</p>
                                <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-sm capitalize flex items-center gap-1">
                                    {role === 'editor' ? <Shield size={16} className="text-green-600" /> : <Eye size={16} className="text-yellow-600" />}
                                    {role}
                                </span>
                                <button onClick={() => handleRemoveCollaborator(user._id)} className="p-1.5 text-red-500 hover:bg-red-100 rounded-full">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShareModal;