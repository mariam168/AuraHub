import React, { useState } from 'react';
import axios from 'axios';
import { Loader2, MailCheck, KeyRound } from 'lucide-react';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:5000/api/auth';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const onSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        setError(null);
        try {
            const res = await axios.post(`${API_URL}/forgot-password`, { email });
            setMessage(res.data.msg);
            setIsSubmitted(true);
        } catch (err) {
            setError(err.response?.data?.msg || 'Something went wrong.');
            setIsSubmitted(false);
        } finally {
            setLoading(false);
        }
    };
    
    if (isSubmitted) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
                <div 
                    className="w-full max-w-md p-8 space-y-6 bg-neutral-900/50 backdrop-blur-sm 
                               rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60 text-center
                               animate-in fade-in-0 zoom-in-95"
                >
                    <div className="inline-block p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                        <MailCheck className="h-12 w-12 text-green-400" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mt-5">Check Your Inbox!</h2>
                    <p className="text-neutral-400 mt-2">{message}</p>
                    <p className="text-sm text-neutral-500 mt-4">
                        The link will expire in one hour.
                    </p>
                    <Link to="/login" className="font-semibold text-white hover:underline mt-6 inline-block">
                        Back to Login
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
                        Forgot Your Password?
                    </h1>
                    <p className="text-neutral-400 mt-2">No worries, we'll send you reset instructions.</p>
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
                            onChange={e => setEmail(e.target.value)} 
                            placeholder="Enter your registered email" 
                            required 
                            className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white 
                                       placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-offset-2 
                                       focus:ring-offset-neutral-900 focus:ring-white transition-all duration-300" 
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading} 
                        className="w-full px-4 py-3 font-bold text-black bg-white rounded-lg 
                                   hover:bg-neutral-200 active:scale-95 flex justify-center items-center 
                                   transition-all duration-300 disabled:bg-neutral-500 
                                   disabled:cursor-not-allowed disabled:text-neutral-300"
                    >
                        {loading ? <Loader2 className="animate-spin text-black" /> : 'Send Reset Link'}
                    </button>
                </form>
                <p className="text-center text-sm text-neutral-500">
                    Remember it now? <Link to="/login" className="font-semibold text-white hover:underline">
                        Back to Sign In
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;