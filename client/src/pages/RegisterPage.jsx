import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Loader2, MailCheck } from 'lucide-react'; // استيراد أيقونة جديدة
import { Link } from 'react-router-dom';

const RegisterPage = () => {
    const { register, loading, error, setError } = useAuth(); // Assuming setError is exposed by useAuth
    const [formData, setFormData] = useState({ username: '', email: '', password: '' });
    const { username, email, password } = formData;
    const [isRegistered, setIsRegistered] = useState(false); // حالة جديدة لتتبع التسجيل الناجح

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });
    
    const onSubmit = async e => {
        e.preventDefault();
        // Clear previous errors if any
        if (error) setError(null); 
        
        try {
            const result = await register(username, email, password);
            if (result.success) {
                setIsRegistered(true); // تم التسجيل بنجاح، اعرض الرسالة المحسنة
            }
        } catch (err) {
            setIsRegistered(false); // تأكد من إخفاء رسالة النجاح في حالة حدوث خطأ
        }
    };

    // دالة للرجوع إلى نموذج التسجيل
    const handleTryAgain = () => {
        setIsRegistered(false);
        setFormData({ username: '', email: '', password: '' });
        if (error) setError(null);
    };

    // إذا تم التسجيل بنجاح، اعرض هذه الواجهة بدلاً من النموذج
    if (isRegistered) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl text-center">
                    <MailCheck className="mx-auto h-16 w-16 text-green-500" />
                    <h2 className="text-3xl font-bold text-gray-800">Check Your Inbox!</h2>
                    <p className="text-gray-600">
                        We've sent a verification link to <strong>{email}</strong>. Please click the link in the email to activate your account.
                    </p>
                    <p className="text-sm text-gray-500">
                        Didn't receive the email? Check your spam folder or <button onClick={handleTryAgain} className="text-blue-500 hover:underline bg-transparent border-none p-0">try registering again</button>.
                    </p>
                </div>
            </div>
        );
    }
    
    // واجهة التسجيل العادية
    return (
        <div className="flex justify-center items-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-xl">
                <h2 className="text-3xl font-bold text-center text-gray-800">Create an Account</h2>
                {error && <p className="text-red-500 text-center bg-red-100 p-3 rounded-md">{error}</p>}
                
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
                    <button type="submit" disabled={loading} className="w-full px-4 py-2 font-bold text-white bg-blue-500 rounded-md hover:bg-blue-600 flex justify-center items-center transition duration-300 disabled:bg-blue-300">
                        {loading ? <Loader2 className="animate-spin" /> : 'Register'}
                    </button>
                </form>
                <p className="text-center text-sm">Already have an account? <Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
            </div>
        </div>
    );
};

export default RegisterPage;