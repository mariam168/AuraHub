import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('Verifying your email, please wait...');

    useEffect(() => {
        const token = searchParams.get('token');
        if (!token) {
            setStatus('error');
            setMessage('No verification token found. The link may be incomplete.');
            return;
        }

        const verifyEmail = async () => {
            try {
                const res = await axios.get(`${API_URL}/verify-email?token=${token}`);
                setStatus('success');
                setMessage(res.data.msg);
            } catch (err) {
                setStatus('error');
                setMessage(err.response?.data?.msg || 'An unknown error occurred during verification.');
            }
        };

        const timer = setTimeout(() => {
            verifyEmail();
        }, 1000);

        return () => clearTimeout(timer);
        
    }, [searchParams]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <div className="animate-in fade-in-0 zoom-in-95">
                        <div className="inline-block p-4 bg-green-500/10 border border-green-500/20 rounded-full">
                            <CheckCircle className="h-12 w-12 text-green-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mt-5">Email Verified!</h2>
                        <p className="text-green-300 bg-green-900/50 p-3 rounded-lg mt-4">{message}</p>
                        <Link 
                            to="/login" 
                            className="w-full mt-6 block text-center px-4 py-3 font-bold text-black bg-white rounded-lg hover:bg-neutral-200 active:scale-95 transition-all duration-300"
                        >
                            Proceed to Login
                        </Link>
                    </div>
                );
            case 'error':
                return (
                    <div className="animate-in fade-in-0 zoom-in-95">
                        <div className="inline-block p-4 bg-red-500/10 border border-red-500/20 rounded-full">
                           <XCircle className="h-12 w-12 text-red-400" />
                        </div>
                        <h2 className="text-3xl font-bold text-white mt-5">Verification Failed</h2>
                        <p className="text-red-300 bg-red-900/50 p-3 rounded-lg mt-4">{message}</p>
                        <p className="text-sm text-neutral-500 mt-6">
                           Please <Link to="/register" className="font-semibold text-white hover:underline">register again</Link> to receive a new link.
                        </p>
                    </div>
                );
            default:
                return (
                    <>
                        <Loader2 className="mx-auto h-12 w-12 text-white animate-spin" />
                        <h2 className="text-3xl font-bold text-white mt-5">Verifying...</h2>
                        <p className="text-neutral-400">{message}</p>
                    </>
                );
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-neutral-950 p-4 font-sans">
            <div 
                className="w-full max-w-md p-8 sm:p-10 space-y-6 bg-neutral-900/50 backdrop-blur-sm 
                           rounded-2xl border border-neutral-800 shadow-2xl shadow-black/60 text-center"
            >
                {renderContent()}
            </div>
        </div>
    );
};

export default VerifyEmailPage;