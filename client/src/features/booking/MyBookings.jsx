import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Briefcase,
  Calendar,
  MapPin,
  Hotel,
  ArrowRight,
  Printer,
  XCircle,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function MyBookings() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await api.get('/bookings/my-bookings');
        if (res.success) setBookings(res.data);
      } catch (err) {
        console.error('Failed to load bookings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) return;

    try {
      const res = await api.post(`/bookings/${bookingId}/cancel`);
      if (res.success) {
        setBookings(bookings.map((b) => (b.id === bookingId ? { ...b, status: 'CANCELLED' } : b)));
      }
    } catch (err) {
      alert(err.message || 'Failed to cancel booking');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight font-display">
            My Bookings & Travel Vouchers
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage your active hotel stays, download official PDF vouchers, and review past journeys.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((n) => (
              <div key={n} className="h-44 rounded-3xl bg-slate-200 animate-shimmer"></div>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold text-slate-800">No bookings yet</h3>
            <p className="text-xs text-slate-500">You haven't reserved any stays yet. Explore our luxury destinations and hotels.</p>
            <Link
              to="/hotels"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
            >
              <span>Explore Luxury Stays</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {bookings.map((b) => {
              const isConfirmed = b.status === 'CONFIRMED';
              const isCancelled = b.status === 'CANCELLED';

              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={b.hotel?.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=300&q=80'}
                      alt={b.hotel?.name}
                      className="w-24 h-24 rounded-2xl object-cover shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">
                          {b.bookingNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : isCancelled
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {b.status}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 font-display">
                        {b.hotel?.name}
                      </h3>
                      <div className="flex items-center gap-1 text-xs text-slate-500">
                        <MapPin className="w-3.5 h-3.5 text-brand-500" />
                        <span>{b.hotel?.address}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {new Date(b.checkIn).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                          {new Date(b.checkOut).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span>•</span>
                        <span>{b.room?.type}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-none border-slate-100 gap-3">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Paid</span>
                      <span className="text-xl font-extrabold text-slate-900 font-display">
                        ₹{b.totalAmount?.toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link
                        to={`/bookings/confirmation/${b.id}`}
                        state={{ booking: b }}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Voucher</span>
                      </Link>

                      {isConfirmed && (
                        <button
                          onClick={() => handleCancelBooking(b.id)}
                          className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-bold transition"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
