import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import {
  Headphones,
  Plus,
  MessageSquare,
  CheckCircle2,
  Clock,
  Send,
  AlertCircle,
  ShieldCheck,
  ChevronRight,
  LifeBuoy,
} from 'lucide-react';

export default function SupportTickets() {
  const { user, setAuthModalOpen } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [creating, setCreating] = useState(false);

  // New Ticket Form State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newCategory, setNewCategory] = useState('Booking');
  const [newPriority, setNewPriority] = useState('MEDIUM');

  const fetchTickets = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await api.get('/tickets');
      if (res.success) {
        setTickets(res.data);
        if (selectedTicket) {
          const updated = res.data.find((t) => t.id === selectedTicket.id);
          if (updated) setSelectedTicket(updated);
        }
      }
    } catch (err) {
      console.error('Failed to load tickets:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [user]);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newSubject.trim() || !newDescription.trim()) return;

    setCreating(true);
    try {
      const res = await api.post('/tickets', {
        subject: newSubject.trim(),
        description: newDescription.trim(),
        category: newCategory,
        priority: newPriority,
      });

      if (res.success) {
        setShowCreateModal(false);
        setNewSubject('');
        setNewDescription('');
        fetchTickets();
      }
    } catch (err) {
      alert(err.message || 'Failed to create ticket');
    } finally {
      setCreating(false);
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const res = await api.post(`/tickets/${selectedTicket.id}/messages`, {
        message: replyText.trim(),
      });
      if (res.success) {
        setReplyText('');
        fetchTickets();
      }
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    }
  };

  if (!user) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-6 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center mx-auto">
            <LifeBuoy className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900 font-display">
              Sign In to View Support Tickets
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Track booking disputes, refunds, and inquiry resolutions in real-time.
            </p>
          </div>
          <button
            onClick={() => setAuthModalOpen(true)}
            className="w-full py-3 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold text-xs shadow-sm transition"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-brand-600 uppercase tracking-wider mb-1">
              <Headphones className="w-4 h-4" />
              <span>Customer Helpdesk</span>
            </div>
            <h1 className="text-3xl font-extrabold text-slate-900 font-display">
              Support Inquiries & Resolution Desk
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Our 24/7 Concierge and Operations desk is ready to resolve your travel issues.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold shadow-sm transition self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Raise New Ticket</span>
          </button>
        </div>

        {/* Split View */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Ticket List */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
              Your Tickets ({tickets.length})
            </h3>

            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {tickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className={`p-4 rounded-2xl border cursor-pointer transition text-left space-y-2 ${
                      isSelected
                        ? 'bg-brand-50/60 border-brand-300 ring-1 ring-brand-400/20 shadow-sm'
                        : 'bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400">
                        #{t.ticketNumber || t.id.slice(0, 8)}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          t.status === 'OPEN'
                            ? 'bg-rose-100 text-rose-800'
                            : t.status === 'IN_PROGRESS'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{t.subject}</h4>
                    <p className="text-[11px] text-slate-500 line-clamp-2">{t.description}</p>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-2 border-t border-slate-100">
                      <span>{t.category}</span>
                      <span className="font-semibold text-slate-600">
                        {t.messages?.length || 0} messages
                      </span>
                    </div>
                  </div>
                );
              })}

              {tickets.length === 0 && (
                <div className="py-12 text-center text-slate-400 text-xs">
                  You have no active support tickets. Click "Raise New Ticket" if you need help.
                </div>
              )}
            </div>
          </div>

          {/* Ticket Messages & Conversation View */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between min-h-[500px]">
            {selectedTicket ? (
              <div className="space-y-5 h-full flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-mono font-bold text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-md">
                        #{selectedTicket.ticketNumber || selectedTicket.id.slice(0, 8)}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 font-display mt-1">
                        {selectedTicket.subject}
                      </h3>
                      <span className="text-xs text-slate-400">
                        Category: {selectedTicket.category} · Priority: {selectedTicket.priority}
                      </span>
                    </div>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        selectedTicket.status === 'RESOLVED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}
                    >
                      {selectedTicket.status}
                    </span>
                  </div>

                  <div className="mt-4 p-4 rounded-2xl bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Initial Inquiry
                    </span>
                    {selectedTicket.description}
                  </div>
                </div>

                {/* Conversation List */}
                <div className="space-y-3 max-h-72 overflow-y-auto pr-2 py-3 border-y border-slate-100">
                  {selectedTicket.messages && selectedTicket.messages.length > 0 ? (
                    selectedTicket.messages.map((m) => {
                      const isAgent =
                        m.senderRole === 'ADMIN' || m.senderRole === 'SUPPORT_AGENT';
                      return (
                        <div
                          key={m.id}
                          className={`flex flex-col ${isAgent ? 'items-start' : 'items-end'}`}
                        >
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mb-1">
                            <span className="font-semibold text-slate-700">{m.senderName}</span>
                            <span>•</span>
                            <span>{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <div
                            className={`p-3.5 rounded-2xl text-xs max-w-lg leading-relaxed ${
                              isAgent
                                ? 'bg-slate-900 text-white rounded-tl-none'
                                : 'bg-brand-50 text-brand-900 rounded-tr-none border border-brand-200'
                            }`}
                          >
                            {m.message}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="py-8 text-center text-slate-400 text-xs">
                      Our support desk has received your ticket and is preparing a response.
                    </div>
                  )}
                </div>

                {/* Reply Bar */}
                <form onSubmit={handleSendReply} className="pt-2 flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Write a message or reply..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="flex-1 px-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                  />
                  <button
                    type="submit"
                    disabled={!replyText.trim()}
                    className="px-4 py-2.5 rounded-2xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 flex items-center gap-1"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Send</span>
                  </button>
                </form>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400">
                <MessageSquare className="w-12 h-12 text-slate-300 mb-3" />
                <h4 className="text-sm font-bold text-slate-700">No Ticket Selected</h4>
                <p className="text-xs text-slate-400 max-w-xs mt-1">
                  Select a ticket on the left to read agent messages and send replies.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Raise Ticket Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-slate-100 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 font-display">
              Raise a Support Inquiry
            </h3>
            <form onSubmit={handleCreateTicket} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Check-in time query or refund request"
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="Booking">Booking & Stays</option>
                    <option value="Payment">Payment & Invoices</option>
                    <option value="Hotel">Hotel Amenities</option>
                    <option value="General">General Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent (On-Trip)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Details / Description</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Describe your issue with booking number or specific questions..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                ></textarea>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-semibold shadow-sm transition disabled:opacity-50"
                >
                  {creating ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
