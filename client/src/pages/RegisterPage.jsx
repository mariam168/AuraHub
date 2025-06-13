// File: frontend/src/pages/RegisterPage.js

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const { register, loading, error } = useAuth();
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { username, email, password } = formData;
    const [successMessage, setSuccessMessage] = useState(null);

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    // This onSubmit handler now works as intended
    const onSubmit = async e => {
        e.preventDefault();
        setSuccessMessage(null); // Clear previous success message
        try {
            const result = await register(username, email, password);
            if (result.success) {
                setSuccessMessage(result.message);
                // Clear the form after successful registration
                setFormData({ username: '', email: '', password: '' });
            }
        } catch (err) {
            // Error is handled and displayed by the AuthContext
            console.error(err);
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Create an Account</h2>
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                {successMessage && <p className="text-green-500 text-center bg-green-100 p-3 rounded-md">{successMessage}</p>}
                <form onSubmit={onSubmit} className="space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Username</label>
                        <input type="text" name="username" value={username} onChange={onChange} placeholder="Choose a username" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Email</label>
                        <input type="email" name="email" value={email} onChange={onChange} placeholder="you@example.com" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-gray-600 block">Password</label>
                        <input type="password" name="password" value={password} onChange={onChange} placeholder="Create a strong password" required className="w-full mt-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <button type="submit" disabled={loading || successMessage} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex justify-center items-center transition duration-300 disabled:bg-blue-300">
                        {loading ? <Loader2 className="animate-spin" /> : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
            </div>
        </div>
    );
};
export default RegisterPage;