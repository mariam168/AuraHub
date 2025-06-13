import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/auth';

const VerifyEmailPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('verifying');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const token = searchParams.get('token');
        if (token) {
            const verifyEmail = async () => {
                try {
                    const res = await axios.get(`${API_URL}/verify-email?token=${token}`);
                    setStatus('success');
                    setMessage(res.data.msg);
                } catch (err) {
                    setStatus('error');
                    setMessage(err.response?.data?.msg || 'Email verification failed.');
                }
            };
            verifyEmail();
        } else {
            setStatus('error');
            setMessage('No verification token found.');
        }
    }, [searchParams]);

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Email Verification</h2>
                {status === 'verifying' && (
                    <div className="flex justify-center items-center text-blue-500">
                        <Loader2 className="animate-spin mr-2" />
                        <p>Verifying your email...</p>
                    </div>
                )}
                {status === 'success' && (
                    <p className="text-green-500 text-center bg-green-100 p-3 rounded-md">{message}</p>
                )}
                {status === 'error' && (
                    <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{message}</p>
                )}
                {status !== 'verifying' && (
                    <p className="text-center text-sm">
                        You can now <Link to="/login" className="text-blue-500 hover:underline">log in</Link>.
                    </p>
                )}
            </div>
        </div>
    );
};
export default VerifyEmailPage;