import React from 'react';
import { AlertTriangle, Phone, ShieldAlert } from 'lucide-react';

export default function SOSBanner({ onOpenAssistant }) {
  return (
    <aside aria-label="Tourist Emergency Hotlines" className="bg-gradient-to-r from-rose-600 via-amber-600 to-rose-700 text-white text-xs font-semibold py-2 px-4 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
          </span>
          <ShieldAlert className="w-4 h-4" />
          <span>Tourist Emergency Helpline: Dial <strong>112</strong> (National) or <strong>1363</strong> (Ministry of Tourism 24/7)</span>
        </div>
        <button
          onClick={onOpenAssistant}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 text-white transition backdrop-blur-sm text-[11px] font-bold"
        >
          <Phone className="w-3 h-3" />
          <span>View Local Police & Hospitals</span>
        </button>
      </div>
    </aside>
  );
}
