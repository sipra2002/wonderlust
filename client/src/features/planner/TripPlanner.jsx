import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Plus,
  Trash2,
  Share2,
  DollarSign,
  Clock,
  MapPin,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Copy,
  Compass,
} from 'lucide-react';

export default function TripPlanner() {
  const [searchParams] = useSearchParams();
  const preSelectedDestId = searchParams.get('destinationId');
  const { user, setAuthModalOpen } = useAuth();

  const [destinations, setDestinations] = useState([]);
  const [trips, setTrips] = useState([]);
  const [selectedTrip, setSelectedTrip] = useState(null);
  const [loading, setLoading] = useState(true);

  // New trip modal
  const [isCreatingTrip, setIsCreatingTrip] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDestId, setNewDestId] = useState(preSelectedDestId || '');
  const [newStart, setNewStart] = useState('2026-11-15');
  const [newEnd, setNewEnd] = useState('2026-11-18');
  const [newBudget, setNewBudget] = useState(50000);

  // New activity form inside selected trip
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [itemDay, setItemDay] = useState(1);
  const [itemTimeSlot, setItemTimeSlot] = useState('Morning');
  const [itemActivity, setItemActivity] = useState('');
  const [itemLocation, setItemLocation] = useState('');
  const [itemCost, setItemCost] = useState(0);
  const [itemNotes, setItemNotes] = useState('');

  // Share link feedback
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const destRes = await api.get('/destinations');
        if (destRes.success) {
          setDestinations(destRes.data);
          if (!newDestId && destRes.data.length > 0) {
            setNewDestId(preSelectedDestId || destRes.data[0].id);
          }
        }

        if (user) {
          const tripsRes = await api.get('/trips');
          if (tripsRes.success) {
            setTrips(tripsRes.data);
            if (tripsRes.data.length > 0) {
              setSelectedTrip(tripsRes.data[0]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load trips:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, preSelectedDestId]);

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    try {
      const res = await api.post('/trips', {
        title: newTitle,
        destinationId: newDestId,
        startDate: newStart,
        endDate: newEnd,
        budget: Number(newBudget),
      });

      if (res.success) {
        setTrips([res.data, ...trips]);
        setSelectedTrip(res.data);
        setIsCreatingTrip(false);
        setNewTitle('');
      }
    } catch (err) {
      alert(err.message || 'Failed to create trip');
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    if (!selectedTrip) return;

    try {
      const res = await api.post(`/trips/${selectedTrip.id}/items`, {
        day: Number(itemDay),
        timeSlot: itemTimeSlot,
        activity: itemActivity,
        location: itemLocation,
        cost: Number(itemCost),
        notes: itemNotes,
      });

      if (res.success) {
        const updatedItems = [...(selectedTrip.items || []), res.data];
        const updatedTrip = {
          ...selectedTrip,
          items: updatedItems,
          totalExpenses: updatedItems.reduce((sum, it) => sum + it.cost, 0),
        };
        setSelectedTrip(updatedTrip);
        setTrips(trips.map((t) => (t.id === selectedTrip.id ? updatedTrip : t)));
        setIsAddingItem(false);
        setItemActivity('');
        setItemLocation('');
        setItemCost(0);
        setItemNotes('');
      }
    } catch (err) {
      alert(err.message || 'Failed to add activity');
    }
  };

  const handleDeleteActivity = async (itemId) => {
    try {
      const res = await api.delete(`/trips/${selectedTrip.id}/items/${itemId}`);
      if (res.success) {
        const updatedItems = selectedTrip.items.filter((it) => it.id !== itemId);
        const updatedTrip = {
          ...selectedTrip,
          items: updatedItems,
          totalExpenses: updatedItems.reduce((sum, it) => sum + it.cost, 0),
        };
        setSelectedTrip(updatedTrip);
        setTrips(trips.map((t) => (t.id === selectedTrip.id ? updatedTrip : t)));
      }
    } catch (err) {
      alert(err.message || 'Failed to delete activity');
    }
  };

  const handleShareTrip = () => {
    const shareUrl = `${window.location.origin}/trips/share/${selectedTrip?.shareToken || selectedTrip?.id}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Group itinerary items by day
  const groupedItems = (selectedTrip?.items || []).reduce((acc, item) => {
    const d = item.day || 1;
    if (!acc[d]) acc[d] = [];
    acc[d].push(item);
    return acc;
  }, {});

  const totalSpent = selectedTrip?.totalExpenses || 0;
  const budget = selectedTrip?.budget || 1;
  const budgetPercentage = Math.min(100, Math.round((totalSpent / budget) * 100));

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 border border-brand-100 text-brand-700 text-xs font-bold uppercase tracking-wider mb-2">
              <Compass className="w-3.5 h-3.5" />
              <span>Smart Itinerary Planner</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight font-display">
              Day-by-Day Travel Architect
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Build your customized trip schedule, allocate activities, track budgets, and share with travel companions.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {selectedTrip && (
              <button
                onClick={handleShareTrip}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-sm transition"
              >
                <Share2 className="w-4 h-4 text-brand-600" />
                <span>{copied ? 'Link Copied!' : 'Share Itinerary'}</span>
              </button>
            )}

            <button
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else setIsCreatingTrip(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold shadow-md shadow-brand-500/20 transition"
            >
              <Plus className="w-4 h-4" />
              <span>New Trip</span>
            </button>
          </div>
        </div>

        {/* Selected Trip Overview Bar */}
        {selectedTrip && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold text-brand-600 uppercase tracking-wider block">
                  Active Journey
                </span>
                <h2 className="text-2xl font-bold text-slate-900 font-display">
                  {selectedTrip.title}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{selectedTrip.destination?.name}, {selectedTrip.destination?.state}</span>
                  <span>•</span>
                  <span>
                    {new Date(selectedTrip.startDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })} –{' '}
                    {new Date(selectedTrip.endDate).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>

              {/* Trip Switcher Tabs */}
              {trips.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto pb-1 max-w-md">
                  {trips.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTrip(t)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                        selectedTrip.id === t.id
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {t.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Live Budget Tracker */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-100 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-bold text-slate-700">Trip Budget Estimator & Live Tracker</span>
                <div className="space-x-3">
                  <span className="text-slate-500">
                    Allocated: <strong className="text-slate-800">₹{totalSpent.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-slate-400">/</span>
                  <span className="text-slate-500">
                    Target Budget: <strong className="text-slate-800">₹{budget.toLocaleString('en-IN')}</strong>
                  </span>
                  <span className="text-brand-600 font-bold">({budgetPercentage}%)</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 rounded-full ${
                    budgetPercentage > 90 ? 'bg-rose-500' : budgetPercentage > 70 ? 'bg-amber-500' : 'bg-brand-600'
                  }`}
                  style={{ width: `${budgetPercentage}%` }}
                ></div>
              </div>
            </div>
          </div>
        )}

        {/* Day-Wise Timeline Schedule */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-slate-900 font-display">
              Day-by-Day Activity Schedule
            </h3>
            {selectedTrip && (
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-brand-50 text-brand-700 hover:bg-brand-100 text-xs font-bold transition border border-brand-200"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Activity</span>
              </button>
            )}
          </div>

          {!selectedTrip ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 space-y-4">
              <Calendar className="w-12 h-12 text-slate-300 mx-auto" />
              <h4 className="text-lg font-bold text-slate-800">No active trip selected</h4>
              <p className="text-xs text-slate-500">Create your first itinerary to schedule activities and track expenses.</p>
              <button
                onClick={() => {
                  if (!user) setAuthModalOpen(true);
                  else setIsCreatingTrip(true);
                }}
                className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold"
              >
                Create Trip Itinerary
              </button>
            </div>
          ) : Object.keys(groupedItems).length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-slate-200 p-8 space-y-3">
              <Sparkles className="w-8 h-8 text-amber-500 mx-auto" />
              <h4 className="text-base font-bold text-slate-800">Your schedule is empty</h4>
              <p className="text-xs text-slate-500">Add morning walks, local dining, heritage visits, or water adventures.</p>
              <button
                onClick={() => setIsAddingItem(true)}
                className="px-3.5 py-1.5 rounded-xl bg-brand-600 text-white text-xs font-bold"
              >
                + Add First Activity
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {Object.keys(groupedItems)
                .sort((a, b) => Number(a) - Number(b))
                .map((dayNum) => (
                  <div key={dayNum} className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-2xl bg-brand-600 text-white flex items-center justify-center font-bold text-xs shadow-md shadow-brand-500/20">
                        D{dayNum}
                      </div>
                      <h4 className="text-lg font-bold text-slate-800 font-display">
                        Day {dayNum} Plan
                      </h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4 border-l-2 border-brand-200">
                      {groupedItems[dayNum].map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition flex flex-col justify-between space-y-3"
                        >
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {item.timeSlot || 'Anytime'}
                              </span>
                              {item.cost > 0 && (
                                <span className="text-xs font-extrabold text-emerald-700 font-display">
                                  ₹{item.cost.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>
                            <h5 className="text-sm font-bold text-slate-900 leading-snug">
                              {item.activity}
                            </h5>
                            {item.location && (
                              <div className="flex items-center gap-1 text-xs text-slate-500">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span>{item.location}</span>
                              </div>
                            )}
                            {item.notes && (
                              <p className="text-xs text-slate-500 italic bg-slate-50 p-2 rounded-xl">
                                "{item.notes}"
                              </p>
                            )}
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex justify-end">
                            <button
                              onClick={() => handleDeleteActivity(item.id)}
                              className="text-slate-400 hover:text-rose-600 transition p-1"
                              title="Delete activity"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>

        {/* Modal: Create Trip */}
        {isCreatingTrip && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <h3 className="text-xl font-bold text-slate-900 font-display">Create New Itinerary</h3>
              <form onSubmit={handleCreateTrip} className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Trip Title</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Goa Beach Escape with Friends"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Destination</label>
                  <select
                    value={newDestId}
                    onChange={(e) => setNewDestId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  >
                    {destinations.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name} ({d.state})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={newStart}
                      onChange={(e) => setNewStart(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">End Date</label>
                    <input
                      type="date"
                      value={newEnd}
                      onChange={(e) => setNewEnd(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Target Budget (₹ INR)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreatingTrip(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                  >
                    Create Trip
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Add Activity */}
        {isAddingItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4">
              <h3 className="text-xl font-bold text-slate-900 font-display">Add Day Activity</h3>
              <form onSubmit={handleAddActivity} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Day Number</label>
                    <input
                      type="number"
                      min="1"
                      max="15"
                      value={itemDay}
                      onChange={(e) => setItemDay(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
                    <select
                      value={itemTimeSlot}
                      onChange={(e) => setItemTimeSlot(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                    >
                      <option>Morning</option>
                      <option>Afternoon</option>
                      <option>Evening</option>
                      <option>Night</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Activity Description</label>
                  <input
                    type="text"
                    required
                    value={itemActivity}
                    onChange={(e) => setItemActivity(e.target.value)}
                    placeholder="e.g. Scuba diving, Fort tour, Seafood dinner..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500/20"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Location / Landmark</label>
                  <input
                    type="text"
                    value={itemLocation}
                    onChange={(e) => setItemLocation(e.target.value)}
                    placeholder="e.g. Baga Beach, Hadimba Temple"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estimated Cost (₹ INR)</label>
                  <input
                    type="number"
                    min="0"
                    value={itemCost}
                    onChange={(e) => setItemCost(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Travel Notes (Optional)</label>
                  <textarea
                    value={itemNotes}
                    onChange={(e) => setItemNotes(e.target.value)}
                    placeholder="Remember sunscreen, ticket booking link..."
                    rows={2}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  ></textarea>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAddingItem(false)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-brand-600 text-white text-xs font-bold hover:bg-brand-700"
                  >
                    Add to Itinerary
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
