import React, { useState } from 'react';
import { api } from '../../services/api';
import {
  CreditCard,
  QrCode,
  Building2,
  Lock,
  X,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';

export default function RazorpayCheckoutModal({
  isOpen,
  onClose,
  checkoutData,
  onPaymentSuccess,
}) {
  const [method, setMethod] = useState('upi'); // upi, card, netbanking
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  // Simulated card inputs
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8910');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('888');

  // Simulated UPI ID
  const [upiId, setUpiId] = useState('aarav@okhdfcbank');

  if (!isOpen || !checkoutData) return null;

  const { booking, razorpay } = checkoutData;

  const handleSimulatePayment = async () => {
    setProcessing(true);
    setError('');

    try {
      // Simulate network roundtrip
      await new Promise((r) => setTimeout(r, 1200));

      const simulatedPaymentId = 'pay_sim_' + Math.random().toString(36).substring(2, 12);
      const simulatedSignature = 'sig_' + Math.random().toString(36).substring(2, 16);

      const verifyRes = await api.post('/bookings/verify', {
        bookingId: booking.id,
        razorpayOrderId: razorpay.orderId,
        razorpayPaymentId: simulatedPaymentId,
        razorpaySignature: simulatedSignature,
      });

      if (verifyRes.success) {
        onPaymentSuccess(verifyRes.booking);
      } else {
        throw new Error(verifyRes.message || 'Payment verification failed');
      }
    } catch (err) {
      setError(err.message || 'Payment processing encountered an error');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Top Razorpay Branding Header */}
        <div className="bg-slate-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg tracking-tighter">
              R
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight">Razorpay Trusted Checkout</span>
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] text-slate-400 block font-mono">
                Order: {razorpay.orderId || 'rzp_live_order'}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Amount & Booking Banner */}
        <div className="bg-blue-50/70 border-b border-blue-100 p-5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-blue-900 uppercase tracking-wider block">
              {booking.hotelName}
            </span>
            <span className="text-xs text-slate-600">
              {booking.roomType} • {booking.nights} Night(s)
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">Total to Pay</span>
            <span className="text-2xl font-extrabold text-blue-900 font-display">
              ₹{booking.totalAmount?.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setMethod('upi')}
              className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                method === 'upi'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-5 h-5 text-blue-600" />
              <span>UPI / QR</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('card')}
              className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                method === 'card'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-5 h-5 text-blue-600" />
              <span>Cards</span>
            </button>

            <button
              type="button"
              onClick={() => setMethod('netbanking')}
              className={`py-3 px-3 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                method === 'netbanking'
                  ? 'border-blue-600 bg-blue-50/60 text-blue-800 shadow-sm'
                  : 'border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-5 h-5 text-blue-600" />
              <span>Net Banking</span>
            </button>
          </div>

          {/* Form depending on method */}
          {method === 'upi' && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-700">UPI ID / VPA</label>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="username@bank"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
              />
              <div className="flex items-center gap-2 text-[11px] text-slate-500">
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">GPay</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">PhonePe</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">Paytm</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 font-semibold">BHIM</span>
              </div>
            </div>
          )}

          {method === 'card' && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Card Number</label>
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Expiry</label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">CVV</label>
                  <input
                    type="password"
                    value={cvv}
                    onChange={(e) => setCvv(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium"
                  />
                </div>
              </div>
            </div>
          )}

          {method === 'netbanking' && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Select Bank</label>
              <select className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold">
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>State Bank of India (SBI)</option>
                <option>Axis Bank</option>
                <option>Kotak Mahindra Bank</option>
              </select>
            </div>
          )}

          {/* Secure CTA */}
          <button
            type="button"
            onClick={handleSimulatePayment}
            disabled={processing}
            className="w-full py-3.5 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Lock className="w-4 h-4" />
            <span>
              {processing
                ? 'Verifying with Bank...'
                : `Pay ₹${booking.totalAmount?.toLocaleString('en-IN')}`}
            </span>
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>256-Bit SSL Encrypted • PCI-DSS Level 1 Compliant Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
