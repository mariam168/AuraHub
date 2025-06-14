import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, KeyRound, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isTokenInvalid, setIsTokenInvalid] = useState(false);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setIsTokenInvalid(true);
            setError('No reset token found in the URL. Please request a new link.');
        }
    }, [token]);

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }
        if (password.length < 6) {
            setError('Password must be at least 6 characters.');
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const res = await axios.post(`${API_URL}/reset-password?token=${token}`, { password });
            setMessage(res.data.msg);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Password reset failed. The link may be invalid or expired.');
            setIsTokenInvalid(true);
        } finally {
            setLoading(false);
        }
    };
    
    if (message) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
                <div 
                    className="w-full max-w-md p-8 space-y-6 bg-neutral-900/50 backdrop-blur-sm 
                               rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60 text-center
                               animate-in fade-in-0 zoom-in-95"
                >
                    <div className="inline-block p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                        <CheckCircle className="h-12 w-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Success!</h2>
                    <p className="text-green-300 bg-green-900/50 p-3 rounded-lg">{message}</p>
                    <p className="text-neutral-400">You will be redirected to the login page shortly.</p>
                </div>
            </div>
        );
    }

    if (isTokenInvalid) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
                <div 
                    className="w-full max-w-md p-8 space-y-6 bg-neutral-900/50 backdrop-blur-sm 
                               rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60 text-center
                               animate-in fade-in-0 zoom-in-95"
                >
                     <div className="inline-block p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                        <XCircle className="h-12 w-12 text-red-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white">Invalid Link</h2>
                    <p className="text-red-300 bg-red-900/50 p-3 rounded-lg">{error}</p>
                    <Link to="/forgot-password" className="font-semibold text-white hover:underline">
                        Request a new reset link
                    </Link>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
            <div 
                className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-neutral-900/50 backdrop-blur-sm 
                           rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60"
            >
                <div className="text-center">
                    <div className="inline-block p-4 bg-neutral-800 border border-neutral-700 rounded-full mb-5 shadow-inner">
                        <KeyRound className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        Set New Password
                    </h1>
                    <p className="text-neutral-400 mt-2">Enter your new password below.</p>
                </div>

                {error && (
                    <div 
                        className="text-red-300 bg-red-500/10 border border-red-500/20 p-3 
                                   rounded-lg text-center text-sm transition-all animate-in fade-in-50"
                    >
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400 block">New Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="6+ characters" required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400 block">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat password" required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-300">
                        {loading ? <Loader2 className="animate-spin text-black" /> : 'Reset Password'}
                    </button>
                </form>
                 <p className="text-center text-sm text-neutral-500">
                    Remember it now? <Link to="/login" className="font-semibold text-white hover:underline">Go back to login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;