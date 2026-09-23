import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchCropDetails } from '../../api/crops';
import { placeOrder } from '../../api/orders';
import { ShoppingBag, ArrowLeft, RefreshCw, AlertCircle, CheckCircle2, MapPin, User, ShieldCheck } from 'lucide-react';

export default function PlaceOrderPage() {
  const { cropId } = useParams();
  const navigate = useNavigate();

  const [crop, setCrop] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCrop = async () => {
      setLoading(true);
      setError('');
      try {
        const data = await fetchCropDetails(cropId);
        setCrop(data);
        setQuantity(data.quantity > 0 ? Math.min(10, data.quantity).toString() : '1');
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to fetch crop specifications');
      } finally {
        setLoading(false);
      }
    };
    loadCrop();
  }, [cropId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseFloat(quantity);
    if (isNaN(qty) || qty <= 0) {
      setError('Please enter a valid order quantity greater than 0.');
      return;
    }
    if (crop && qty > crop.quantity) {
      setError(`Quantity requested (${qty}) exceeds available farm stock (${crop.quantity} ${crop.unit}).`);
      return;
    }
    if (!deliveryAddress.trim()) {
      setError('Please provide a complete delivery address.');
      return;
    }

    setSubmitting(true);
    try {
      await placeOrder({
        crop_id: parseInt(cropId, 10),
        quantity: qty,
        delivery_address: deliveryAddress.trim(),
        notes: notes.trim() || undefined
      });
      navigate('/orders/mine');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to place order. Please verify quantity and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const parsedQty = parseFloat(quantity) || 0;
  const unitPrice = crop?.expected_price || 0;
  const subtotal = (parsedQty * unitPrice).toFixed(2);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <Link
            to={`/crops/${cropId}`}
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Details
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-emerald-400" /> Checkout & Place Crop Order
          </h1>
          <p className="text-xs text-slate-400">Direct transactional order agreement with farmer</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Preparing order checkout...</p>
          </div>
        ) : error || !crop ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 text-center">
            <p className="mb-4">{error || 'Crop not available'}</p>
            <Link to="/marketplace" className="px-4 py-2 bg-rose-900 text-rose-100 rounded-xl">
              Return to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Order Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                {error && (
                  <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Purchase Quantity ({crop.unit})
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={crop.quantity}
                      required
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                    <span className="text-3xs text-slate-400 mt-1 block">
                      Maximum available from farmer: <strong>{crop.quantity} {crop.unit}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Full Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Street address, landmark, district, state, pincode"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">
                      Special Delivery Instructions / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before arrival, preferred delivery timing"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <ShoppingBag className="w-4 h-4" />
                    {submitting ? 'Submitting Order...' : `Confirm Order for ₹${subtotal}`}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                  Crop Summary
                </h3>

                <div>
                  <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase">
                    {crop.category}
                  </span>
                  <h4 className="text-lg font-bold text-slate-100 mt-1">{crop.name}</h4>
                  <div className="text-3xs text-slate-400 flex items-center gap-1 mt-1">
                    <MapPin className="w-3 h-3 text-slate-500" /> {crop.location}
                  </div>
                </div>

                <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Unit Price:</span>
                    <span>₹{crop.expected_price} / {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Selected Qty:</span>
                    <span>{parsedQty} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-100 pt-2 border-t border-slate-800 text-sm">
                    <span>Calculated Total:</span>
                    <span className="text-emerald-400">₹{subtotal}</span>
                  </div>
                </div>

                <div className="text-3xs text-slate-400 space-y-1.5 pt-2 border-t border-slate-800">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3 h-3 text-slate-500" />
                    <span>Farmer: <strong className="text-slate-300">{crop.farmer?.full_name || 'Verified Farmer'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-400" />
                    <span>Inventory stock automatically reserved upon placement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
