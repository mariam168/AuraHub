import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, MailCheck, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const { register, loading, error, setError } = useAuth();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { username, email, password } = formData;
    const [isRegistered, setIsRegistered] = useState(false);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const onSubmit = async e => {
        e.preventDefault();
        try {
            const result = await register(username, email, password);
            if (result && result.success) {
                setIsRegistered(true);
            }
        } catch (err) {
            // Error is handled by AuthContext
        }
    };

    const handleTryAgain = () => {
        setIsRegistered(false);
        setFormData({ username: '', email: '', password: '' });
        if (error) {
            setError(null);
        }
    };

    useEffect(() => {
        return () => {
            if (error) {
                setError(null);
            }
        };
    }, [error, setError]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
            
            {isRegistered && (
                <div 
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-center 
                               z-50 p-4 transition-opacity duration-300 animate-in fade-in-0"
                >
                    <div 
                        className="w-full max-w-md p-8 space-y-6 bg-neutral-900 rounded-2xl border 
                                   border-neutral-800 shadow-2xl shadow-black/60 text-center 
                                   animate-in fade-in-0 zoom-in-95"
                    >
                        <div className="inline-block p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                           <MailCheck className="h-12 w-12 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white">Check Your Inbox!</h2>
                        <p className="text-neutral-400">
                            We've sent a verification link to <strong className="text-white">{email}</strong>. Please click it to activate your account.
                        </p>
                        <p className="text-sm text-neutral-500">
                            Didn't receive it? Check your spam folder or <button onClick={handleTryAgain} className="font-semibold text-white hover:underline bg-transparent border-none p-0 cursor-pointer">try again</button>.
                        </p>
                    </div>
                </div>
            )}

            <div 
                className="w-full max-w-md p-8 sm:p-10 space-y-8 bg-neutral-900/50 backdrop-blur-sm 
                           rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60"
            >
                 <div className="text-center">
                    <div className="inline-block p-4 bg-neutral-800 border border-neutral-700 rounded-full mb-5 shadow-inner">
                        <ImageIcon className="text-white" size={32} />
                    </div>
                    <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                        Create Your Account
                    </h1>
                    <p className="text-neutral-400 mt-2">Join Notakok and store your files securely</p>
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
                        <label className="text-sm font-medium text-neutral-400 block">Username</label>
                        <input type="text" name="username" value={username} onChange={onChange} placeholder="Choose a username" required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400 block">Email Address</label>
                        <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-neutral-400 block">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} placeholder="6+ characters" required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 flex justify-center items-center transition-all duration-300 disabled:bg-neutral-500 disabled:cursor-not-allowed disabled:text-neutral-300">
                        {loading ? <Loader2 className="animate-spin text-black" /> : 'Create Account'}
                    </button>
                </form>
                <p className="text-center text-sm text-neutral-500">
                    Already have an account? <Link to="/login" className="font-semibold text-white hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;