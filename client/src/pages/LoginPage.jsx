import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, Image as ImageIcon } from 'lucide-react';
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
        <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25">
                <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary flex items-center justify-center mb-2">
                        <ImageIcon className="mr-3 text-brand-primary" size={36} /> Notakok
                    </h1>
                    <p className="text-slate-400">Login to access your drive</p>
                </div>

                {error && (
                    <div className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            placeholder="you@example.com" 
                            required 
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            placeholder="••••••••" 
                            required 
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" 
                        />
                    </div>
                    <div className="text-right">
                        <Link to="/forgot-password" className="text-sm text-brand-primary hover:underline">Forgot Password?</Link>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary rounded-lg hover:opacity-90 flex justify-center items-center transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-400">
                    Don't have an account? <Link to="/register" className="font-semibold text-brand-primary hover:underline">Register now</Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;