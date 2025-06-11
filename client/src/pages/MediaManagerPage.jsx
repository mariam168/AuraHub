import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Folder, FileText, Image as ImageIcon, Video, Music, Lock, PlusCircle, LogOut, Edit, Trash2, Home, ChevronRight, Loader2, Star, Search, RotateCcw, Trash } from 'lucide-react';
import AddItemModal from '../components/AddItemModal';
import EditFolderModal from '../components/EditFolderModal';
import EditMediaModal from '../components/EditMediaModal';
import PasswordPromptModal from '../components/PasswordPromptModal';

const API_URL = 'http://localhost:5000/api/content';

const MediaManagerPage = () => {
    const { user, logout } = useAuth();
    const [content, setContent] = useState({ folders: [], media: [] });
    const [allFolders, setAllFolders] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState('root');
    const [history, setHistory] = useState([{ _id: 'root', name: 'My Drive' }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verifiedPasswords, setVerifiedPasswords] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('drive');

    // ... (Modal states remain the same)
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditFolderModalOpen, setEditFolderModalOpen] = useState(false);
    const [isEditMediaModalOpen, setEditMediaModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [folderToUnlock, setFolderToUnlock] = useState(null);

    // [الحل] تم تعريف دالة التحميل هنا باستخدام useCallback
    // الاعتماديات هنا هي فقط ما تحتاجه الدالة لتكوين الطلب
    const fetchContent = useCallback(async () => {
        setLoading(true);
        setError('');
        
        // الحصول على كلمة المرور الحالية للمجلد من الـ state
        const password = verifiedPasswords[currentFolderId];

        try {
            const params = { password };
            if (searchQuery) params.search = searchQuery;
            if (activeFilter !== 'all') params.type = activeFilter;
            if (viewMode === 'trash') params.view = 'trash';

            const res = await axios.get(`${API_URL}/folders/${currentFolderId}`, { params });
            setContent(res.data);
            return res; 
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.requiresPassword) {
                const folderName = history.find(f => f._id === currentFolderId)?.name || 'Locked Folder';
                setFolderToUnlock({ _id: currentFolderId, name: folderName });
                setPasswordModalOpen(true);
            } else {
                setError(errorData?.msg || 'Failed to load content');
                setContent({ folders: [], media: [] });
            }
        } finally {
            setLoading(false);
        }
    }, [currentFolderId, verifiedPasswords, searchQuery, activeFilter, viewMode, history]); // `history` is needed for the folder name

    // [الحل] الـ useEffect الرئيسي أصبح بسيطًا جداً
    // وظيفته فقط هي استدعاء دالة التحميل عندما تتغير مدخلات المستخدم
    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            fetchContent();
        }, 300); // Debounce to prevent rapid firing while typing
        return () => clearTimeout(delayDebounceFn);
    }, [fetchContent]); // يعتمد فقط على الدالة نفسها

    const fetchAllFolders = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/folders/nav`);
            setAllFolders(res.data);
        } catch (error) {
            console.error("Failed to fetch all folders for navigation.");
        }
    }, []);
    
    useEffect(() => {
        fetchAllFolders();
    }, [fetchAllFolders]);

    
    const handleFolderClick = (folder) => {
        if (viewMode === 'trash') return;
        if (folder.hasPassword && !verifiedPasswords[folder._id]) {
            setFolderToUnlock(folder);
            setPasswordModalOpen(true);
        } else {
            setCurrentFolderId(folder._id);
            setHistory(prev => [...prev, folder]);
            setSearchQuery(''); 
            setActiveFilter('all');
        }
    };
    
    const handleBreadcrumbClick = (folderId, index) => {
        if(viewMode === 'trash') handleViewChange('drive');
        setCurrentFolderId(folderId);
        setHistory(prev => prev.slice(0, index + 1));
        const newVerified = {};
        for (let i = 0; i <= index; i++) {
            const id = history[i]._id;
            if (verifiedPasswords[id]) {
                newVerified[id] = verifiedPasswords[id];
            }
        }
        setVerifiedPasswords(newVerified);
    };

    const handleViewChange = (newView) => {
        setViewMode(newView);
        setCurrentFolderId('root');
        setHistory([{ _id: 'root', name: newView === 'trash' ? 'Recycle Bin' : 'My Drive' }]);
        setSearchQuery('');
        setActiveFilter('all');
    };

    const handlePasswordSubmit = (password) => {
        if (!folderToUnlock) return;
        const folderToOpenId = folderToUnlock._id;
        
        // [الحل] نحدّث state كلمة المرور أولاً. هذا سيؤدي إلى إعادة تشغيل الـ useEffect الرئيسي تلقائياً
        setVerifiedPasswords(prev => ({ ...prev, [folderToOpenId]: password }));
        
        // بعد تحديث كلمة المرور، نغير المجلد الحالي ونضيفه للتاريخ
        setCurrentFolderId(folderToOpenId);
        setHistory(prev => {
            if (prev.some(f => f._id === folderToOpenId)) return prev;
            return [...prev, folderToUnlock];
        });

        setPasswordModalOpen(false);
        setFolderToUnlock(null);
    };

    const refresh = useCallback(() => {
        fetchContent();
        fetchAllFolders();
    }, [fetchContent, fetchAllFolders]);

    // ... (باقي دوال الـ handle تبقى كما هي، لكنها ستعتمد على refresh)

    const handleCreateFolder = async (name, password) => {
        try {
            await axios.post(`${API_URL}/folders`, { name, password, parentFolder: currentFolderId === 'root' ? null : currentFolderId });
            setAddModalOpen(false);
            refresh();
        } catch(e) { alert(e.response?.data?.msg || "Error creating folder"); }
    };
    
    // ... باقي الدوال مثل handleUploadMedia, handleEditFolder, handleDelete etc. تستخدم refresh() في النهاية
    const handleUploadMedia = async (files) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
        if (currentFolderId !== 'root') formData.append('folderId', currentFolderId);
        try {
            await axios.post(`${API_URL}/media/upload`, formData);
            setAddModalOpen(false);
            refresh();
        } catch(e) { alert(e.response?.data?.msg || "Error uploading files"); }
    };
    
    const handleEditFolder = async (folderId, data) => {
        try {
            await axios.put(`${API_URL}/folders/${folderId}`, data);
            setVerifiedPasswords(prev => {
                const newVerified = { ...prev };
                delete newVerified[folderId];
                return newVerified;
            });
            setEditFolderModalOpen(false);
            refresh();
        } catch(e) { alert(e.response?.data?.msg || "Error updating folder"); }
    };

    const handleUpdateMedia = async (mediaId, data) => {
        try {
            await axios.put(`${API_URL}/media/${mediaId}`, data);
            setEditMediaModalOpen(false);
            refresh();
        } catch (e) {
            alert(e.response?.data?.msg || "Error updating media file");
        }
    };
    
    const handleDelete = async (item) => {
        const isFolder = !item.mimetype;
        const type = isFolder ? 'folders' : 'media';
        const confirmMsg = `Move this ${isFolder ? 'folder' : 'file'} to trash?`;

        if (window.confirm(confirmMsg)) {
            try {
                await axios.post(`${API_URL}/${type}/${item._id}/delete`);
                refresh();
            } catch(e) { alert(e.response?.data?.msg || "Error moving to trash"); }
        }
    };

    const handlePermanentDelete = async (item) => {
        const isFolder = !item.mimetype;
        if(isFolder) {
            alert("Permanent deletion of folders is not supported from the UI yet.");
            return;
        }

        if (window.confirm(`This will permanently delete "${item.filename}". This action cannot be undone.`)) {
             try {
                await axios.post(`${API_URL}/media/${item._id}/permanent`);
                refresh();
            } catch(e) { alert(e.response?.data?.msg || "Error deleting permanently"); }
        }
    };
    
    const handleRestore = async (item) => {
        const isFolder = !item.mimetype;
        const type = isFolder ? 'folders' : 'media';
        try {
            await axios.post(`${API_URL}/${type}/${item._id}/restore`, {});
            refresh();
        } catch(e) { alert(e.response?.data?.msg || "Error restoring item"); }
    };

    const handleToggleFavorite = async (mediaId, e) => {
        e.stopPropagation();
        try {
            await axios.put(`${API_URL}/media/${mediaId}/favorite`, {});
            refresh(); // Easiest way to get updated data
        } catch(e) { 
            alert(e.response?.data?.msg || "Error favoriting file"); 
        }
    };

    const getFileIcon = (type) => {
        if (type.startsWith('image')) return <ImageIcon className="mx-auto text-pink-500" size={48} />;
        if (type.startsWith('video')) return <Video className="mx-auto text-purple-500" size={48} />;
        if (type.startsWith('audio')) return <Music className="mx-auto text-green-500" size={48} />;
        return <FileText className="mx-auto text-gray-500" size={48} />;
    }
    
    // JSX remains largely the same
    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
            <aside className="w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-4 flex flex-col">
                 <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8">AuraHub</h1>
                <nav className="flex-grow">
                     <button onClick={() => handleViewChange('drive')} className={`w-full text-left p-2 rounded font-semibold flex items-center ${viewMode === 'drive' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Home className="mr-3" size={20}/> My Drive</button>
                     <button onClick={() => handleViewChange('trash')} className={`w-full text-left p-2 rounded font-semibold flex items-center mt-2 ${viewMode === 'trash' ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}><Trash className="mr-3" size={20}/> Recycle Bin</button>
                </nav>
                <div className="border-t dark:border-gray-700 pt-4">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <button onClick={logout} className="text-sm text-red-500 hover:underline">Logout</button>
                </div>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <header className="flex flex-wrap justify-between items-center mb-6 pb-4 border-b dark:border-gray-700">
                <h1 className="text-3xl font-bold">{viewMode === 'trash' ? 'Recycle Bin' : 'Content'}</h1>
                {viewMode !== 'trash' && <div className="flex items-center space-x-4 mt-4 md:mt-0"><button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-5 py-2 rounded-lg shadow hover:bg-blue-700 transition flex items-center"><PlusCircle className="mr-2" size={20} /> Add New</button></div>}
                </header>
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} /><input type="text" placeholder="Search..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border rounded-lg bg-white dark:bg-gray-700 dark:border-gray-600" /></div>
                    {viewMode === 'drive' && <div className="flex items-center gap-2 bg-gray-200 dark:bg-gray-800 p-1 rounded-lg overflow-x-auto">{['all', 'image', 'video', 'audio', 'document', 'favorites'].map(filter => (<button key={filter} onClick={() => setActiveFilter(filter)} className={`px-3 py-1 rounded-md text-sm font-semibold ${activeFilter === filter ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-300 dark:hover:bg-gray-600'}`}>{filter.charAt(0).toUpperCase() + filter.slice(1)}</button>))}</div>}
                </div>
                {viewMode === 'drive' && <nav className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-800 p-2 rounded-lg mb-6 text-sm flex-wrap">{history.map((folder, index) => (<React.Fragment key={`${folder._id}-${index}`}><button onClick={() => handleBreadcrumbClick(folder._id, index)} className="flex items-center text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400">{folder._id === 'root' ? <Home className="mr-1" size={16}/> : null}<span className={index === history.length -1 ? 'font-bold' : ''}>{folder.name}</span></button>{index < history.length - 1 && <ChevronRight size={16} className="text-gray-400" />}</React.Fragment>))}</nav>}

                {loading ? <div className="flex justify-center p-10"><Loader2 className="animate-spin text-blue-500" size={48} /></div> :
                    (content.folders.length === 0 && content.media.length === 0) ? <div className="text-center py-16 text-gray-500"><Trash size={64} className="mx-auto"/><p className="mt-4 text-xl">This space is empty</p></div> :
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                        {content.folders.map(folder => (<div key={`folder-${folder._id}`} onDoubleClick={() => handleFolderClick(folder)} className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-sm text-center cursor-pointer hover:shadow-lg relative group">{folder.hasPassword ? <Lock size={48} className="mx-auto text-yellow-500"/> : <Folder size={48} className="mx-auto text-blue-500"/>}<p className="mt-2 font-semibold truncate">{folder.name}</p><div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">{viewMode === 'trash' ? <button onClick={(e) => { e.stopPropagation(); handleRestore(folder); }} className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"><RotateCcw size={14} /></button> : <button onClick={(e) => { e.stopPropagation(); setItemToEdit(folder); setEditFolderModalOpen(true); }} className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600"><Edit size={14} /></button>}<button onClick={(e) => { e.stopPropagation(); isFolder ? handleDelete(folder) : handlePermanentDelete(folder); }} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button></div></div>))}
                        {content.media.map(item => (<div key={`media-${item._id}`} className="bg-white dark:bg-gray-800 p-4 border dark:border-gray-700 rounded-lg shadow-sm text-center hover:shadow-lg relative group">
                            <a href={`http://localhost:5000/${item.path}`} target="_blank" rel="noopener noreferrer" className="block text-gray-500 h-20 flex items-center justify-center">{getFileIcon(item.mimetype)}</a>
                            <p className="mt-2 text-sm font-semibold truncate">{item.filename}</p>
                            <div className="absolute top-2 right-2 flex flex-col space-y-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {viewMode === 'trash' ?
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); handleRestore(item); }} className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600"><RotateCcw size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handlePermanentDelete(item); }} className="p-1.5 bg-red-700 text-white rounded-full hover:bg-red-800"><Trash size={14} /></button>
                                    </> :
                                    <>
                                        <button onClick={(e) => { e.stopPropagation(); setItemToEdit(item); setEditMediaModalOpen(true); }} className="p-1.5 bg-green-500 text-white rounded-full hover:bg-green-600"><Edit size={14} /></button>
                                        <button onClick={(e) => handleToggleFavorite(item._id, e)} className={`p-1.5 text-white rounded-full ${item.isFavorite ? 'bg-yellow-400 hover:bg-yellow-500' : 'bg-gray-400 hover:bg-gray-500'}`}><Star size={14} /></button>
                                        <button onClick={(e) => { e.stopPropagation(); handleDelete(item); }} className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"><Trash2 size={14} /></button>
                                    </>
                                }
                            </div>
                        </div>))}
                    </div>
                }
                
                {/* Modals */}
                <AddItemModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCreateFolder={handleCreateFolder} onUploadMedia={handleUploadMedia} />
                <EditFolderModal isOpen={isEditFolderModalOpen} onClose={() => { setEditFolderModalOpen(false); setItemToEdit(null); }} folder={itemToEdit} onSave={handleEditFolder}/>
                <EditMediaModal isOpen={isEditMediaModalOpen} onClose={() => { setEditMediaModalOpen(false); setItemToEdit(null); }} media={itemToEdit} onSave={handleUpdateMedia} allFolders={allFolders} />
                <PasswordPromptModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} folderName={folderToUnlock?.name} onSubmit={handlePasswordSubmit} />
            </main>
        </div>
    );
};

export default MediaManagerPage;