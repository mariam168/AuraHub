import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MediaManagerPage from './pages/MediaManagerPage';
import { Loader2 } from 'lucide-react';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div className="w-screen h-screen flex justify-center items-center bg-gray-100"><Loader2 className="animate-spin text-blue-500" size={48} /></div>;
  }

  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
        <Route path="/*" element={isAuthenticated ? <MediaManagerPage /> : <Navigate to="/login" />} />
      </Routes>
    </div>
  );
}

export default App;