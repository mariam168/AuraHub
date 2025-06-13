import React, { useState } from 'react';
import axios from 'axios';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/forgot-password`, { email });
            setMessage(res.data.msg);
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Forgot Password</h2>
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                {message && <p className="text-green-500 text-center bg-green-100 p-3 rounded-md">{message}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Email</label>
                        <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Enter your email" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex justify-center items-center transition duration-300 disabled:bg-blue-300">
                        {loading ? <Loader2 className="animate-spin" /> : 'Send Reset Link'}
                    </button>
                </form>
                <p className="text-center text-sm">Remember your password? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
            </div>
        </div>
    );
};
export default ForgotPasswordPage;