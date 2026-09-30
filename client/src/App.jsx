import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import SOSBanner from './components/SOSBanner';
import AuthModal from './features/auth/AuthModal';
import TouristAssistantModal from './features/assistant/TouristAssistantModal';

// Pages / Feature Views
import DestinationExplorer from './features/destinations/DestinationExplorer';
import DestinationDetail from './features/destinations/DestinationDetail';
import HotelExplorer from './features/hotels/HotelExplorer';
import HotelDetail from './features/hotels/HotelDetail';
import TripPlanner from './features/planner/TripPlanner';
import MyBookings from './features/booking/MyBookings';
import BookingConfirmation from './features/booking/BookingConfirmation';
import FoodExplorer from './features/food/FoodExplorer';
import SupportTickets from './features/support/SupportTickets';
import AdminDashboard from './features/admin/AdminDashboard';

export default function App() {
  const { authModalOpen, setAuthModalOpen } = useAuth();
  const [assistantOpen, setAssistantOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 font-sans">
      <SOSBanner onOpenAssistant={() => setAssistantOpen(true)} />
      <Navbar onOpenAssistant={() => setAssistantOpen(true)} />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<DestinationExplorer />} />
          <Route path="/destinations" element={<DestinationExplorer />} />
          <Route
            path="/destinations/:id"
            element={<DestinationDetail onOpenAssistant={() => setAssistantOpen(true)} />}
          />
          <Route path="/hotels" element={<HotelExplorer />} />
          <Route path="/hotels/:id" element={<HotelDetail />} />
          <Route path="/planner" element={<TripPlanner />} />
          <Route path="/bookings" element={<MyBookings />} />
          <Route path="/booking-confirmation/:id" element={<BookingConfirmation />} />
          <Route path="/food" element={<FoodExplorer />} />
          <Route path="/support" element={<SupportTickets />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/vendor" element={<AdminDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      <Footer onOpenAssistant={() => setAssistantOpen(true)} />

      {/* Global Modals */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <TouristAssistantModal
        isOpen={assistantOpen}
        onClose={() => setAssistantOpen(false)}
      />
    </div>
  );
}

