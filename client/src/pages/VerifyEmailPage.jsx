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

        verifyEmail();
    }, [searchParams]);

    const renderContent = () => {
        switch (status) {
            case 'success':
                return (
                    <>
                        <CheckCircle className="mx-auto h-16 w-16 text-green-400" />
                        <h2 className="text-3xl font-bold text-slate-100">Email Verified!</h2>
                        <p className="text-green-300 bg-green-900/50 p-3 rounded-lg">{message}</p>
                        <Link 
                            to="/login" 
                            className="w-full mt-4 block text-center px-4 py-3 font-bold text-white bg-gradient-to-r from-brand-secondary to-brand-primary rounded-lg hover:opacity-90 transition-opacity duration-300"
                        >
                            Proceed to Login
                        </Link>
                    </>
                );
            case 'error':
                return (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-400" />
                        <h2 className="text-3xl font-bold text-slate-100">Verification Failed</h2>
                        <p className="text-red-400 bg-red-900/50 p-3 rounded-lg">{message}</p>
                        <p className="text-sm text-slate-500 mt-4">
                           Please <Link to="/register" className="font-semibold text-brand-primary hover:underline">register again</Link> to receive a new link.
                        </p>
                    </>
                );
            default:
                return (
                    <>
                        <Loader2 className="mx-auto h-16 w-16 text-brand-primary animate-spin" />
                        <h2 className="text-3xl font-bold text-slate-100">Verifying...</h2>
                        <p className="text-slate-400">{message}</p>
                    </>
                );
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-slate-950 p-4">
            <div className="w-full max-w-md p-8 space-y-6 bg-slate-900 rounded-2xl shadow-2xl shadow-black/25 text-center">
                {renderContent()}
            </div>
        </div>
    );
};

export default VerifyEmailPage;