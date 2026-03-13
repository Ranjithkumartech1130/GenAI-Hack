import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { LogIn, UserPlus } from 'lucide-react';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, useAnimation } from 'framer-motion';
import axios from 'axios';

const GoogleIcon = () => (
    <svg viewBox="0 0 48 48" width="20" height="20">
        <path fill="#EA4335" stroke="#EA4335" strokeWidth="1" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" stroke="#4285F4" strokeWidth="1" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" stroke="#FBBC05" strokeWidth="1" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" stroke="#34A853" strokeWidth="1" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
);

const AuthView = ({ onLogin, onBack }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        email: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Swipe state and controls
    const controls = useAnimation();
    const trackRef = useRef(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (!isLogin && formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            setLoading(false);
            return;
        }

        try {
            const endpoint = isLogin ? '/login' : '/register';
            const response = await api.post(endpoint, formData);

            if (isLogin) {
                onLogin(response.data.user);
            } else {
                alert('Registration successful! Please login.');
                setIsLogin(true);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                setLoading(true);
                const userInfo = await axios.get(
                    'https://www.googleapis.com/oauth2/v3/userinfo',
                    { headers: { Authorization: `Bearer ${tokenResponse.access_token}` } }
                );
                const { email, name, picture } = userInfo.data;

                const response = await api.post('/google-login', { email, name, picture });
                onLogin(response.data.user);
            } catch (err) {
                setError(err.response?.data?.message || 'Google Auth Error');
                controls.start({ x: 0, opacity: 1 });
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError('Google Login Failed');
            controls.start({ x: 0, opacity: 1 });
        }
    });

    const handleDragEnd = async (event, info) => {
        const offset = info.offset.x;
        // The container is ~340px, icon is ~48px. The swipe distance is about 280-290px.
        if (offset > 180) { // if dragged more than 180px
            controls.start({ x: 284, opacity: 0 }); // Swipe it off
            googleLogin();
        } else {
            // Reset position
            controls.start({ x: 0, opacity: 1 });
        }
    };

    return (
        <div className="auth-view flex items-center justify-center min-vh-100 p-4">
            <div className="glass-card w-full max-w-lg mt-10">
                <div className="flex gap-4 justify-center mb-8">
                    <button
                        className={`nav-tab ${isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(true)}
                    >
                        <LogIn size={18} /> Login
                    </button>
                    <button
                        className={`nav-tab ${!isLogin ? 'active' : ''}`}
                        onClick={() => setIsLogin(false)}
                    >
                        <UserPlus size={18} /> Register
                    </button>
                </div>

                <h2 className="text-center text-2xl font-bold mb-6">
                    {isLogin ? 'Welcome Back!' : 'Join SkillGPS'}
                </h2>

                {error && <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-500 mb-4">{error}</div>}

                <form onSubmit={handleSubmit} className="space-y-4">
                    {!isLogin && (
                        <div className="form-group">
                            <label>Email</label>
                            <input
                                type="email"
                                placeholder="email@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                    )}
                    <div className="form-group">
                        <label>Username</label>
                        <input
                            type="text"
                            placeholder="username"
                            value={formData.username}
                            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    </div>
                    {!isLogin && (
                        <div className="form-group">
                            <label>Confirm Password</label>
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.confirmPassword}
                                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                required
                            />
                        </div>
                    )}

                    <button className="btn-primary w-full justify-center mt-6" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                    </button>
                </form>

                <div className="mt-6 flex items-center">
                    <div className="flex-grow border-t border-gray-600"></div>
                    <span className="flex-shrink-0 mx-4 text-gray-400 text-sm">Or continue with</span>
                    <div className="flex-grow border-t border-gray-600"></div>
                </div>

                <div className="mt-8 flex items-center justify-center">
                    <div
                        ref={trackRef}
                        className="relative w-full max-w-[340px] h-14 bg-[#555] rounded-full overflow-hidden border border-gray-600 shadow-inner flex items-center justify-center p-1"
                    >
                        <span className="absolute text-white font-medium z-0 text-md ml-6 pointer-events-none">Sign in with Google</span>
                        <motion.div
                            drag="x"
                            dragConstraints={trackRef}
                            dragElastic={0.05}
                            onDragEnd={handleDragEnd}
                            animate={controls}
                            className="absolute left-1 top-1 h-12 w-12 bg-white rounded-full flex items-center justify-center cursor-grab active:cursor-grabbing z-10 shadow-md border border-gray-200"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <GoogleIcon />
                        </motion.div>
                    </div>
                </div>

                <button className="text-sm text-dim hover:text-white mt-8 block mx-auto" onClick={onBack}>
                    ← Back to Home
                </button>
            </div>
        </div>
    );
};

export default AuthView;
