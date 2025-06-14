import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

const ResetPasswordPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [tokenValid, setTokenValid] = useState(true);

    const token = searchParams.get('token');

    useEffect(() => {
        if (!token) {
            setTokenValid(false);
            setError('No reset token found in the URL.');
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
            setTokenValid(false);
        } finally {
            setLoading(false);
        }
    };
    
    if (message) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4">
                <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                    <h2 className="text-3xl font-bold text-slate-100">Success!</h2>
                    <p className="text-green-300 bg-green-900/50 p-3 rounded-lg">{message}</p>
                    <p className="text-slate-400">You will be redirected to the login page shortly.</p>
                </div>
            </div>
        );
    }
    
    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-slate-100">Reset Your Password</h2>
                    <p className="text-slate-400 mt-2">Enter your new password below.</p>
                </div>

                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center text-sm">{error}</p>}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">New Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary rounded-lg hover:opacity-90 flex justify-center items-center transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                    </button>
                </form>
                 <p className="text-center text-sm text-slate-400">
                    Remember your password? <Link to="/login" className="font-semibold text-brand-primary hover:underline">Go back to login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPasswordPage;