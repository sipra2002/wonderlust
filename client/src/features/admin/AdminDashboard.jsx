import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  TrendingUp,
  Users,
  Building2,
  CalendarCheck,
  IndianRupee,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Search,
  RefreshCw,
  Eye,
  MessageSquare,
  Send,
  Sparkles,
  ChevronRight,
  Layers,
  ArrowUpRight,
  Check,
  X,
  Phone,
  MapPin,
  Star,
} from 'lucide-react';

export default function AdminDashboard() {
  const { user, switchRoleDemo, setAuthModalOpen } = useAuth();

  const [activeTab, setActiveTab] = useState('overview'); // overview, hotels, bookings, users, tickets
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Data states
  const [analytics, setAnalytics] = useState(null);
  const [hotels, setHotels] = useState([]);
  const [hotelFilter, setHotelFilter] = useState('all'); // all, pending, approved
  const [hotelSearch, setHotelSearch] = useState('');

  const [bookings, setBookings] = useState([]);
  const [bookingFilter, setBookingFilter] = useState('all');
  const [bookingSearch, setBookingSearch] = useState('');

  const [usersList, setUsersList] = useState([]);
  const [userRoleFilter, setUserRoleFilter] = useState('all');
  const [userSearch, setUserSearch] = useState('');

  const [tickets, setTickets] = useState([]);
  const [ticketFilter, setTicketFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [replying, setReplying] = useState(false);

  // Selected item modal for deeper view
  const [selectedHotelModal, setSelectedHotelModal] = useState(null);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Fetch functions
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await api.get('/admin/analytics');
      if (res.success) setAnalytics(res.data);
    } catch (err) {
      console.error('Failed to fetch analytics:', err);
    }
  }, []);

  const fetchHotels = useCallback(async () => {
    try {
      const res = await api.get(`/admin/hotels?status=${hotelFilter}&search=${hotelSearch}`);
      if (res.success) setHotels(res.data);
    } catch (err) {
      console.error('Failed to fetch hotels:', err);
    }
  }, [hotelFilter, hotelSearch]);

  const fetchBookings = useCallback(async () => {
    try {
      const res = await api.get(`/admin/bookings?status=${bookingFilter}&search=${bookingSearch}`);
      if (res.success) setBookings(res.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
    }
  }, [bookingFilter, bookingSearch]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await api.get(`/admin/users?role=${userRoleFilter}&search=${userSearch}`);
      if (res.success) setUsersList(res.data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  }, [userRoleFilter, userSearch]);

  const fetchTickets = useCallback(async () => {
    try {
      const res = await api.get(`/admin/tickets?status=${ticketFilter}`);
      if (res.success) {
        setTickets(res.data);
        if (selectedTicket) {
          const updated = res.data.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    }
  }, [ticketFilter, selectedTicket]);

  const loadAllData = useCallback(async () => {
    setLoading(true);
    await Promise.all([
      fetchAnalytics(),
      fetchHotels(),
      fetchBookings(),
      fetchUsers(),
      fetchTickets(),
    ]);
    setLoading(false);
  }, [fetchAnalytics, fetchHotels, fetchBookings, fetchUsers, fetchTickets]);

  useEffect(() => {
    if (user && (user.role === 'ADMIN' || user.role === 'SUPPORT_AGENT')) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user, loadAllData]);

  // Tab specific re-fetches
  useEffect(() => {
    if (activeTab === 'hotels') fetchHotels();
  }, [activeTab, hotelFilter, hotelSearch, fetchHotels]);

  useEffect(() => {
    if (activeTab === 'bookings') fetchBookings();
  }, [activeTab, bookingFilter, bookingSearch, fetchBookings]);

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
  }, [activeTab, userRoleFilter, userSearch, fetchUsers]);

  useEffect(() => {
    if (activeTab === 'tickets') fetchTickets();
  }, [activeTab, ticketFilter, fetchTickets]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadAllData();
    setRefreshing(false);
    showNotification('Admin data refreshed with latest database records');
  };

  // Actions
  const handleHotelApproval = async (hotelId, isApproved) => {
    try {
      const res = await api.patch(`/admin/hotels/${hotelId}/approval`, { isApproved });
      if (res.success) {
        showNotification(
          `Hotel listing ${isApproved ? 'Approved & Published' : 'Unapproved/Rejected'}!`,
          isApproved ? 'success' : 'info'
        );
        fetchHotels();
        fetchAnalytics();
        if (selectedHotelModal?.id === hotelId) {
          setSelectedHotelModal({ ...selectedHotelModal, isApproved });
        }
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update hotel approval status', 'error');
    }
  };

  const handleBookingStatus = async (bookingId, status) => {
    try {
      const res = await api.patch(`/admin/bookings/${bookingId}/status`, { status });
      if (res.success) {
        showNotification(`Booking updated to ${status}`);
        fetchBookings();
        fetchAnalytics();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update booking status', 'error');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/role`, { role: newRole });
      if (res.success) {
        showNotification(`User role updated to ${newRole}`);
        fetchUsers();
        fetchAnalytics();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to change user role', 'error');
    }
  };

  const handleVendorVerification = async (vendorId, verified) => {
    try {
      const res = await api.patch(`/admin/vendors/${vendorId}/verification`, { verified });
      if (res.success) {
        showNotification(`Vendor ${verified ? 'Verified' : 'Unverified'}`);
        fetchUsers();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update vendor verification', 'error');
    }
  };

  const handleTicketStatus = async (ticketId, status) => {
    try {
      const res = await api.patch(`/admin/tickets/${ticketId}/status`, { status });
      if (res.success) {
        showNotification(`Ticket updated to ${status}`);
        fetchTickets();
        fetchAnalytics();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to update ticket status', 'error');
    }
  };

  const handleSendTicketReply = async (e) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket) return;

    setReplying(true);
    try {
      const res = await api.post(`/tickets/${selectedTicket.id}/messages`, {
        message: replyMessage.trim(),
      });
      if (res.success) {
        setReplyMessage('');
        showNotification('Support reply dispatched to traveler');
        fetchTickets();
      }
    } catch (err) {
      showNotification(err.message || 'Failed to send message', 'error');
    } finally {
      setReplying(false);
    }
  };

  // If unauthorized
  if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPPORT_AGENT')) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 font-display">
              Admin Access Required
            </h2>
            <p className="text-sm text-slate-500">
              You are currently signed in as{' '}
              <strong className="text-slate-800 font-semibold">{user?.role || 'Guest'}</strong>.
              Please switch to the Administrator role to inspect and manage the platform.
            </p>
          </div>

          <div className="space-y-3 pt-2">
            <button
              onClick={() => switchRoleDemo('ADMIN')}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-sm font-semibold shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Switch to Admin Account (Demo)</span>
            </button>
            <button
              onClick={() => setAuthModalOpen(true)}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm font-medium transition"
            >
              Sign In with Custom Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Top Banner Header */}
      <div className="bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wide uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Live Operations
                </span>
                <span className="text-xs text-slate-400">
                  Role: <strong className="text-white">{user.role}</strong> ({user.name})
                </span>
              </div>
              <h1 className="text-3xl font-extrabold font-display tracking-tight text-white flex items-center gap-3">
                Wanderlust Control Center
              </h1>
              <p className="text-sm text-slate-400">
                Full-spectrum administration: Booking escrow, hotel listings moderation, role permissions, and traveler helpdesk.
              </p>
            </div>

            {/* Quick Action Refresh */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 text-emerald-400 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Syncing...' : 'Sync Live Data'}</span>
              </button>
            </div>
          </div>

          {/* Tab Bar */}
          <div className="flex items-center gap-2 mt-8 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800">
            {[
              { id: 'overview', name: 'Overview & Metrics', icon: TrendingUp, count: null },
              { id: 'hotels', name: 'Hotels Moderation', icon: Building2, count: analytics?.pendingHotels || 0 },
              { id: 'bookings', name: 'Bookings & Escrow', icon: CalendarCheck, count: bookings.length },
              { id: 'users', name: 'Users & Partners', icon: Users, count: usersList.length },
              { id: 'tickets', name: 'Helpdesk Tickets', icon: MessageSquare, count: analytics?.openTickets || 0 },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                    isActive
                      ? 'border-brand-500 text-brand-400 bg-slate-800/60 rounded-t-xl'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brand-400' : 'text-slate-500'}`} />
                  <span>{tab.name}</span>
                  {tab.count !== null && tab.count > 0 && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                        tab.id === 'hotels' && tab.count > 0
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : tab.id === 'tickets' && tab.count > 0
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-slate-700 text-slate-300'
                      }`}
                    >
                      {tab.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Notification Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl shadow-2xl border text-sm font-semibold ${
              notification.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : notification.type === 'info'
                ? 'bg-slate-900 text-white border-slate-700'
                : 'bg-emerald-900 text-white border-emerald-700'
            }`}
          >
            {notification.type === 'error' ? (
              <XCircle className="w-5 h-5 text-rose-400" />
            ) : (
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            )}
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Main Container Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin mx-auto"></div>
            <p className="text-sm font-medium text-slate-500">Loading platform data & metrics...</p>
          </div>
        ) : (
          <>
            {/* 1. OVERVIEW / ANALYTICS TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8 animate-in fade-in duration-300">
                {/* Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Revenue */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <IndianRupee className="w-20 h-20 text-brand-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total Platform Volume
                      </span>
                      <div className="p-2.5 rounded-2xl bg-emerald-50 text-emerald-600">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 font-display">
                        ₹{(analytics?.totalRevenue || 0).toLocaleString('en-IN')}
                      </span>
                      <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1 mt-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        From {analytics?.totalBookings || 0} bookings
                      </span>
                    </div>
                  </div>

                  {/* Confirmed Bookings */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <CalendarCheck className="w-20 h-20 text-brand-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Total Stays Booked
                      </span>
                      <div className="p-2.5 rounded-2xl bg-blue-50 text-blue-600">
                        <CalendarCheck className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <span className="text-3xl font-extrabold text-slate-900 font-display">
                        {analytics?.totalBookings || 0}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 block mt-1">
                        Across 12+ destinations in India
                      </span>
                    </div>
                  </div>

                  {/* Active Hotels & Moderation */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <Building2 className="w-20 h-20 text-brand-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Hotel Properties
                      </span>
                      <div className="p-2.5 rounded-2xl bg-purple-50 text-purple-600">
                        <Building2 className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 font-display">
                          {analytics?.approvedHotels || 0}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">approved</span>
                      </div>
                      {analytics?.pendingHotels > 0 ? (
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1">
                          <AlertCircle className="w-3 h-3" />
                          {analytics.pendingHotels} Pending Approval
                        </span>
                      ) : (
                        <span className="text-xs text-emerald-600 font-semibold block mt-1">
                          All listings moderated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Support Desk Status */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition">
                    <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-110 transition-transform">
                      <MessageSquare className="w-20 h-20 text-brand-600" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Customer Tickets
                      </span>
                      <div className="p-2.5 rounded-2xl bg-amber-50 text-amber-600">
                        <MessageSquare className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-slate-900 font-display">
                          {analytics?.openTickets || 0}
                        </span>
                        <span className="text-xs font-semibold text-rose-500 font-bold">open</span>
                      </div>
                      <span className="text-xs text-slate-500 block mt-1">
                        {analytics?.resolvedTickets || 0} resolved tickets
                      </span>
                    </div>
                  </div>
                </div>

                {/* Second Row: System Distribution & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Platform Distribution Card */}
                  <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                    <h3 className="text-base font-bold text-slate-900 font-display flex items-center gap-2">
                      <Layers className="w-4 h-4 text-brand-600" />
                      Platform Health & Ratios
                    </h3>

                    <div className="space-y-4">
                      {/* Hotel Moderation Progress */}
                      <div>
                        <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                          <span>Listing Approval Health</span>
                          <span className="text-emerald-600">
                            {analytics?.totalHotels > 0
                              ? Math.round(((analytics?.approvedHotels || 0) / analytics.totalHotels) * 100)
                              : 100}%
                          </span>
                        </div>
                        <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                            style={{
                              width: `${
                                analytics?.totalHotels > 0
                                  ? ((analytics?.approvedHotels || 0) / analytics.totalHotels) * 100
                                  : 100
                              }%`,
                            }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 mt-1">
                          <span>{analytics?.approvedHotels || 0} Active</span>
                          <span>{analytics?.pendingHotels || 0} Needs Review</span>
                        </div>
                      </div>

                      {/* User Persona Breakdown */}
                      <div className="pt-2 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-600 block mb-3">
                          Registered Accounts Distribution
                        </span>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                            <span className="text-[10px] uppercase font-bold text-blue-600 block">
                              Travelers
                            </span>
                            <span className="text-lg font-extrabold text-slate-800">
                              {analytics?.totalUsers || 0}
                            </span>
                          </div>
                          <div className="p-3 rounded-2xl bg-purple-50/60 border border-purple-100">
                            <span className="text-[10px] uppercase font-bold text-purple-600 block">
                              Vendors
                            </span>
                            <span className="text-lg font-extrabold text-slate-800">
                              {analytics?.totalVendors || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Bookings Live Stream */}
                  <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-base font-bold text-slate-900 font-display">
                          Live Recent Bookings
                        </h3>
                        <p className="text-xs text-slate-400">
                          Latest hotel reservations placed through the platform
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('bookings')}
                        className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                      >
                        <span>View All Bookings</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-slate-400 uppercase font-bold text-[10px] tracking-wider">
                            <th className="pb-3">Traveler</th>
                            <th className="pb-3">Hotel & Room</th>
                            <th className="pb-3">Total (₹)</th>
                            <th className="pb-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 font-medium">
                          {analytics?.recentBookings && analytics.recentBookings.length > 0 ? (
                            analytics.recentBookings.map((b, idx) => (
                              <tr key={b.id || idx} className="hover:bg-slate-50/80 transition">
                                <td className="py-3 pr-2">
                                  <div className="flex items-center gap-2">
                                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-600 text-xs">
                                      {b.user?.name?.[0] || 'U'}
                                    </div>
                                    <div>
                                      <span className="font-bold text-slate-800 block">
                                        {b.user?.name}
                                      </span>
                                      <span className="text-[10px] text-slate-400">{b.user?.email}</span>
                                    </div>
                                  </div>
                                </td>
                                <td className="py-3 px-2">
                                  <span className="font-semibold text-slate-800 block">
                                    {b.hotel?.name}
                                  </span>
                                  <span className="text-[10px] text-slate-500">
                                    {b.room?.type} · {b.hotel?.destination?.name}
                                  </span>
                                </td>
                                <td className="py-3 px-2 font-bold text-slate-900">
                                  ₹{b.totalAmount?.toLocaleString('en-IN')}
                                </td>
                                <td className="py-3 pl-2">
                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                      b.status === 'CONFIRMED'
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : b.status === 'PENDING'
                                        ? 'bg-amber-100 text-amber-800'
                                        : 'bg-rose-100 text-rose-800'
                                    }`}
                                  >
                                    {b.status}
                                  </span>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="py-6 text-center text-slate-400">
                                No recent bookings recorded yet.
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. HOTEL MODERATION TAB */}
            {activeTab === 'hotels' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search & Filter Header */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search hotels, destinations, vendors..."
                      value={hotelSearch}
                      onChange={(e) => setHotelSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {[
                      { id: 'all', label: 'All Listings' },
                      { id: 'pending', label: 'Pending Approval', badge: analytics?.pendingHotels },
                      { id: 'approved', label: 'Approved Only' },
                    ].map((f) => (
                      <button
                        key={f.id}
                        onClick={() => setHotelFilter(f.id)}
                        className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
                          hotelFilter === f.id
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        <span>{f.label}</span>
                        {f.badge > 0 && (
                          <span className="px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px]">
                            {f.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Hotel List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between group"
                    >
                      <div>
                        {/* Hotel Image & Status */}
                        <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                          <img
                            src={
                              hotel.images?.[0] ||
                              'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80'
                            }
                            alt={hotel.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                          />
                          <div className="absolute top-3 left-3 flex gap-2">
                            {hotel.isApproved ? (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600/90 backdrop-blur-md text-white flex items-center gap-1 shadow-sm">
                                <CheckCircle2 className="w-3 h-3" />
                                Approved & Live
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-500/90 backdrop-blur-md text-white flex items-center gap-1 shadow-sm animate-pulse">
                                <Clock className="w-3 h-3" />
                                Pending Moderation
                              </span>
                            )}
                          </div>
                          <div className="absolute top-3 right-3">
                            <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              {hotel.rating}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 space-y-3">
                          <div>
                            <div className="flex items-center gap-1 text-[11px] font-bold text-brand-600">
                              <MapPin className="w-3 h-3" />
                              <span>
                                {hotel.destination?.name}, {hotel.destination?.state}
                              </span>
                            </div>
                            <h4 className="text-base font-bold text-slate-900 line-clamp-1 mt-0.5">
                              {hotel.name}
                            </h4>
                            <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                              {hotel.description}
                            </p>
                          </div>

                          {/* Vendor Info */}
                          <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                            <div>
                              <span className="text-[10px] text-slate-400 block font-semibold">
                                Vendor Partner
                              </span>
                              <span className="font-bold text-slate-700">
                                {hotel.vendor?.businessName || 'Wanderlust Direct'}
                              </span>
                            </div>
                            {hotel.vendor?.verified && (
                              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                                Verified
                              </span>
                            )}
                          </div>

                          {/* Amenities Tags */}
                          <div className="flex flex-wrap gap-1">
                            {hotel.amenities?.slice(0, 3).map((a, i) => (
                              <span
                                key={i}
                                className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 text-[10px] font-medium"
                              >
                                {a}
                              </span>
                            ))}
                            {hotel.amenities?.length > 3 && (
                              <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-400 text-[10px]">
                                +{hotel.amenities.length - 3} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="p-5 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between gap-2">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Nightly rate</span>
                          <span className="text-sm font-extrabold text-slate-900">
                            ₹{hotel.pricePerNight?.toLocaleString('en-IN')}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedHotelModal(hotel)}
                            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition"
                            title="Inspect Hotel Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {hotel.isApproved ? (
                            <button
                              onClick={() => handleHotelApproval(hotel.id, false)}
                              className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition"
                            >
                              Revoke
                            </button>
                          ) : (
                            <button
                              onClick={() => handleHotelApproval(hotel.id, true)}
                              className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {hotels.length === 0 && (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
                    <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                    <h3 className="text-base font-bold text-slate-800">No hotels match criteria</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Try clearing search parameters or adjusting approval status filters.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* 3. BOOKINGS & ESCROW TAB */}
            {activeTab === 'bookings' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search & Filter Header */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search booking #, customer, or hotel..."
                      value={bookingSearch}
                      onChange={(e) => setBookingSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'CONFIRMED', 'PENDING', 'CANCELLED', 'COMPLETED'].map((st) => (
                      <button
                        key={st}
                        onClick={() => setBookingFilter(st)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          bookingFilter === st
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {st === 'all' ? 'All Bookings' : st}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Bookings Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-3.5 px-4">Booking Ref</th>
                          <th className="py-3.5 px-4">Customer Details</th>
                          <th className="py-3.5 px-4">Hotel & Dates</th>
                          <th className="py-3.5 px-4">Escrow / Total (₹)</th>
                          <th className="py-3.5 px-4">Payment</th>
                          <th className="py-3.5 px-4">Current Status</th>
                          <th className="py-3.5 px-4 text-right">Quick Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {bookings.map((b) => (
                          <tr key={b.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-4 px-4 font-mono font-bold text-slate-800">
                              {b.bookingNumber}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-900 block">{b.user?.name}</span>
                              <span className="text-[11px] text-slate-400 block">{b.user?.email}</span>
                              {b.user?.phone && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                                  <Phone className="w-2.5 h-2.5" />
                                  {b.user.phone}
                                </span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-bold text-slate-800 block">{b.hotel?.name}</span>
                              <span className="text-[11px] text-slate-500 block">
                                {new Date(b.checkIn).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}{' '}
                                -{' '}
                                {new Date(b.checkOut).toLocaleDateString('en-IN', {
                                  day: 'numeric',
                                  month: 'short',
                                })}{' '}
                                ({b.guests} Guests)
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span className="font-extrabold text-slate-900 text-sm">
                                ₹{b.totalAmount?.toLocaleString('en-IN')}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                  b.payment?.status === 'SUCCESS'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : 'bg-amber-100 text-amber-800'
                                }`}
                              >
                                {b.payment?.status || 'UNPAID'}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  b.status === 'CONFIRMED'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : b.status === 'PENDING'
                                    ? 'bg-amber-100 text-amber-800'
                                    : b.status === 'COMPLETED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {b.status}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <select
                                value={b.status}
                                onChange={(e) => handleBookingStatus(b.id, e.target.value)}
                                className="px-2 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                              >
                                <option value="CONFIRMED">Confirm</option>
                                <option value="PENDING">Pending</option>
                                <option value="COMPLETED">Completed</option>
                                <option value="CANCELLED">Cancel</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {bookings.length === 0 && (
                    <div className="py-12 text-center text-slate-400">
                      No bookings matching your criteria.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 4. USER & VENDOR ADMINISTRATION */}
            {activeTab === 'users' && (
              <div className="space-y-6 animate-in fade-in duration-300">
                {/* Search & Filter Header */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="relative w-full md:w-96">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search users by name, email, or role..."
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
                    {['all', 'USER', 'VENDOR', 'ADMIN', 'SUPPORT_AGENT'].map((role) => (
                      <button
                        key={role}
                        onClick={() => setUserRoleFilter(role)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                          userRoleFilter === role
                            ? 'bg-slate-900 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {role === 'all' ? 'All Roles' : role}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                          <th className="py-3.5 px-4">User</th>
                          <th className="py-3.5 px-4">Assigned Role</th>
                          <th className="py-3.5 px-4">Vendor Profile</th>
                          <th className="py-3.5 px-4">Usage Counts</th>
                          <th className="py-3.5 px-4">Joined Date</th>
                          <th className="py-3.5 px-4 text-right">Role Management</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium">
                        {usersList.map((u) => (
                          <tr key={u.id} className="hover:bg-slate-50/70 transition">
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3">
                                <img
                                  src={
                                    u.avatar ||
                                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
                                  }
                                  alt={u.name}
                                  className="w-9 h-9 rounded-full object-cover border border-slate-200"
                                />
                                <div>
                                  <span className="font-bold text-slate-900 block">{u.name}</span>
                                  <span className="text-[11px] text-slate-400">{u.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <span
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                  u.role === 'ADMIN'
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : u.role === 'VENDOR'
                                    ? 'bg-purple-100 text-purple-800'
                                    : u.role === 'SUPPORT_AGENT'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {u.role}
                              </span>
                            </td>
                            <td className="py-4 px-4">
                              {u.vendorProfile ? (
                                <div className="space-y-1">
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-semibold text-slate-800">
                                      {u.vendorProfile.businessName}
                                    </span>
                                    <button
                                      onClick={() =>
                                        handleVendorVerification(
                                          u.vendorProfile.id,
                                          !u.vendorProfile.verified
                                        )
                                      }
                                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold transition ${
                                        u.vendorProfile.verified
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-500 hover:bg-emerald-50 hover:text-emerald-700'
                                      }`}
                                      title="Toggle Vendor Verified Badge"
                                    >
                                      {u.vendorProfile.verified ? 'Verified ✓' : 'Unverified ✕'}
                                    </button>
                                  </div>
                                  <span className="text-[10px] text-slate-400 block">
                                    {u.vendorProfile._count?.hotels || 0} listed hotels
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 text-[11px]">No vendor profile</span>
                              )}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center gap-3 text-[11px] text-slate-600">
                                <span title="Bookings count">
                                  <strong className="text-slate-900">{u._count?.bookings || 0}</strong>{' '}
                                  stays
                                </span>
                                <span title="Trips count">
                                  <strong className="text-slate-900">{u._count?.trips || 0}</strong>{' '}
                                  trips
                                </span>
                                <span title="Tickets count">
                                  <strong className="text-slate-900">{u._count?.tickets || 0}</strong>{' '}
                                  tickets
                                </span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-slate-500 text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString('en-IN', {
                                day: 'numeric',
                                month: 'short',
                                year: 'numeric',
                              })}
                            </td>
                            <td className="py-4 px-4 text-right">
                              <select
                                value={u.role}
                                onChange={(e) => handleRoleChange(u.id, e.target.value)}
                                className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 bg-white font-semibold text-slate-700 shadow-sm focus:outline-none focus:ring-1 focus:ring-brand-500"
                              >
                                <option value="USER">Traveler (USER)</option>
                                <option value="VENDOR">Partner (VENDOR)</option>
                                <option value="SUPPORT_AGENT">Support (SUPPORT_AGENT)</option>
                                <option value="ADMIN">Platform Admin (ADMIN)</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* 5. HELPDESK & SUPPORT TICKETS */}
            {activeTab === 'tickets' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-300">
                {/* Tickets List Column */}
                <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="text-base font-bold text-slate-900 font-display">
                      Support Inquiries
                    </h3>
                    <div className="flex gap-1">
                      {['all', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
                        <button
                          key={st}
                          onClick={() => setTicketFilter(st)}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                            ticketFilter === st
                              ? 'bg-slate-900 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                    {tickets.map((ticket) => {
                      const isSelected = selectedTicket?.id === ticket.id;
                      return (
                        <div
                          key={ticket.id}
                          onClick={() => setSelectedTicket(ticket)}
                          className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-2 ${
                            isSelected
                              ? 'bg-brand-50/60 border-brand-300 shadow-sm ring-1 ring-brand-400/20'
                              : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono font-bold text-slate-400">
                              #{ticket.ticketNumber || ticket.id.slice(0, 8)}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                ticket.status === 'OPEN'
                                  ? 'bg-rose-100 text-rose-800'
                                  : ticket.status === 'IN_PROGRESS'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {ticket.status}
                            </span>
                          </div>

                          <div>
                            <h4 className="text-xs font-bold text-slate-900 line-clamp-1">
                              {ticket.subject}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {ticket.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                            <span>{ticket.user?.name}</span>
                            <span className="font-semibold text-slate-600">
                              {ticket.messages?.length || 0} responses
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {tickets.length === 0 && (
                      <div className="py-8 text-center text-slate-400 text-xs">
                        No support tickets found for this filter.
                      </div>
                    )}
                  </div>
                </div>

                {/* Ticket Conversation & Action Desk */}
                <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[500px]">
                  {selectedTicket ? (
                    <div className="space-y-5 h-full flex flex-col justify-between">
                      {/* Top Ticket Header */}
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                                #{selectedTicket.ticketNumber || selectedTicket.id.slice(0, 8)}
                              </span>
                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                  selectedTicket.priority === 'HIGH' ||
                                  selectedTicket.priority === 'URGENT'
                                    ? 'bg-rose-100 text-rose-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {selectedTicket.priority} Priority
                              </span>
                            </div>
                            <h3 className="text-lg font-bold text-slate-900 font-display mt-1">
                              {selectedTicket.subject}
                            </h3>
                            <span className="text-xs text-slate-400">
                              Raised by <strong className="text-slate-700">{selectedTicket.user?.name}</strong> (
                              {selectedTicket.user?.email})
                            </span>
                          </div>

                          {/* Status action buttons */}
                          <div className="flex items-center gap-2">
                            {selectedTicket.status !== 'RESOLVED' && (
                              <button
                                onClick={() => handleTicketStatus(selectedTicket.id, 'RESOLVED')}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                Mark Resolved
                              </button>
                            )}
                            {selectedTicket.status === 'OPEN' && (
                              <button
                                onClick={() => handleTicketStatus(selectedTicket.id, 'IN_PROGRESS')}
                                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold shadow-sm transition"
                              >
                                In Progress
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Ticket Initial Description */}
                        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs text-slate-700 leading-relaxed">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                            Issue Description
                          </span>
                          {selectedTicket.description}
                        </div>
                      </div>

                      {/* Messages Thread */}
                      <div className="space-y-3 max-h-80 overflow-y-auto pr-2 py-3 border-y border-slate-100">
                        {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                          selectedTicket.messages.map((m) => {
                            const isAdmin =
                              m.senderRole === 'ADMIN' || m.senderRole === 'SUPPORT_AGENT';
                            return (
                              <div
                                key={m.id}
                                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'}`}
                              >
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                                  <span className="font-semibold text-slate-700">{m.senderName}</span>
                                  <span>•</span>
                                  <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                                <div
                                  className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                                    isAdmin
                                      ? 'bg-slate-900 text-white rounded-tr-none'
                                      : 'bg-slate-100 text-slate-800 rounded-tl-none border border-slate-200'
                                  }`}
                                >
                                  {m.message}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No agent replies on this ticket yet. Dispatch a message below.
                          </div>
                        )}
                      </div>

                      {/* Reply Form */}
                      <form onSubmit={handleSendTicketReply} className="pt-2">
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Type resolution message or instructions for traveler..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                          />
                          <button
                            type="submit"
                            disabled={replying || !replyMessage.trim()}
                            className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1.5"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>{replying ? 'Sending...' : 'Reply'}</span>
                          </button>
                        </div>
                      </form>
                    </div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                      <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                      <h4 className="text-sm font-bold text-slate-700">No Ticket Selected</h4>
                      <p className="text-xs text-slate-400 max-w-xs mt-1">
                        Select an open customer ticket on the left panel to review inquiry threads and reply directly.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Hotel Detail Inspection Modal */}
      {selectedHotelModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-100 shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider">
                  Hotel Inspection & Verification
                </span>
                <h3 className="text-xl font-bold text-slate-900 font-display">
                  {selectedHotelModal.name}
                </h3>
              </div>
              <button
                onClick={() => setSelectedHotelModal(null)}
                className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Gallery */}
            <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden h-40">
              {selectedHotelModal.images?.slice(0, 3).map((img, i) => (
                <img key={i} src={img} alt="" className="w-full h-full object-cover" />
              ))}
            </div>

            <div className="space-y-3 text-xs text-slate-600 leading-relaxed">
              <p>{selectedHotelModal.description}</p>
              <div className="flex items-center gap-2 text-slate-700 font-semibold">
                <MapPin className="w-4 h-4 text-brand-600" />
                <span>{selectedHotelModal.address}</span>
              </div>
            </div>

            {/* Room configurations */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2">
                Configured Room Tiers ({selectedHotelModal.rooms?.length || 0})
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedHotelModal.rooms?.map((rm) => (
                  <div key={rm.id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1">
                    <span className="font-bold text-slate-800 block text-xs">{rm.type}</span>
                    <span className="text-xs text-brand-600 font-extrabold">
                      ₹{rm.price?.toLocaleString('en-IN')}/night
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Capacity: {rm.capacity} Guests · Inventory: {rm.totalRooms} rooms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                onClick={() => setSelectedHotelModal(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50"
              >
                Close
              </button>
              {selectedHotelModal.isApproved ? (
                <button
                  onClick={() => handleHotelApproval(selectedHotelModal.id, false)}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-sm"
                >
                  Unapprove / Revoke Listing
                </button>
              ) : (
                <button
                  onClick={() => handleHotelApproval(selectedHotelModal.id, true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm"
                >
                  Approve for Public Bookings
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
