import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const LoginPage = () => {
    const { login, loading, error } = useAuth();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    const onSubmit = e => {
        e.preventDefault();
        login(email, password);
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Login to Your Account</h2>
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} placeholder="••••••••" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex justify-center items-center transition duration-300 disabled:bg-blue-300">
                        {loading ? <Loader2 className="animate-spin" /> : 'Login'}
                    </button>
                </form>
                <p className="text-center text-sm">Don't have an account? <Link to="/register" className="text-blue-500 hover:underline">Register now</Link></p>
                <p className="text-center text-sm"><Link to="/forgot-password" className="text-blue-500 hover:underline">Forgot Password?</Link></p>
            </div>
        </div>
    );
};
export default LoginPage;