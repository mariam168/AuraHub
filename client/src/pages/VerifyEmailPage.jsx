import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2, CheckCircle, XCircle } from 'lucide-react'; // استيراد أيقونات

const API_URL = 'http://localhost:5000/api/auth';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying'); // الحالات: 'verifying', 'success', 'error'
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
                        <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
                        <h2 className="text-3xl font-bold text-gray-800">Email Verified!</h2>
                        <p className="text-green-600 bg-green-100 p-3 rounded-md">{message}</p>
                        <Link to="/login" className="w-full block text-center px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 transition duration-300">
                            Proceed to Login
                        </Link>
                    </>
                );
            case 'error':
                return (
                    <>
                        <XCircle className="mx-auto h-16 w-16 text-red-500" />
                        <h2 className="text-3xl font-bold text-gray-800">Verification Failed</h2>
                        <p className="text-red-600 bg-red-100 p-3 rounded-md">{message}</p>
                        <p className="text-sm text-gray-500">
                           Please <Link to="/register" className="text-blue-500 hover:underline">register again</Link> to receive a new link.
                        </p>
                    </>
                );
            default: // 'verifying'
                return (
                    <>
                        <Loader2 className="mx-auto h-16 w-16 text-blue-500 animate-spin" />
                        <h2 className="text-3xl font-bold text-gray-800">Verifying...</h2>
                        <p className="text-gray-600">{message}</p>
                    </>
                );
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
                {renderContent()}
            </div>
        </div>
    );
};
export default VerifyEmailPage;