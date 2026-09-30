import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, PhoneCall, ShieldCheck, Mail, MapPin, Heart } from 'lucide-react';

export default function Footer({ onOpenAssistant }) {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-brand-500 to-sky-400 flex items-center justify-center">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white font-display">
                Wanderlust <span className="text-brand-400">India</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              India’s premier travel, boutique luxury hotel booking, and intelligent trip planning platform.
              Crafting unforgettable memories across beaches, hill stations, royal heritage, and mountain escapes.
            </p>
            <div className="pt-2 flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 text-xs font-semibold text-emerald-400 border border-slate-700">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Partners & Escrow Payments</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Explore
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/destinations?category=beach" className="hover:text-white transition">Goa Beaches</Link>
              </li>
              <li>
                <Link to="/destinations?category=hill_station" className="hover:text-white transition">Manali & Munnar</Link>
              </li>
              <li>
                <Link to="/destinations?category=heritage" className="hover:text-white transition">Jaipur & Udaipur</Link>
              </li>
              <li>
                <Link to="/destinations?category=adventure" className="hover:text-white transition">Rishikesh Rafting</Link>
              </li>
              <li>
                <Link to="/hotels" className="hover:text-white transition">Luxury Heritage Stays</Link>
              </li>
            </ul>
          </div>

          {/* Planning & Dining */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Services
            </h3>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <Link to="/planner" className="hover:text-white transition">Day-Wise Trip Planner</Link>
              </li>
              <li>
                <Link to="/food" className="hover:text-white transition">Regional Food Guides</Link>
              </li>
              <li>
                <Link to="/support" className="hover:text-white transition">Customer Support Desk</Link>
              </li>
              <li>
                <Link to="/vendor" className="hover:text-white transition">Hotel Partner Portal</Link>
              </li>
              <li>
                <Link to="/admin" className="hover:text-white transition">Platform Command</Link>
              </li>
            </ul>
          </div>

          {/* 24/7 Helpline */}
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 font-display">
              Emergency SOS
            </h3>
            <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700/80 space-y-3">
              <div className="flex items-center gap-2 text-rose-400 text-xs font-bold">
                <PhoneCall className="w-4 h-4 animate-pulse" />
                <span>National All-in-One: 112</span>
              </div>
              <p className="text-xs text-slate-400 leading-snug">
                Tourism Helpline: <strong>1363</strong> (Toll Free, 24x7 Multi-lingual)
              </p>
              <button
                onClick={onOpenAssistant}
                className="w-full py-2 px-3 rounded-xl bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold transition text-center"
              >
                Open Emergency Directory
              </button>
            </div>
          </div>
        </div>

        <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© 2026 Wanderlust India Hospitality Pvt. Ltd. All rights reserved.</p>
          <div className="flex items-center gap-1 text-slate-400">
            Crafted with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 mx-0.5" /> for Travelers Worldwide
          </div>
        </div>
      </div>
    </footer>
  );
}
