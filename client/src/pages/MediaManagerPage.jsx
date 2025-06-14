import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import {
    Folder, FileText, Image as ImageIcon, Video, Music, Lock, PlusCircle,
    LogOut, Edit, Trash2, Home, ChevronRight, Loader2, Star, Search,
    RotateCcw, Trash, Users, FolderSymlink, MoreVertical, StarOff, FileX, ShieldAlert, Eye, FileCode,
    Menu, X 
} from 'lucide-react';
import AddItemModal from '../components/AddItemModal';
import EditFolderModal from '../components/EditFolderModal';
import EditMediaModal from '../components/EditMediaModal';
import PasswordPromptModal from '../components/PasswordPromptModal';
import ShareModal from '../components/ShareModal';
import PreviewModal from '../components/PreviewModal';
const API_URL = 'http://localhost:5000/api/content';
const STATIC_URL = 'http://localhost:5000';
const MediaManagerPage = () => {
    const { user, logout } = useAuth();
    const [isSidebarOpen, setSidebarOpen] = useState(false);
    const [content, setContent] = useState({ folders: [], media: [] });
    const [currentFolderData, setCurrentFolderData] = useState(null);
    const [userRole, setUserRole] = useState('owner');
    const [sidebarFolders, setSidebarFolders] = useState({ myFolders: [], sharedWithMe: [] });
    const [allFoldersForMove, setAllFoldersForMove] = useState([]);
    const [currentFolderId, setCurrentFolderId] = useState('root');
    const [history, setHistory] = useState([{ _id: 'root', name: 'My Drive' }]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verifiedPasswords, setVerifiedPasswords] = useState({});
    const [searchQuery, setSearchQuery] = useState('');
    const [activeFilter, setActiveFilter] = useState('all');
    const [viewMode, setViewMode] = useState('drive');
    const [isAddModalOpen, setAddModalOpen] = useState(false);
    const [isEditFolderModalOpen, setEditFolderModalOpen] = useState(false);
    const [isEditMediaModalOpen, setEditMediaModalOpen] = useState(false);
    const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
    const [isShareModalOpen, setShareModalOpen] = useState(false);
    const [isPreviewModalOpen, setPreviewModalOpen] = useState(false);
    const [itemToEdit, setItemToEdit] = useState(null);
    const [itemToPreview, setItemToPreview] = useState(null);
    const [folderToUnlock, setFolderToUnlock] = useState(null);
    const [folderToShare, setFolderToShare] = useState(null);
    const [contextMenu, setContextMenu] = useState(null);
    const fetchContent = useCallback(async (folderId, currentHistory) => {
        setLoading(true);
        setError('');
        const password = verifiedPasswords[folderId];
        try {
            const params = { password, view: viewMode, search: searchQuery, type: activeFilter };
            const res = await axios.get(`${API_URL}/folders/${folderId}`, { params });
            setContent({ folders: res.data.folders, media: res.data.media });
            setUserRole(res.data.userRole || 'owner');
            setCurrentFolderData(res.data.currentFolder);
        } catch (err) {
            const errorData = err.response?.data;
            if (errorData?.requiresPassword) {
                const folderName = currentHistory.find(f => f._id === folderId)?.name || 'Locked Folder';
                setFolderToUnlock({ _id: folderId, name: folderName });
                setPasswordModalOpen(true);
            } else {
                setError(errorData?.msg || 'Failed to load content');
                setContent({ folders: [], media: [] });
            }
        } finally {
            setLoading(false);
        }
    }, [verifiedPasswords, searchQuery, activeFilter, viewMode]);

    const fetchSidebarFolders = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/sidebar`);
            setSidebarFolders(res.data);
        } catch (error) { console.error("Failed to fetch sidebar folders:", error); }
    }, []);

    const fetchAllFoldersForMove = useCallback(async () => {
        try {
            const res = await axios.get(`${API_URL}/folders/nav`);
            setAllFoldersForMove(res.data);
        } catch (error) { console.error("Failed to fetch folders for move dialog:", error); }
    }, []);
    useEffect(() => {
        const handler = (e) => { if (contextMenu) setContextMenu(null); };
        window.addEventListener('click', handler);
        return () => window.removeEventListener('click', handler);
    }, [contextMenu]);
    useEffect(() => {
        const debounce = setTimeout(() => fetchContent(currentFolderId, history), 300);
        return () => clearTimeout(debounce);
    }, [currentFolderId, history, fetchContent]);

    useEffect(() => { fetchSidebarFolders(); }, [fetchSidebarFolders]);

    const refreshAll = useCallback(() => {
        fetchContent(currentFolderId, history);
        fetchSidebarFolders();
    }, [currentFolderId, history, fetchContent, fetchSidebarFolders]);
    const handleApiCall = async (apiCall) => {
        try {
            await apiCall();
            refreshAll();
            return true;
        } catch (e) {
            alert(e.response?.data?.msg || "An error occurred.");
            return false;
        }
    };

    const handleFolderClick = (folder) => {
        if (viewMode === 'trash') return;
        setCurrentFolderId(folder._id);
        setHistory(prev => [...prev, { _id: folder._id, name: folder.name }]);
        setSearchQuery('');
        setActiveFilter('all');
        setSidebarOpen(false); 
    };
    const handleBreadcrumbClick = (folderId, index) => {
        if (viewMode === 'trash') handleViewChange('drive');
        setCurrentFolderId(folderId);
        setHistory(prev => prev.slice(0, index + 1));
    };
    const handleViewChange = (newView) => {
        setViewMode(newView);
        setCurrentFolderId('root');
        setHistory([{ _id: 'root', name: newView === 'trash' ? 'Recycle Bin' : 'My Drive' }]);
        setSearchQuery('');
        setActiveFilter('all');
        setSidebarOpen(false); 
    };
    const handlePasswordSubmit = (password) => {
        if (!folderToUnlock) return;
        setVerifiedPasswords(prev => ({ ...prev, [folderToUnlock._id]: password }));
        setPasswordModalOpen(false);
    };
    const handleShareClick = (item) => { setFolderToShare(item); setShareModalOpen(true); };
    const handleEditClick = (item) => {
        setItemToEdit(item);
        if (item.mimetype) {
            fetchAllFoldersForMove();
            setEditMediaModalOpen(true);
        } else {
            setEditFolderModalOpen(true);
        }
    };
    const handlePreviewClick = (item) => {
        if(item.mimetype) {
            setItemToPreview(item);
            setPreviewModalOpen(true);
        }
    };
    const handleCreateFolder = (name, password) => {
        handleApiCall(() => axios.post(`${API_URL}/folders`, { name, password, parentFolder: currentFolderId }))
            .then(success => success && setAddModalOpen(false));
    };
    const handleUploadMedia = (files) => {
        const formData = new FormData();
        for (let i = 0; i < files.length; i++) formData.append('files', files[i]);
        formData.append('folderId', currentFolderId);
        handleApiCall(() => axios.post(`${API_URL}/media/upload`, formData))
            .then(success => success && setAddModalOpen(false));
    };
    const handleEditFolder = async (id, data) => {
        const success = await handleApiCall(() => axios.put(`${API_URL}/folders/${id}`, data));
        if (success) {
            setEditFolderModalOpen(false);
            setVerifiedPasswords(prev => {
                const newVerified = { ...prev };
                delete newVerified[id];
                return newVerified;
            });
        }
    };
    const handleEditMedia = (id, data) => handleApiCall(() => axios.put(`${API_URL}/media/${id}`, data)).then(success => success && setEditMediaModalOpen(false));
    const handleSoftDelete = (item) => handleApiCall(() => axios.post(`${API_URL}/${item.mimetype ? 'media' : 'folders'}/${item._id}/delete`));
    const handleRestore = (item) => handleApiCall(() => axios.post(`${API_URL}/${item.mimetype ? 'media' : 'folders'}/${item._id}/restore`));
    const handleToggleFavorite = (item) => handleApiCall(() => axios.put(`${API_URL}/media/${item._id}/favorite`));
    const handlePermanentDelete = (item) => {
        if (!window.confirm("This action is irreversible. Are you sure you want to permanently delete this item?")) return;
        handleApiCall(() => axios.delete(`${API_URL}/media/${item._id}/permanent`));
    };
    const handleContextMenu = (e, item) => { e.preventDefault(); e.stopPropagation(); setContextMenu({ x: e.pageX, y: e.pageY, item }); };

    const getFileIcon = (item) => {
        if (item.type === 'video' || item.mimetype.startsWith('video/')) return <Video className="mx-auto text-purple-500" size={48} />;
        if (item.type === 'audio' || item.mimetype.startsWith('audio/')) return <Music className="mx-auto text-green-500" size={48} />;
        if (item.type === 'pdf' || item.mimetype === 'application/pdf') return <FileText className="mx-auto text-red-500" size={48} />;
        if (item.type === 'document') return <FileText className="mx-auto text-blue-500" size={48} />;
        if (item.type === 'text' || item.mimetype.startsWith('text/')) return <FileCode className="mx-auto text-gray-500" size={48} />;
        return <FileText className="mx-auto text-gray-400" size={48} />;
    };
    const isOwnerOfCurrentFolder = currentFolderData ? currentFolderData.user?._id === user?._id : currentFolderId === 'root';
    const canWriteInCurrentView = userRole !== 'viewer';
    const renderContextMenu = () => {
        if (!contextMenu) return null;
        const { item } = contextMenu;
        const isMedia = !!item.mimetype;
        const isOwner = item.user?._id === user?._id;
        return (
            <div style={{ top: contextMenu.y, left: contextMenu.x }} className="absolute bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-lg shadow-xl z-50 text-sm w-48 overflow-hidden">
                {viewMode === 'drive' ? (
                    <>
                        {isMedia && <button onClick={() => { handlePreviewClick(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"><Eye size={16} className="mr-3"/>Preview</button>}
                        {canWriteInCurrentView && <button onClick={() => { handleEditClick(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"><Edit size={16} className="mr-3"/>Rename / Move</button>}
                        {isMedia && <button onClick={() => { handleToggleFavorite(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200">{item.isFavorite ? <StarOff size={16} className="mr-3"/> : <Star size={16} className="mr-3"/>}{item.isFavorite ? 'Unfavorite' : 'Favorite'}</button>}
                        {!isMedia && isOwner && <button onClick={() => { handleShareClick(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"><Users size={16} className="mr-3"/>Share</button>}
                        <div className="my-1 border-t dark:border-gray-700"></div>
                        {canWriteInCurrentView && <button onClick={() => { handleSoftDelete(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center transition-colors duration-200"><Trash2 size={16} className="mr-3"/>Move to Trash</button>}
                    </>
                ) : (
                    <>
                        {canWriteInCurrentView && <button onClick={() => { handleRestore(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center transition-colors duration-200"><RotateCcw size={16} className="mr-3"/>Restore</button>}
                        {isOwner && isMedia && <button onClick={() => { handlePermanentDelete(item); setContextMenu(null); }} className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/50 flex items-center transition-colors duration-200"><FileX size={16} className="mr-3"/>Delete Permanently</button>}
                    </>
                )}
            </div>
        );
    };
    return (
        <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-200 dark:from-gray-950 dark:to-gray-850 font-sans antialiased overflow-hidden">
            <aside className={`fixed inset-y-0 left-0 bg-white dark:bg-gray-900 w-64 border-r border-gray-200 dark:border-gray-700 p-6 flex flex-col shadow-lg transform transition-transform duration-300 ease-in-out z-40
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                lg:relative lg:translate-x-0 lg:w-64`}>
                
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 flex items-center">
                        <ImageIcon className="mr-3" size={32} /> NotaKok
                    </h1>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-800 dark:hover:text-gray-200">
                        <X size={24}/>
                    </button>
                </div>
                <nav className="flex-grow overflow-y-auto pr-2">
                    <button onClick={() => handleViewChange('drive')} className={`group w-full text-left p-3 rounded-lg font-semibold flex items-center transition-all duration-200 ${viewMode === 'drive' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        <Home className={`mr-4 transition-colors duration-200 ${viewMode === 'drive' ? 'text-white' : 'text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400'}`} size={20}/> My Drive
                    </button>
                    <button onClick={() => handleViewChange('trash')} className={`group w-full text-left p-3 rounded-lg font-semibold flex items-center mt-3 transition-all duration-200 ${viewMode === 'trash' ? 'bg-blue-500 text-white shadow-md' : 'hover:bg-blue-50 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300'}`}>
                        <Trash className={`mr-4 transition-colors duration-200 ${viewMode === 'trash' ? 'text-white' : 'text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400'}`} size={20}/> Recycle Bin
                    </button>
                    <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="px-3 mb-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">My Folders</h3>
                        {sidebarFolders.myFolders.length === 0 && <p className="px-3 text-sm text-gray-500">No folders yet.</p>}
                        {sidebarFolders.myFolders.map(f => (
                            <button key={f._id} onClick={() => handleFolderClick(f)} className="group w-full text-left p-3 rounded-lg text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300">
                                <Folder className="mr-4 text-blue-500 group-hover:text-blue-600 dark:group-hover:text-blue-400" size={16}/>
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="px-3 mb-3 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">Shared With Me</h3>
                        {sidebarFolders.sharedWithMe.length === 0 && <p className="px-3 text-sm text-gray-500">No shared folders.</p>}
                        {sidebarFolders.sharedWithMe.map(f => (
                            <button key={f._id} onClick={() => handleFolderClick(f)} className="group w-full text-left p-3 rounded-lg text-sm flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200 text-gray-700 dark:text-gray-300">
                                <FolderSymlink className="mr-4 text-purple-500 group-hover:text-purple-600 dark:group-hover:text-purple-400" size={16}/>
                                <span className="truncate">{f.name}</span>
                            </button>
                        ))}
                    </div>
                </nav>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-auto flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                    <button onClick={logout} className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 transition-colors duration-200 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800" title="Logout">
                        <LogOut size={20} />
                    </button>
                </div>
            </aside>
            {isSidebarOpen && <div onClick={() => setSidebarOpen(false)} className="fixed inset-0 bg-black/40 z-30 lg:hidden"></div>}
            <main className="flex-1 p-4 sm:p-6 md:p-8 flex flex-col bg-gray-100 dark:bg-gray-900 rounded-tl-xl shadow-inner overflow-hidden">
                <header className="flex-shrink-0 flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center">
                        <button onClick={() => setSidebarOpen(true)} className="lg:hidden mr-4 p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-800">
                            <Menu size={28}/>
                        </button>
                        <div>
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 dark:text-gray-100 mb-1 leading-tight">{history[history.length - 1]?.name}</h1>
                            {currentFolderData && <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Owned by <span className="font-medium text-gray-600 dark:text-gray-300">{isOwnerOfCurrentFolder ? 'you' : currentFolderData.user.username}</span></p>}
                        </div>
                    </div>
                    {viewMode !== 'trash' && canWriteInCurrentView && (
                        <button onClick={() => setAddModalOpen(true)} className="bg-blue-600 text-white px-4 py-2 sm:px-6 sm:py-3 rounded-xl shadow-lg hover:bg-blue-700 transition-all duration-300 ease-in-out transform hover:-translate-y-1 hover:scale-105 flex items-center mt-4 md:mt-0 font-semibold text-base sm:text-lg self-end md:self-center">
                            <PlusCircle className="mr-2 sm:mr-3" size={24}/> Add New
                        </button>
                    )}
                </header>
                <div className="flex-shrink-0 flex flex-col md:flex-row gap-4 mb-6">
                    <div className="relative flex-grow">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={20}/>
                        <input
                            type="text"
                            placeholder="Search in this folder..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full pl-12 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all duration-200"
                        />
                    </div>
                    {viewMode === 'drive' && (
                        <div className="flex items-center gap-1 sm:gap-2 bg-gray-200 dark:bg-gray-800 p-1 sm:p-2 rounded-xl overflow-x-auto shadow-inner">
                            {['all', 'image', 'video', 'audio', 'document', 'favorites'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setActiveFilter(f)}
                                    className={`px-3 py-2 sm:px-4 rounded-lg text-xs sm:text-sm font-semibold whitespace-nowrap transition-all duration-200
                                        ${activeFilter === f ? 'bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-300 shadow-md' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'}
                                    `}
                                >
                                    {f.charAt(0).toUpperCase() + f.slice(1)}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {viewMode === 'drive' && (
                    <nav className="flex-shrink-0 flex items-center flex-wrap gap-y-2 space-x-2 bg-white dark:bg-gray-800 p-3 rounded-xl mb-6 text-sm shadow-sm border border-gray-200 dark:border-gray-700">
                        <Home onClick={() => handleBreadcrumbClick('root', 0)} className="cursor-pointer text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200" size={20}/>
                        {history.map((f, i) => (
                            <React.Fragment key={f._id}>
                                {i > 0 && <ChevronRight size={16} className="text-gray-400"/>}
                                <button
                                    onClick={() => handleBreadcrumbClick(f._id, i)}
                                    className={`font-medium ${i === history.length - 1 ? 'text-gray-800 dark:text-gray-100 cursor-default' : 'text-blue-600 dark:text-blue-400 hover:underline'}`}
                                >
                                    {f.name}
                                </button>
                            </React.Fragment>
                        ))}
                    </nav>
                )}
                <div className="flex-grow overflow-y-auto p-2 sm:p-4 bg-white dark:bg-gray-800 rounded-xl shadow-inner border border-gray-200 dark:border-gray-700">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-full text-blue-500">
                            <Loader2 className="animate-spin text-blue-500 mb-4" size={64}/>
                            <p className="text-xl font-medium">Loading content...</p>
                        </div>
                    ) : error ? (
                        <div className="flex flex-col items-center justify-center h-full text-red-500 text-center p-4">
                            <ShieldAlert size={80} className="mb-4"/>
                            <p className="text-2xl font-semibold">{error}</p>
                            <p className="text-md text-gray-500 mt-2">Please try again or check permissions.</p>
                        </div>
                    ) : (content.folders.length === 0 && content.media.length === 0) ? (
                        <div className="flex flex-col items-center justify-center h-full text-gray-500 text-center p-4">
                            <Folder size={80} className="mb-4"/>
                            <p className="text-2xl font-semibold">This folder is empty</p>
                            {viewMode === 'drive' && canWriteInCurrentView && <p className="mt-2 text-md">Click "Add New" to upload files or create folders.</p>}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
                            {content.folders.map(f => (
                                <div key={f._id} onDoubleClick={() => handleFolderClick(f)} onContextMenu={(e) => handleContextMenu(e, f)} className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-center cursor-pointer hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 relative group">
                                    {f.hasPassword ? <Lock size={48} className="mx-auto text-yellow-500 group-hover:text-yellow-600 transition-colors duration-200" title="Password protected"/> : <Folder size={48} className="mx-auto text-blue-500 group-hover:text-blue-600 transition-colors duration-200"/>}
                                    <p className="mt-3 font-semibold text-gray-800 dark:text-gray-200 truncate">{f.name}</p>
                                    <button onClick={(e) => handleContextMenu(e, f)} className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100" title="More options">
                                        <MoreVertical size={20}/>
                                    </button>
                                </div>
                            ))}
                            {content.media.map(m => (
                                <div key={m._id} onDoubleClick={() => handlePreviewClick(m)} onContextMenu={(e) => handleContextMenu(e, m)} className="bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-700 rounded-xl text-center hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 relative group cursor-pointer">
                                    {m.isFavorite && <Star size={20} className="absolute top-3 left-3 text-yellow-400 fill-current z-10"/>}
                                    <div className="h-28 w-full bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden flex items-center justify-center mb-3 shadow-inner">
                                        {(m.type === 'image' || m.mimetype.startsWith('image/')) ? (
                                            <img src={`${STATIC_URL}/${m.path}`} alt={m.filename} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy"/>
                                        ) : (
                                            getFileIcon(m)
                                        )}
                                    </div>
                                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">{m.filename}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{m.mimetype.split('/')[0].toUpperCase()}</p>
                                    <button onClick={(e) => handleContextMenu(e, m)} className="absolute top-2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus:opacity-100" title="More options">
                                        <MoreVertical size={20}/>
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
                {renderContextMenu()}
                <PreviewModal isOpen={isPreviewModalOpen} onClose={() => setPreviewModalOpen(false)} item={itemToPreview} />
                <AddItemModal isOpen={isAddModalOpen} onClose={() => setAddModalOpen(false)} onCreateFolder={handleCreateFolder} onUploadMedia={handleUploadMedia}/>
                <EditFolderModal isOpen={isEditFolderModalOpen} onClose={() => setEditFolderModalOpen(false)} folder={itemToEdit} onSave={handleEditFolder}/>
                <EditMediaModal isOpen={isEditMediaModalOpen} onClose={() => setEditMediaModalOpen(false)} media={itemToEdit} onSave={handleEditMedia} allFolders={allFoldersForMove} />
                <PasswordPromptModal isOpen={isPasswordModalOpen} onClose={() => setPasswordModalOpen(false)} folderName={folderToUnlock?.name} onSubmit={handlePasswordSubmit} />
                <ShareModal isOpen={isShareModalOpen} onClose={() => setShareModalOpen(false)} folder={folderToShare} onCollaboratorsUpdate={refreshAll} />
            </main>
        </div>
    );
};

export default MediaManagerPage;