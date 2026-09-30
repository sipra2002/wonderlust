import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Compass,
  MapPin,
  Hotel,
  Calendar,
  Utensils,
  HeadphonesIcon,
  Shield,
  Briefcase,
  User,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Sparkles,
} from 'lucide-react';

export default function Navbar({ onOpenAssistant }) {
  const { user, logout, switchRoleDemo, setAuthModalOpen } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Destinations', path: '/destinations', icon: MapPin },
    { name: 'Hotels & Stays', path: '/hotels', icon: Hotel },
    { name: 'Trip Planner', path: '/planner', icon: Calendar },
    { name: 'Local Food', path: '/food', icon: Utensils },
    { name: 'Support Tickets', path: '/support', icon: HeadphonesIcon },
    ...((user?.role === 'ADMIN' || user?.role === 'SUPPORT_AGENT')
      ? [{ name: 'Admin Panel', path: '/admin', icon: Shield, badge: 'Staff' }]
      : []),
  ];

  const handleRoleSwitch = async (role) => {
    setRoleMenuOpen(false);
    await switchRoleDemo(role);
    if (role === 'ADMIN') navigate('/admin');
    else if (role === 'VENDOR') navigate('/vendor');
    else if (role === 'USER') navigate('/destinations');
    else navigate('/support');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-slate-200/80 transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-brand-600 to-sky-400 flex items-center justify-center shadow-md shadow-brand-500/20 group-hover:scale-105 transition-transform duration-300">
              <Compass className="w-6 h-6 text-white animate-spin-slow" />
            </div>
            <div>
              <span className="text-2xl font-bold tracking-tight text-slate-900 font-display flex items-center gap-1.5">
                Wanderlust <span className="text-brand-600">India</span>
              </span>
              <span className="text-[10px] tracking-widest uppercase font-semibold text-slate-400 block -mt-1">
                Luxury Travel & Stays
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = location.pathname.startsWith(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'text-brand-600 bg-brand-50 font-semibold shadow-sm'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-600' : 'text-slate-400'}`} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Action Controls */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Demo Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white/80 hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-sm transition-all"
                title="Switch role for instant evaluation"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Role: <strong className="text-brand-600">{user?.role || 'GUEST'}</strong></span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {roleMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                    Quick Role Switcher (Demo)
                  </div>
                  <button
                    onClick={() => handleRoleSwitch('USER')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <span>Traveler (Aarav)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold">USER</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('VENDOR')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <span>Hotel Partner (Vikram)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 font-bold">VENDOR</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('ADMIN')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <span>Platform Admin (Pooja)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 font-bold">ADMIN</span>
                  </button>
                  <button
                    onClick={() => handleRoleSwitch('SUPPORT_AGENT')}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-brand-50 hover:text-brand-700 flex items-center justify-between"
                  >
                    <span>Support Desk (Devika)</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold">SUPPORT</span>
                  </button>
                </div>
              )}
            </div>

            {/* Tourist Assistant button */}
            <button
              onClick={onOpenAssistant}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-sm transition-all hover:shadow-glow"
            >
              <HeadphonesIcon className="w-3.5 h-3.5 text-brand-400" />
              <span>Tourist Assistant</span>
            </button>

            {/* User Account / Login */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  to={user.role === 'ADMIN' ? '/admin' : user.role === 'VENDOR' ? '/vendor' : '/bookings'}
                  className="flex items-center gap-2 group"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover ring-2 ring-brand-500/20 group-hover:ring-brand-500 transition-all"
                  />
                  <div className="text-left">
                    <span className="block text-xs font-bold text-slate-800 leading-tight">
                      {user.name.split(' ')[0]}
                    </span>
                    <span className="text-[10px] font-medium text-slate-400">
                      {user.role === 'USER' ? 'My Bookings' : user.role}
                    </span>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-md shadow-brand-500/20 transition-all"
              >
                <User className="w-4 h-4" />
                <span>Sign In</span>
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2.5 rounded-xl text-slate-600 hover:bg-slate-100"
            >
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <span className="text-xs font-semibold text-slate-500">Current Role: {user?.role || 'Guest'}</span>
            <div className="flex gap-1">
              <button
                onClick={() => handleRoleSwitch('USER')}
                className="px-2 py-0.5 text-[10px] bg-blue-100 text-blue-800 rounded font-bold"
              >
                Traveler
              </button>
              <button
                onClick={() => handleRoleSwitch('VENDOR')}
                className="px-2 py-0.5 text-[10px] bg-purple-100 text-purple-800 rounded font-bold"
              >
                Vendor
              </button>
              <button
                onClick={() => handleRoleSwitch('ADMIN')}
                className="px-2 py-0.5 text-[10px] bg-emerald-100 text-emerald-800 rounded font-bold"
              >
                Admin
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <link.icon className="w-5 h-5 text-brand-600" />
                {link.name}
              </Link>
            ))}
            {user && (
              <Link
                to="/bookings"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-100"
              >
                <Briefcase className="w-5 h-5 text-brand-600" />
                My Bookings & Invoices
              </Link>
            )}
          </div>

          <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
            <button
              onClick={() => {
                setMobileOpen(false);
                onOpenAssistant();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-semibold"
            >
              <HeadphonesIcon className="w-4 h-4 text-brand-400" />
              Open Tourist Assistant & SOS
            </button>
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-rose-200 text-rose-600 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out ({user.name})
              </button>
            ) : (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  setAuthModalOpen(true);
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-semibold"
              >
                <User className="w-4 h-4" />
                Sign In / Register
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
