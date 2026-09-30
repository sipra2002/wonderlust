import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  MapPin,
  Sun,
  Calendar,
  Star,
  Hotel,
  Utensils,
  ShieldAlert,
  Phone,
  Compass,
  ArrowRight,
  Sparkles,
  Heart,
  ChevronRight,
} from 'lucide-react';

export default function DestinationDetail({ onOpenAssistant }) {
  const { id } = useParams();
  const { user } = useAuth();
  const [destination, setDestination] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, hotels, food, emergency

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/destinations/${id}`);
        if (res.success) {
          setDestination(res.data);
        }
      } catch (err) {
        console.error('Failed to load destination details:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-20">
        <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!destination) {
    return (
      <div className="min-h-screen bg-slate-50 py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-800">Destination not found</h2>
        <Link to="/destinations" className="mt-4 inline-block px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold">
          Back to Explorer
        </Link>
      </div>
    );
  }

  const primaryImage = destination.images?.[0] || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80';
  const secondaryImage1 = destination.images?.[1] || primaryImage;
  const secondaryImage2 = destination.images?.[2] || primaryImage;

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Header Gallery */}
      <div className="relative bg-slate-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
            <Link to="/" className="hover:text-white transition">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/destinations" className="hover:text-white transition">Destinations</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-brand-400 font-bold">{destination.name}</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-500/20 border border-brand-500/30 text-brand-300 text-xs font-bold uppercase tracking-wider mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>{destination.category.replace('_', ' ')} Destination</span>
              </div>
              <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight font-display">
                {destination.name}
              </h1>
              <div className="flex items-center gap-2 text-sm text-slate-300 mt-2">
                <MapPin className="w-4 h-4 text-brand-400" />
                <span>{destination.state}, India</span>
                <span>•</span>
                <span className="text-emerald-400 font-semibold">Safe & Verified Tourist Hub</span>
              </div>
            </div>

            {/* Quick Weather & Best Season Widget */}
            <div className="flex items-center gap-3">
              <div className="glass-panel-dark px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/10">
                <Sun className="w-6 h-6 text-amber-400" />
                <div>
                  <span className="text-sm font-bold text-white block">{destination.weatherTemp}</span>
                  <span className="text-[11px] text-slate-400">{destination.weatherCondition}</span>
                </div>
              </div>

              <div className="glass-panel-dark px-4 py-2.5 rounded-2xl flex items-center gap-3 border border-white/10">
                <Calendar className="w-6 h-6 text-brand-400" />
                <div>
                  <span className="text-xs font-bold text-white block">Ideal Season</span>
                  <span className="text-[11px] text-slate-400">{destination.bestTimeToVisit}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Photo Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-3xl overflow-hidden h-[400px]">
            <div className="md:col-span-2 h-full overflow-hidden">
              <img
                src={primaryImage}
                alt={destination.name}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="hidden md:grid grid-rows-2 gap-4 h-full">
              <div className="overflow-hidden">
                <img
                  src={secondaryImage1}
                  alt={destination.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="overflow-hidden">
                <img
                  src={secondaryImage2}
                  alt={destination.name}
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Tabs & Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6">
        {/* Navigation Tabs */}
        <div className="glass-panel p-2 rounded-2xl shadow-lg border border-slate-200/80 flex items-center gap-2 max-w-xl">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'overview'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Compass className="w-4 h-4" />
            <span>Overview & Map</span>
          </button>

          <button
            onClick={() => setActiveTab('hotels')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'hotels'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Hotel className="w-4 h-4" />
            <span>Hotels ({destination.hotels?.length || 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('food')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'food'
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Utensils className="w-4 h-4" />
            <span>Cuisine & Dining</span>
          </button>

          <button
            onClick={() => setActiveTab('emergency')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'emergency'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-rose-50 hover:text-rose-600'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Emergency SOS</span>
          </button>
        </div>

        {/* Tab 1: Overview & Map */}
        {activeTab === 'overview' && (
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              {/* About Card */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  About {destination.name}
                </h2>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {destination.description}
                </p>

                <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">State</span>
                    <span className="text-sm font-bold text-slate-800">{destination.state}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Category</span>
                    <span className="text-sm font-bold text-slate-800 capitalize">{destination.category.replace('_', ' ')}</span>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Best Season</span>
                    <span className="text-sm font-bold text-slate-800">{destination.bestTimeToVisit}</span>
                  </div>
                </div>
              </div>

              {/* Map View & Location */}
              <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">
                      Location & Interactive Map
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">Explore geography, surrounding landmarks and regional access</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-bold border border-brand-100">
                    GPS: {destination.latitude}, {destination.longitude}
                  </span>
                </div>

                <div className="h-80 rounded-2xl overflow-hidden border border-slate-200 relative bg-slate-100">
                  <iframe
                    title={`${destination.name} Map`}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${destination.latitude},${destination.longitude}&hl=en&z=11&output=embed`}
                  ></iframe>
                </div>
              </div>

              {/* Frequently Asked Questions */}
              {destination.faqs?.length > 0 && (
                <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm space-y-4">
                  <h2 className="text-2xl font-bold text-slate-900 font-display">
                    Tourist FAQs for {destination.name}
                  </h2>
                  <div className="space-y-3">
                    {destination.faqs.map((faq) => (
                      <div key={faq.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                        <h4 className="text-sm font-bold text-slate-800 mb-1">{faq.question}</h4>
                        <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar CTA & Itinerary Trigger */}
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-brand-600 to-sky-700 rounded-3xl p-6 text-white shadow-xl space-y-4">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-md">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold font-display leading-snug">
                  Plan a Day-by-Day Trip to {destination.name}
                </h3>
                <p className="text-xs text-brand-100 leading-relaxed">
                  Use our interactive itinerary planner to build day-wise schedules, track budgets, and share with travel companions.
                </p>
                <Link
                  to={`/planner?destinationId=${destination.id}`}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-white text-brand-800 text-xs font-bold shadow-md hover:bg-brand-50 transition"
                >
                  <span>Launch Itinerary Builder</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Top Featured Hotel Teaser */}
              {destination.hotels?.[0] && (
                <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-purple-600 bg-purple-50 px-2.5 py-1 rounded-md">
                    Featured Luxury Stay
                  </span>
                  <h4 className="text-lg font-bold text-slate-900 font-display leading-tight">
                    {destination.hotels[0].name}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{destination.hotels[0].rating} / 5.0 rating</span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {destination.hotels[0].description}
                  </p>
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Starting from</span>
                      <span className="text-lg font-extrabold text-slate-900 font-display">
                        ₹{destination.hotels[0].pricePerNight?.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[11px] text-slate-500"> / night</span>
                    </div>
                    <Link
                      to={`/hotels/${destination.hotels[0].id}`}
                      className="px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition"
                    >
                      Book Room
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Hotels */}
        {activeTab === 'hotels' && (
          <div className="mt-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  Luxury Resorts & Stays in {destination.name}
                </h2>
                <p className="text-xs text-slate-500">Handpicked, verified properties with instant confirmation</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {destination.hotels?.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg transition-all p-6 flex flex-col justify-between"
                >
                  <div className="space-y-4">
                    <div className="h-52 rounded-2xl overflow-hidden bg-slate-100">
                      <img
                        src={hotel.images?.[0] || 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80'}
                        alt={hotel.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 font-display">{hotel.name}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{hotel.address}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-xl text-xs font-bold border border-amber-200">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-500" />
                        <span>{hotel.rating}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2">{hotel.description}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {hotel.amenities?.slice(0, 4).map((amenity, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium">
                          {amenity}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Price per night</span>
                      <span className="text-xl font-extrabold text-slate-900 font-display">
                        ₹{hotel.pricePerNight?.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <Link
                      to={`/hotels/${hotel.id}`}
                      className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold transition shadow-sm"
                    >
                      View Rooms & Reserve
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Local Food */}
        {activeTab === 'food' && (
          <div className="mt-8 space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 font-display">
                Top Eateries & Cuisine in {destination.name}
              </h2>
              <p className="text-xs text-slate-500">Signature regional dishes and handpicked local restaurants</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {destination.restaurants?.map((rest) => (
                <div key={rest.id} className="bg-white rounded-3xl overflow-hidden border border-slate-200/80 shadow-sm p-6 space-y-4">
                  <div className="h-44 rounded-2xl overflow-hidden bg-slate-100">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-full h-full object-cover hover:scale-105 transition duration-300"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg font-bold text-slate-900 font-display">{rest.name}</h4>
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">{rest.priceRange}</span>
                  </div>
                  <p className="text-xs text-slate-500">{rest.address}</p>

                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5">Signature Dishes:</span>
                    <ul className="space-y-1">
                      {rest.highlights?.map((item, i) => (
                        <li key={i} className="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-brand-500"></span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Emergency SOS Contacts */}
        {activeTab === 'emergency' && (
          <div className="mt-8 bg-white rounded-3xl p-8 border border-rose-200 shadow-sm space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600">
                <ShieldAlert className="w-7 h-7" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  Emergency & Tourist SOS Contacts for {destination.name}
                </h2>
                <p className="text-xs text-slate-500">Verified official medical facilities, police stations, and 24/7 helplines</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {destination.emergencyContacts?.map((contact) => (
                <div key={contact.id} className="p-5 rounded-2xl bg-rose-50/50 border border-rose-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider bg-rose-100 px-2 py-0.5 rounded-md">
                      {contact.serviceType}
                    </span>
                    <h4 className="text-sm font-bold text-slate-900 mt-1.5">{contact.name}</h4>
                    {contact.address && <p className="text-xs text-slate-500 mt-0.5">{contact.address}</p>}
                  </div>
                  <a
                    href={`tel:${contact.phone}`}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition shadow-sm"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>{contact.phone}</span>
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
