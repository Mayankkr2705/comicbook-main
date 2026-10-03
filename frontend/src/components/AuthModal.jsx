import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { X, BookOpen, Sparkles } from 'lucide-react';

/**
 * Auth modal — shown as a full-page overlay for login / register.
 * @param {Function} onClose - called when user dismisses modal
 * @param {'login'|'register'} defaultTab
 */
export default function AuthModal({ onClose, defaultTab = 'login' }) {
    const { login, register } = useAuth();
    const [tab, setTab] = useState(defaultTab);
    const [form, setForm] = useState({ username: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            if (tab === 'login') {
                await login(form.email, form.password);
            } else {
                await register(form.username, form.email, form.password);
            }
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
            <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border-4 border-purple-400 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-8 py-6 text-center">
                    <div className="flex justify-center mb-2">
                        <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center border-4 border-white/50">
                            <Sparkles className="w-7 h-7 text-white" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-black text-white">Comic Verse</h2>
                    <p className="text-white/80 text-sm mt-1">Create & share amazing stories!</p>
                </div>

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 bg-white/30 hover:bg-white/50 rounded-full flex items-center justify-center transition-colors"
                >
                    <X className="w-4 h-4 text-white" />
                </button>

                {/* Tabs */}
                <div className="flex border-b-4 border-purple-200">
                    {['login', 'register'].map((t) => (
                        <button
                            key={t}
                            onClick={() => { setTab(t); setError(''); }}
                            className={`flex-1 py-3 font-bold text-sm transition-colors ${
                                tab === t
                                    ? 'bg-purple-100 text-purple-700 border-b-4 border-purple-500'
                                    : 'text-gray-500 hover:text-purple-600'
                            }`}
                        >
                            {t === 'login' ? 'Sign In' : 'Create Account'}
                        </button>
                    ))}
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="px-8 py-6 space-y-4">
                    {tab === 'register' && (
                        <div>
                            <label className="block text-sm font-bold text-purple-700 mb-1">Username</label>
                            <input
                                id="auth-username"
                                name="username"
                                type="text"
                                value={form.username}
                                onChange={handleChange}
                                required
                                minLength={3}
                                placeholder="coolartist42"
                                className="w-full border-3 border-purple-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-bold text-purple-700 mb-1">Email</label>
                        <input
                            id="auth-email"
                            name="email"
                            type="email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            placeholder="you@example.com"
                            className="w-full border-3 border-purple-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-purple-700 mb-1">Password</label>
                        <input
                            id="auth-password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            minLength={6}
                            placeholder="••••••••"
                            className="w-full border-3 border-purple-300 rounded-xl px-4 py-3 text-gray-800 focus:outline-none focus:border-purple-500 transition-colors"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 border-2 border-red-300 rounded-xl px-4 py-3 text-red-700 text-sm font-medium">
                            {error}
                        </div>
                    )}

                    <button
                        id="auth-submit"
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 disabled:opacity-60 text-white font-black text-lg rounded-xl transition-all transform hover:scale-105 active:scale-95 shadow-lg"
                    >
                        {loading ? '...' : tab === 'login' ? '🚀 Sign In' : '✨ Create Account'}
                    </button>

                    <p className="text-center text-gray-500 text-sm">
                        {tab === 'login' ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            type="button"
                            onClick={() => { setTab(tab === 'login' ? 'register' : 'login'); setError(''); }}
                            className="text-purple-600 font-bold hover:underline"
                        >
                            {tab === 'login' ? 'Register' : 'Sign In'}
                        </button>
                    </p>
                </form>
            </div>
        </div>
    );
}
