import React, { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  CheckCircle2,
  Calendar,
  MapPin,
  Printer,
  Download,
  Hotel,
  Share2,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

export default function BookingConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const [booking, setBooking] = useState(location.state?.booking || null);
  const [loading, setLoading] = useState(!booking);

  useEffect(() => {
    if (!booking) {
      const fetchBooking = async () => {
        try {
          const res = await api.get(`/bookings/${id}`);
          if (res.success) setBooking(res.data);
        } catch (err) {
          console.error('Failed to load booking:', err);
        } finally {
          setLoading(false);
        }
      };
      fetchBooking();
    }
  }, [id, booking]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Booking details not available</h2>
        <Link to="/bookings" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          View My Bookings
        </Link>
      </div>
    );
  }

  const checkInStr = new Date(booking.checkIn).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const checkOutStr = new Date(booking.checkOut).toLocaleDateString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Success Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/15">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
            Booking Confirmed!
          </h1>
          <p className="text-sm text-slate-600">
            Your luxury reservation has been confirmed and paid via Razorpay. We have sent your receipt & hotel voucher to your email.
          </p>
        </div>

        {/* Printable Voucher Card */}
        <div id="voucher-print" className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:shadow-none print:border-none">
          {/* Voucher Header */}
          <div className="bg-slate-900 text-white p-6 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-brand-400 uppercase tracking-widest block">
                Official Travel Voucher
              </span>
              <h2 className="text-2xl font-bold font-display tracking-tight text-white mt-0.5">
                {booking.hotel?.name || 'Luxury Stay'}
              </h2>
              <div className="flex items-center gap-1 text-xs text-slate-300 mt-1">
                <MapPin className="w-3.5 h-3.5 text-brand-400" />
                <span>{booking.hotel?.address}</span>
              </div>
            </div>

            <div className="sm:text-right bg-slate-800/80 p-3 rounded-2xl border border-slate-700">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">Booking Number</span>
              <span className="text-sm font-mono font-extrabold text-white">
                {booking.bookingNumber}
              </span>
            </div>
          </div>

          {/* Voucher Details */}
          <div className="p-6 sm:p-8 space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-slate-100">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Check-In</span>
                <span className="text-sm font-bold text-slate-800">{checkInStr}</span>
                <span className="text-[11px] text-slate-500 block">From 2:00 PM</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Check-Out</span>
                <span className="text-sm font-bold text-slate-800">{checkOutStr}</span>
                <span className="text-[11px] text-slate-500 block">Until 11:00 AM</span>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Guests & Room</span>
                <span className="text-sm font-bold text-slate-800">{booking.room?.type || 'Deluxe Room'}</span>
                <span className="text-[11px] text-slate-500 block">{booking.guests} Guest(s)</span>
              </div>
            </div>

            {/* Payment Summary Table */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Payment Breakdown (INR)
              </h3>
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Room Accommodation Tariff</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(booking.totalAmount / 1.18).toFixed(0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Hospitality Goods & Service Tax (GST 18%)</span>
                  <span className="font-semibold text-slate-800">
                    ₹{(booking.totalAmount - (booking.totalAmount / 1.18)).toFixed(0).toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                  <span>Total Paid (Razorpay)</span>
                  <span className="text-brand-600 font-display">
                    ₹{booking.totalAmount?.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
            </div>

            {/* Verification badge */}
            <div className="flex items-center gap-2 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-100 text-xs text-emerald-800 font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Payment status: SUCCESS • Verified signature recorded with Razorpay Order API</span>
            </div>
          </div>

          {/* Voucher Actions (Hidden on Print) */}
          <div className="p-6 sm:p-8 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 print:hidden">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition"
            >
              <Printer className="w-4 h-4 text-slate-500" />
              <span>Print / Save PDF Voucher</span>
            </button>

            <div className="flex items-center gap-3">
              <Link
                to="/bookings"
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition"
              >
                All Bookings
              </Link>
              <Link
                to="/planner"
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-md shadow-brand-500/20"
              >
                <span>Add to Day Planner</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
