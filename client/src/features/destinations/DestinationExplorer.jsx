import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import {
  Search,
  MapPin,
  Sun,
  Calendar,
  Sparkles,
  Hotel,
  ArrowRight,
  Filter,
  Compass,
} from 'lucide-react';

export default function DestinationExplorer() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'all';

  const [destinations, setDestinations] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [destRes, catRes] = await Promise.all([
          api.get(`/destinations?category=${selectedCategory}&search=${search}`),
          api.get('/destinations/categories'),
        ]);

        if (destRes.success) setDestinations(destRes.data);
        if (catRes.success) setCategories(catRes.data);
      } catch (err) {
        console.error('Failed to load destinations:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCategory, search]);

  const handleCategoryClick = (catId) => {
    setSelectedCategory(catId);
    setSearchParams(catId === 'all' ? {} : { category: catId });
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header Title & Intro */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider">
            <Compass className="w-4 h-4 text-brand-600" />
            <span>Curated Indian Getaways</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Discover Incredible <span className="text-brand-600">India</span>
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            From the sun-soaked shores of Goa and mist-covered pine valleys of Manali,
            to the regal palaces of Rajasthan and sacred rapids of Rishikesh.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="glass-panel p-4 sm:p-6 rounded-3xl shadow-sm border border-slate-200/80 space-y-5">
          <div className="relative max-w-2xl mx-auto">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search destinations by name, state, or vibes (e.g. Goa, snow, temple)..."
              className="w-full pl-12 pr-4 py-3 rounded-2xl bg-white border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 shadow-inner"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {categories.map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-600 text-white shadow-md shadow-brand-500/20 scale-105'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/70'
                  }`}
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-300' : 'text-slate-400'}`} />
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Destination Cards Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-96 rounded-3xl bg-slate-200 animate-shimmer"></div>
            ))}
          </div>
        ) : destinations.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200/80 p-8">
            <MapPin className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No destinations found</h3>
            <p className="text-sm text-slate-500 mt-1">Try clearing your search query or selecting a different category.</p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCategory('all');
              }}
              className="mt-4 px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {destinations.map((dest) => {
              const primaryImage = dest.images?.[0] || 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80';
              return (
                <div
                  key={dest.id}
                  className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200/80 hover:shadow-xl hover:border-brand-200 transition-all duration-300 flex flex-col justify-between"
                >
                  <div>
                    {/* Destination Image Hero */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <img
                        src={primaryImage}
                        alt={dest.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent"></div>

                      {/* Weather Tag */}
                      <div className="absolute top-4 left-4 glass-panel px-3 py-1.5 rounded-full text-xs font-bold text-slate-900 flex items-center gap-1.5 shadow-sm">
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                        <span>{dest.weatherTemp} • {dest.weatherCondition}</span>
                      </div>

                      {/* Category Badge */}
                      <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-full text-[11px] font-bold text-white uppercase tracking-wider">
                        {dest.category.replace('_', ' ')}
                      </div>

                      {/* Name & State in Image Footer */}
                      <div className="absolute bottom-4 left-4 right-4 text-white">
                        <h2 className="text-2xl font-bold font-display tracking-tight flex items-center gap-1.5">
                          {dest.name}
                        </h2>
                        <div className="flex items-center gap-1 text-xs text-slate-200 font-medium mt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-400" />
                          <span>{dest.state}, India</span>
                        </div>
                      </div>
                    </div>

                    {/* Body Content */}
                    <div className="p-6 space-y-4">
                      <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                        {dest.description}
                      </p>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-brand-600" />
                          <span>Best: <strong className="text-slate-800">{dest.bestTimeToVisit}</strong></span>
                        </div>
                        <div className="flex items-center gap-1 text-slate-700 font-bold">
                          <Hotel className="w-3.5 h-3.5 text-purple-600" />
                          <span>{dest._count?.hotels || 2} Luxury Stays</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="px-6 pb-6 pt-2">
                    <Link
                      to={`/destinations/${dest.id}`}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-900 hover:bg-brand-600 text-white text-xs font-bold transition-all duration-200 group-hover:shadow-md"
                    >
                      <span>Explore Destination & Hotels</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
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
