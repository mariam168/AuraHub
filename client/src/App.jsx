import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// ** تم التصحيح هنا: استيراد AuthProvider و useAuth معًا **
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MediaManagerPage from './pages/MediaManagerPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import { Loader2 } from 'lucide-react';

// المكون الذي يعرض المحتوى بناءً على حالة المصادقة
function AppContent() {
  // نستخدم useAuth هنا، داخل ابن لـ AuthProvider
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-gray-100">
        <Loader2 className="animate-spin text-blue-500" size={48} />
      </div>
    );
  }

  return (
    <Routes>
      {/* --- المسارات العامة (لا تتطلب تسجيل دخول) --- */}
      <Route path="/login" element={!isAuthenticated ? <LoginPage /> : <Navigate to="/" />} />
      <Route path="/register" element={!isAuthenticated ? <RegisterPage /> : <Navigate to="/" />} />
      <Route path="/verify-email" element={<VerifyEmailPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* --- المسارات الخاصة (تتطلب تسجيل دخول) --- */}
      <Route path="/*" element={isAuthenticated ? <MediaManagerPage /> : <Navigate to="/login" />} />
    </Routes>
  );
}

// المكون الرئيسي للتطبيق الذي يغلف كل شيء بـ AuthProvider
function App() {
  return (
    <div className="bg-gray-100 text-gray-800 min-h-screen font-sans">
      {/* نستخدم AuthProvider هنا، لذلك يجب استيراده في هذا الملف */}
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </div>
  );
}

export default App;