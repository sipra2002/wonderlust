import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Hotel as HotelIcon,
  Search,
  Star,
  MapPin,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

export default function HotelExplorer() {
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [maxPrice, setMaxPrice] = useState(70000);
  const [minRating, setMinRating] = useState(0);

  useEffect(() => {
    const fetchHotels = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams();
        if (search) queryParams.append('search', search);
        if (maxPrice) queryParams.append('maxPrice', maxPrice);
        if (minRating) queryParams.append('rating', minRating);

        const res = await api.get(`/hotels?${queryParams.toString()}`);
        if (res.success) setHotels(res.data);
      } catch (err) {
        console.error('Failed to load hotels:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHotels();
  }, [search, maxPrice, minRating]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Title */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-50 border border-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider">
            <HotelIcon className="w-4 h-4 text-purple-600" />
            <span>Luxury Hospitality Network</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Handpicked <span className="text-brand-600">Hotels & Stays</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            Reserve majestic heritage havelis, cliffside beach villas, and alpine mountain castles across India
            with instant confirmation and secure escrow payments.
          </p>
        </div>

        {/* Filter Controls Bar */}
        <div className="glass-panel p-6 rounded-3xl shadow-sm border border-slate-200/80 grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
          {/* Search by name/place */}
          <div className="relative">
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Search Stays</label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Hotel name, city, or state..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
              />
            </div>
          </div>

          {/* Price Range Slider */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700">Max Budget / Night</label>
              <span className="text-xs font-extrabold text-brand-600 font-display">₹{maxPrice.toLocaleString('en-IN')}</span>
            </div>
            <input
              type="range"
              min="5000"
              max="70000"
              step="2000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
            />
          </div>

          {/* Minimum Rating Filter */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">Minimum Rating</label>
            <div className="grid grid-cols-3 gap-2">
              {[0, 4.5, 4.8].map((ratingVal) => (
                <button
                  key={ratingVal}
                  type="button"
                  onClick={() => setMinRating(ratingVal)}
                  className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-1 ${
                    minRating === ratingVal
                      ? 'bg-brand-600 text-white border-brand-600 shadow-sm'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <Star className="w-3 h-3 fill-current" />
                  <span>{ratingVal === 0 ? 'All' : `${ratingVal}+`}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Hotel Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-200 animate-shimmer"></div>
            ))}
          </div>
        ) : hotels.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <HotelIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No hotels match your filters</h3>
            <p className="text-sm text-slate-500 mt-1">Try expanding your price range or adjusting the search term.</p>
            <button
              onClick={() => {
                setSearch('');
                setMaxPrice(70000);
                setMinRating(0);
              }}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {hotels.map((hotel) => (
              <div
                key={hotel.id}
                className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-60 overflow-hidden bg-slate-100">
                    <img
                      src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1 shadow-sm">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                      <span>{hotel.rating}</span>
                    </div>
                    <div className="absolute bottom-4 left-4 bg-slate-950/70 backdrop-blur-md px-2.5 py-1 rounded-lg text-white text-[11px] font-medium flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-brand-400" />
                      <span>{hotel.destination?.name}, {hotel.destination?.state}</span>
                    </div>
                  </div>

                  <div className="p-6 space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 font-display group-hover:text-brand-600 transition">
                        {hotel.name}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-1">{hotel.address}</p>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {hotel.description}
                    </p>

                    {/* Amenities tags */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {hotel.amenities?.slice(0, 3).map((amenity, i) => (
                        <span key={i} className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Card Footer */}
                <div className="p-6 pt-0 border-t border-slate-100 mt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">From / Night</span>
                    <span className="text-xl font-extrabold text-slate-900 font-display">
                      ₹{hotel.pricePerNight?.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <Link
                    to={`/hotels/${hotel.id}`}
                    className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <span>Reserve</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
