import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  X,
  Phone,
  ShieldAlert,
  HelpCircle,
  Search,
  MessageSquare,
  Sparkles,
  ExternalLink,
  MapPin,
  ChevronRight,
  Headphones,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function TouristAssistantModal({ isOpen, onClose }) {
  const [tab, setTab] = useState('sos'); // sos, faq, tickets
  const [faqs, setFaqs] = useState([]);
  const [emergencyData, setEmergencyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [faqSearch, setFaqSearch] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const [faqRes, emRes] = await Promise.all([
          api.get(`/assistant/faq?q=${faqSearch}`),
          api.get('/assistant/emergency'),
        ]);
        if (faqRes.success) setFaqs(faqRes.data);
        if (emRes.success) setEmergencyData(emRes);
      } catch (err) {
        console.error('Failed to load assistant data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isOpen, faqSearch]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-brand-500/20 text-brand-400 flex items-center justify-center border border-brand-500/30">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">Tourist Assistant & SOS</h3>
                <p className="text-xs text-slate-400">
                  24/7 Government helplines, emergency safety contacts & travel guide
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sub Navigation */}
          <div className="flex gap-2 mt-5">
            {[
              { id: 'sos', label: 'Emergency SOS & Helplines', icon: ShieldAlert },
              { id: 'faq', label: 'Tourist FAQs & Customs', icon: HelpCircle },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
                    tab === t.id
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{t.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {tab === 'sos' && (
            <div className="space-y-6">
              {/* National Helplines */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-rose-500" />
                  National Emergency Hotlines (India)
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {emergencyData?.nationalHelplines?.map((item, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between"
                    >
                      <div>
                        <span className="text-xs font-bold text-slate-900 block">{item.serviceType}</span>
                        <span className="text-[11px] text-slate-500 block">{item.name}</span>
                      </div>
                      <a
                        href={`tel:${item.phone}`}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-mono font-bold text-xs shadow-sm transition flex items-center gap-1.5"
                      >
                        <Phone className="w-3.5 h-3.5" />
                        <span>{item.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Destination Specific Contacts */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-brand-600" />
                  Local Destination Assistance Points
                </h4>
                <div className="space-y-2">
                  {emergencyData?.destinationContacts?.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block">
                          {item.name} ({item.destination?.name})
                        </span>
                        <span className="text-[11px] text-slate-400">{item.address || item.serviceType}</span>
                      </div>
                      <a
                        href={`tel:${item.phone}`}
                        className="px-3 py-1 rounded-xl bg-slate-900 hover:bg-brand-600 text-white font-mono font-bold text-xs transition flex items-center gap-1"
                      >
                        <Phone className="w-3 h-3" />
                        <span>{item.phone}</span>
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'faq' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search questions on currency, SIM cards, local etiquette, transport..."
                  value={faqSearch}
                  onChange={(e) => setFaqSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
                />
              </div>

              <div className="space-y-3">
                {faqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900">{faq.question}</h4>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600 font-semibold">
                        {faq.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Support Link */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            Need dedicated support on a booking?
          </span>
          <Link
            to="/support"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-semibold transition flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Open Helpdesk Ticket</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
