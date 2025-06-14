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
        <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
            <div 
                className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-neutral-900/50 backdrop-blur-sm 
                           rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60"
            >
                <div className="text-center">
                    <div className="inline-block p-4 bg-neutral-800 border border-neutral-700 rounded-full mb-5 shadow-inner">
                        <ImageIcon className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        Welcome Back
                    </h1>
                    <p className="text-neutral-400 mt-2">Sign in to continue to Notakok</p>
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
                        <label className="text-sm font-medium text-neutral-400 block">Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            value={email} 
                            onChange={onChange} 
                            placeholder="you@example.com" 
                            required 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white 
                                       placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" 
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400 block">Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            value={password} 
                            onChange={onChange} 
                            placeholder="••••••••" 
                            required 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white 
                                       placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" 
                        />
                    </div>
                    <div className="text-right -mt-2">
                        <Link to="/forgot-password" className="text-sm text-neutral-400 hover:text-white hover:underline transition-colors">
                            Forgot Password?
                        </Link>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg 
                                   hover:bg-neutral-200 active:scale-95 flex justify-center items-center 
                                   transition-all duration-300 disabled:bg-neutral-500 
                                   disabled:cursor-not-allowed disabled:text-neutral-300"
                    >
                        {loading ? <Loader2 className="animate-spin text-black" /> : 'Sign In'}
                    </button>
                </form>
                <p className="text-center text-sm text-neutral-500">
                    Don't have an account? <Link to="/register" className="font-semibold text-white hover:underline">
                        Register now
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default LoginPage;