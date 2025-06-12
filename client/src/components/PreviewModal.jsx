import React from 'react';
import { X, Download, FileWarning } from 'lucide-react';

const STATIC_URL = 'http://localhost:5000';

const PreviewModal = ({ isOpen, onClose, item }) => {
    if (!isOpen || !item) return null;

    const renderContent = () => {
        const itemPath = `${STATIC_URL}/${item.path}`;
        if (item.type === 'image' || item.mimetype.startsWith('image/')) {
            return <img src={itemPath} alt={item.filename} className="max-w-full max-h-[70vh] object-contain" />;
        }
        if (item.type === 'video' || item.mimetype.startsWith('video/')) {
            return <video src={itemPath} controls autoPlay className="max-w-full max-h-[70vh]"></video>;
        }
        if (item.type === 'audio' || item.mimetype.startsWith('audio/')) {
            return <audio src={itemPath} controls autoPlay className="w-full mt-4"></audio>;
        }
        if (item.type === 'pdf' || item.mimetype === 'application/pdf') {
            return <iframe src={itemPath} title={item.filename} className="w-full h-[75vh]" />;
        }
        if (item.type === 'document' || item.type === 'text') {
            const googleViewerUrl = `https://docs.google.com/gview?url=${encodeURIComponent(itemPath)}&embedded=true`;
            return <iframe src={googleViewerUrl} title={item.filename} className="w-full h-[75vh]" />;
        }
        return (
            <div className="text-center p-8 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <FileWarning size={48} className="mx-auto text-yellow-500 mb-4" />
                <p className="text-lg font-semibold">Preview not available.</p>
                <p className="text-sm text-gray-500">{item.filename}</p>
                <a href={itemPath} download={item.filename} className="mt-4 inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                    Download File
                </a>
            </div>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
                    <h3 className="font-bold text-lg truncate mr-4">{item.filename}</h3>
                    <div className="flex items-center gap-4">
                        <a href={`${STATIC_URL}/${item.path}`} download={item.filename} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Download">
                            <Download size={20} />
                        </a>
                        <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" title="Close">
                            <X size={24} />
                        </button>
                    </div>
                </header>
                <main className="flex-grow flex justify-center items-center p-1 md:p-4 overflow-auto">
                    {renderContent()}
                </main>
            </div>
        </div>
    );
};

export default PreviewModal;