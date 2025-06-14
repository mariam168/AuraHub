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
        <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4 relative">
            
            {/* Modal Overlay: يظهر فقط عند نجاح التسجيل */}
            {isRegistered && (
                <div className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4 transition-opacity duration-300">
                    <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25 text-center transform transition-transform duration-300 scale-100">
                        <MailCheck className="mx-auto h-16 w-16 text-green-400" />
                        <h2 className="text-3xl font-bold text-slate-100">Check Your Inbox!</h2>
                        <p className="text-slate-400">
                            We've sent a verification link to <strong className="text-slate-300">{email}</strong>. Please click the link in the email to activate your account.
                        </p>
                        <p className="text-sm text-slate-500">
                            Didn't receive it? Check your spam folder or <button onClick={handleTryAgain} className="font-semibold text-brand-primary hover:underline bg-transparent border-none p-0 cursor-pointer">try again</button>.
                        </p>
                    </div>
                </div>
            )}

            {/* Registration Form: يبقى دائمًا في الخلفية */}
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25">
                 <div className="text-center">
                    <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-brand-secondary to-brand-primary flex items-center justify-center mb-2">
                        <ImageIcon className="mr-3 text-brand-primary" size={36} /> Notakok
                    </h1>
                    <p className="text-slate-400">Create your account to get started</p>
                </div>

                {error && <p className="text-red-400 bg-red-900/50 p-3 rounded-lg text-center text-sm">{error}</p>}
                
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Username</label>
                        <input type="text" name="username" value={username} onChange={onChange} placeholder="Choose a username" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Email Address</label>
                        <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-400 block mb-2">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} placeholder="6+ characters" required className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-primary" />
                    </div>
                    <button type="submit" disabled={loading} className="w-full px-4 py-3 font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary rounded-lg hover:opacity-90 flex justify-center items-center transition-opacity duration-300 disabled:opacity-50 disabled:cursor-not-allowed">
                        {loading ? <Loader2 className="animate-spin" /> : 'Create Account'}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-400">
                    Already have an account? <Link to="/login" className="font-semibold text-brand-primary hover:underline">Sign In</Link>
                </p>
            </div>
        </div>
    );
};

export default RegisterPage;