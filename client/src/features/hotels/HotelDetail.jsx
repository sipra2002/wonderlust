import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RazorpayCheckoutModal from '../booking/RazorpayCheckoutModal';
import {
  Hotel as HotelIcon,
  Star,
  MapPin,
  Calendar,
  Users,
  ShieldCheck,
  Check,
  ArrowRight,
  Info,
  ChevronRight,
} from 'lucide-react';

export default function HotelDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, setAuthModalOpen } = useAuth();

  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState(null);

  // Booking form state
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dayAfter = new Date();
  dayAfter.setDate(dayAfter.getDate() + 3);

  const [checkIn, setCheckIn] = useState(tomorrow.toISOString().split('T')[0]);
  const [checkOut, setCheckOut] = useState(dayAfter.toISOString().split('T')[0]);
  const [guests, setGuests] = useState(2);
  const [specialRequests, setSpecialRequests] = useState('');

  // Payment checkout modal state
  const [checkoutData, setCheckoutData] = useState(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const fetchHotel = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/hotels/${id}`);
        if (res.success) {
          setHotel(res.data);
          if (res.data.rooms?.length > 0) {
            setSelectedRoom(res.data.rooms[0]);
          }
        }
      } catch (err) {
        console.error('Failed to load hotel detail:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  // Price calculations
  const calculateNights = () => {
    const start = new Date(checkIn);
    const end = new Date(checkOut);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
    return Math.max(1, isNaN(diff) ? 1 : diff);
  };

  const nights = calculateNights();
  const roomPrice = selectedRoom?.price || hotel?.pricePerNight || 0;
  const baseTotal = roomPrice * nights;
  const tax = Math.round(baseTotal * 0.18);
  const grandTotal = baseTotal + tax;

  const handleBookNow = async () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    if (!selectedRoom) {
      alert('Please select a room type.');
      return;
    }

    setBookingLoading(true);
    try {
      const res = await api.post('/bookings/initiate', {
        hotelId: hotel.id,
        roomId: selectedRoom.id,
        checkIn,
        checkOut,
        guests: Number(guests),
        specialRequests,
      });

      if (res.success) {
        setCheckoutData(res);
        setIsCheckoutOpen(true);
      }
    } catch (err) {
      alert(err.message || 'Failed to initialize booking');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Hotel not found</h2>
        <Link to="/hotels" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Hotels
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Breadcrumb Header */}
      <div className="bg-white border-b border-slate-200/80 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-2 text-xs text-slate-500">
          <Link to="/" className="hover:text-slate-900 transition">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/hotels" className="hover:text-slate-900 transition">Hotels</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-slate-900 font-bold">{hotel.name}</span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
        {/* Title and Rating Bar */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                Verified Luxury Stay
              </span>
              <div className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                <span>{hotel.rating} / 5.0</span>
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              {hotel.name}
            </h1>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <MapPin className="w-3.5 h-3.5 text-brand-600" />
              <span>{hotel.address}</span>
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs text-slate-400 block font-medium">Starting from</span>
            <span className="text-3xl font-extrabold text-slate-900 font-display">
              ₹{hotel.pricePerNight?.toLocaleString('en-IN')}
            </span>
            <span className="text-xs text-slate-500"> / night + taxes</span>
          </div>
        </div>

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden h-[380px]">
          <div className="md:col-span-2 h-full overflow-hidden">
            <img
              src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'}
              alt={hotel.name}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          <div className="hidden md:grid grid-rows-2 gap-4 h-full">
            <div className="overflow-hidden">
              <img
                src={hotel.images?.[1] || hotel.images?.[0]}
                alt={hotel.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="overflow-hidden">
              <img
                src={hotel.images?.[2] || hotel.images?.[0]}
                alt={hotel.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
          </div>
        </div>

        {/* Content & Booking Form Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Left Details & Room Selector */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-slate-900 font-display">About the Property</h2>
              <p className="text-sm text-slate-600 leading-relaxed">{hotel.description}</p>

              {/* Amenities */}
              <div className="pt-4 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Property Amenities & Highlights
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {hotel.amenities?.map((amenity, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs font-semibold text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <Check className="w-4 h-4 text-brand-600 shrink-0" />
                      <span>{amenity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Room Selection */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-slate-900 font-display">
                Select Your Room / Suite
              </h2>

              <div className="space-y-4">
                {hotel.rooms?.map((room) => {
                  const isSelected = selectedRoom?.id === room.id;
                  return (
                    <div
                      key={room.id}
                      onClick={() => setSelectedRoom(room)}
                      className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                        isSelected
                          ? 'border-brand-600 bg-brand-50/40 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold text-slate-900">{room.type}</span>
                          {isSelected && (
                            <span className="text-[10px] bg-brand-600 text-white font-bold px-2 py-0.5 rounded-full">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <Users className="w-3.5 h-3.5 text-slate-400" />
                            Up to {room.capacity} Guests
                          </span>
                          <span>•</span>
                          <span className="text-emerald-600 font-semibold">Instant Confirmation</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1.5">
                          {room.amenities?.map((a, i) => (
                            <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                              {a}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="sm:text-right shrink-0">
                        <span className="text-xs text-slate-400 block font-medium">Rate / Night</span>
                        <span className="text-2xl font-extrabold text-slate-900 font-display">
                          ₹{room.price?.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Floating Booking Calculation Card */}
          <div className="sticky top-28 bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xl space-y-6">
            <div className="pb-4 border-b border-slate-100">
              <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                Reservation Summary
              </span>
              <h3 className="text-lg font-bold text-slate-900 font-display">
                {selectedRoom ? selectedRoom.type : 'Select Room'}
              </h3>
            </div>

            {/* Date Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-In</label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkIn}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">Check-Out</label>
                <div className="relative">
                  <input
                    type="date"
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>
              </div>
            </div>

            {/* Guests */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Guests</label>
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              >
                <option value={1}>1 Guest</option>
                <option value={2}>2 Guests</option>
                <option value={3}>3 Guests</option>
                <option value={4}>4 Guests</option>
              </select>
            </div>

            {/* Special Requests */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">Special Requests (Optional)</label>
              <textarea
                value={specialRequests}
                onChange={(e) => setSpecialRequests(e.target.value)}
                placeholder="High floor, early luggage drop, vegetarian meals..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
              ></textarea>
            </div>

            {/* Live Price Breakdown */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>₹{roomPrice.toLocaleString('en-IN')} × {nights} {nights === 1 ? 'Night' : 'Nights'}</span>
                <span className="font-semibold text-slate-800">₹{baseTotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Hospitality GST & Luxury Tax (18%)</span>
                <span className="font-semibold text-slate-800">₹{tax.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-extrabold text-slate-900">
                <span>Total Amount Payable</span>
                <span className="text-brand-600 font-display">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Action CTA */}
            <button
              onClick={handleBookNow}
              disabled={bookingLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-600 to-sky-600 hover:from-brand-700 hover:to-sky-700 text-white font-bold text-sm shadow-xl shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{bookingLoading ? 'Initializing Razorpay...' : 'Proceed to Razorpay Checkout'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-[11px] text-center text-slate-400">
              🔒 Powered by Razorpay Payment Gateway (UPI / Cards / Netbanking)
            </p>
          </div>
        </div>
      </div>

      {/* Razorpay Modal */}
      {isCheckoutOpen && checkoutData && (
        <RazorpayCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          checkoutData={checkoutData}
          onPaymentSuccess={(confirmedBooking) => {
            setIsCheckoutOpen(false);
            navigate(`/bookings/confirmation/${confirmedBooking.id}`, { state: { booking: confirmedBooking } });
          }}
        />
      )}
    </div>
  );
}
