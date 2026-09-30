import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { X, Lock, Mail, User, Phone, Sparkles, Building } from 'lucide-react';

export default function AuthModal({ isOpen, onClose }) {
  const { login, register, switchRoleDemo } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState('USER');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await register({ name, email, password, phone, role });
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (roleType) => {
    setError('');
    setLoading(true);
    try {
      await switchRoleDemo(roleType);
      onClose();
    } catch (err) {
      setError(err.message || 'Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-slate-900 font-display">
            {isLogin ? 'Welcome Back' : 'Join Wanderlust India'}
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            {isLogin
              ? 'Sign in to access your itineraries, bookings & saved stays'
              : 'Create an account to start booking hotels and planning trips'}
          </p>
        </div>

        {/* 1-Click Quick Demo Switcher */}
        <div className="mb-6 p-3.5 rounded-2xl bg-brand-50/60 border border-brand-100/80">
          <div className="flex items-center gap-1.5 text-xs font-bold text-brand-900 mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Instant Demo Account Sign-In:</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickLogin('USER')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-brand-200 hover:bg-brand-100/70 text-slate-800 transition text-center shadow-xs"
            >
              🏖️ Traveler
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('VENDOR')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-brand-200 hover:bg-brand-100/70 text-slate-800 transition text-center shadow-xs"
            >
              🏨 Hotel Partner
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('ADMIN')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-brand-200 hover:bg-brand-100/70 text-slate-800 transition text-center shadow-xs"
            >
              👑 Platform Admin
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('SUPPORT_AGENT')}
              disabled={loading}
              className="px-2.5 py-1.5 text-xs font-semibold rounded-xl bg-white border border-brand-200 hover:bg-brand-100/70 text-slate-800 transition text-center shadow-xs"
            >
              🎧 Support Desk
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
            {error}
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Priya Sharma"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('USER')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      role === 'USER'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    Traveler
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('VENDOR')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      role === 'VENDOR'
                        ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <Building className="w-3.5 h-3.5" />
                    Hotel Vendor
                  </button>
                </div>
              </div>
            </>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
              />
            </div>
          </div>

          {!isLogin && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number (Optional)</label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white text-sm font-bold shadow-lg shadow-brand-500/25 transition-all duration-200 disabled:opacity-50"
          >
            {loading ? 'Processing...' : isLogin ? 'Sign In to Account' : 'Create Free Account'}
          </button>
        </form>

        {/* Toggle between Login and Register */}
        <div className="mt-6 text-center text-xs text-slate-500">
          {isLogin ? "Don't have an account yet?" : 'Already have an account?'}{' '}
          <button
            type="button"
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="font-bold text-brand-600 hover:text-brand-700 underline ml-1"
          >
            {isLogin ? 'Sign up now' : 'Sign in'}
          </button>
        </div>
      </div>
    </div>
  );
}
