import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import {
  Utensils,
  Search,
  Star,
  MapPin,
  Sparkles,
  Flame,
  Award,
} from 'lucide-react';

export default function FoodExplorer() {
  const [restaurants, setRestaurants] = useState([]);
  const [cuisines, setCuisines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCuisine, setSelectedCuisine] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [restRes, cuisRes] = await Promise.all([
          api.get(`/food/restaurants?cuisine=${selectedCuisine}&search=${search}`),
          api.get('/food/cuisines'),
        ]);

        if (restRes.success) setRestaurants(restRes.data);
        if (cuisRes.success) setCuisines(cuisRes.data);
      } catch (err) {
        console.error('Failed to load food listings:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [selectedCuisine, search]);

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-100 text-amber-700 text-xs font-bold uppercase tracking-wider">
            <Flame className="w-4 h-4 text-amber-500" />
            <span>Authentic Indian Gastronomy</span>
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight font-display">
            Taste the Flavors of India
          </h1>
          <p className="text-base text-slate-600 leading-relaxed">
            From Rajasthani royal thalis and Goan seafood shacks to coastal malabar curries and Kashmiri wazwan.
          </p>
        </div>

        {/* Filter & Search */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search restaurants, signature dishes, or cities..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1">
              <button
                onClick={() => setSelectedCuisine('all')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                  selectedCuisine === 'all'
                    ? 'bg-amber-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All Cuisines
              </button>
              {cuisines.map((c) => (
                <button
                  key={c}
                  onClick={() => setSelectedCuisine(c)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition whitespace-nowrap ${
                    selectedCuisine === c
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Restaurant Cards Grid */}
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-12 h-12 border-4 border-amber-200 border-t-amber-600 rounded-full animate-spin mx-auto"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((rest) => (
              <div
                key={rest.id}
                className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-lg transition duration-300 flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
                    <img
                      src={rest.image}
                      alt={rest.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute top-3 right-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/60 backdrop-blur-md text-white flex items-center gap-1">
                        <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                        {rest.rating}
                      </span>
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-600 text-white">
                        {rest.priceRange} Price Tier
                      </span>
                    </div>
                  </div>

                  <div className="p-5 space-y-3">
                    <div>
                      <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600">
                        <MapPin className="w-3 h-3" />
                        <span>{rest.destination?.name}, {rest.destination?.state}</span>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-0.5">{rest.name}</h3>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{rest.address}</p>
                    </div>

                    {/* Cuisines */}
                    <div className="flex flex-wrap gap-1">
                      {rest.cuisine?.map((c, i) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 text-[10px] font-semibold border border-amber-100"
                        >
                          {c}
                        </span>
                      ))}
                    </div>

                    {/* Signature Dishes */}
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1 text-xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Signature Specialities
                      </span>
                      <p className="font-medium text-slate-700">
                        {rest.highlights?.join(' · ')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
