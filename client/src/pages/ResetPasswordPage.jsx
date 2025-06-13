import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

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
            setError('No reset token found.');
        }
        // يمكن إضافة استدعاء للـ backend هنا للتحقق من صلاحية التوكن بشكل مبكر
        // هذا يمنع المستخدمين من رؤية النموذج إذا كان التوكن غير صالح بالفعل.
    }, [token]);

    const onSubmit = async e => {
        e.preventDefault();
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
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/reset-password?token=${token}`, { password });
            setMessage(res.data.msg);
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        } catch (err) {
            setError(err.response?.data?.msg || 'Password reset failed.');
            setTokenValid(false); // إذا فشلت عملية إعادة التعيين، فمن المرجح أن يكون التوكن غير صالح أو منتهي الصلاحية
        } finally {
            setLoading(false);
        }
    };

    if (!tokenValid) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                    <h2 className="text-3xl font-bold text-center text-gray-800">Invalid Link</h2>
                    <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error || 'The password reset link is invalid or has expired.'}</p>
                    <p className="text-center text-sm">Please go back to <Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password</Link> to request a new link.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Reset Password</h2>
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="text-green-500 text-center bg-green-100 p-3 rounded-md">{message}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">New Password</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter new password" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Confirm New Password</label>
                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Confirm new password" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex justify-center items-center transition duration-300 disabled:bg-blue-300">
                        {loading ? <Loader2 className="animate-spin" /> : 'Reset Password'}
                    </button>
                </form>
            </div>
        </div>
    );
};
export default ResetPasswordPage;