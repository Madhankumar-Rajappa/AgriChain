import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchCropDetails } from '../../api/crops';
import { placeOrder } from '../../api/orders';
import { ShoppingBag, ArrowLeft, RefreshCw, AlertCircle, MapPin, User, ShieldCheck, Loader2 } from 'lucide-react';

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
    <AppLayout
      title="Checkout & Place Order"
      subtitle="Direct transactional order agreement with registered agricultural producer."
      breadcrumb="Marketplace / Place Order"
    >
      <div className="max-w-4xl mx-auto space-y-6">
        <Link
          to={`/crops/${cropId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075B2A] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Details
        </Link>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-2" />
            <p className="text-xs">Preparing order checkout...</p>
          </div>
        ) : error || !crop ? (
          <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-xs max-w-md mx-auto my-12 text-center shadow-soft">
            <p className="mb-4">{error || 'Crop not available'}</p>
            <Link to="/marketplace" className="px-4 py-2 bg-[#075B2A] text-white rounded-xl font-semibold">
              Return to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Left Order Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
                <div className="flex items-center gap-3 pb-4 border-b border-[#EBF2ED]">
                  <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl">
                    <ShoppingBag className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-[#123524]">Order Specifications</h2>
                    <p className="text-xs text-[#66756B]">Enter quantity and physical destination</p>
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-[#123524] mb-1.5">
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
                      className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                    />
                    <span className="text-[11px] text-[#66756B] mt-1 block">
                      Maximum available from farmer: <strong className="text-[#123524]">{crop.quantity} {crop.unit}</strong>
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123524] mb-1.5">
                      Full Delivery Address
                    </label>
                    <textarea
                      rows={3}
                      required
                      placeholder="Street address, landmark, district, state, pincode"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-[#123524] mb-1.5">
                      Special Delivery Instructions / Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Call before arrival, preferred delivery timing"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-sm rounded-xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Submitting Order...
                      </>
                    ) : (
                      <>
                        <ShoppingBag className="w-4 h-4" />
                        <span>Confirm Order for ₹{subtotal}</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Summary Card */}
            <div className="space-y-6">
              <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-card space-y-4 sticky top-24">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#123524] border-b border-[#EBF2ED] pb-3">
                  Crop Summary
                </h3>

                <div>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#EAF5EC] text-[#075B2A] uppercase border border-[#DDE8DF]">
                    {crop.category}
                  </span>
                  <h4 className="text-base font-bold text-[#123524] mt-2">{crop.name}</h4>
                  <div className="text-[11px] text-[#66756B] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> {crop.location}
                  </div>
                </div>

                <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF] space-y-2 text-xs">
                  <div className="flex justify-between text-[#66756B]">
                    <span>Unit Price:</span>
                    <span>₹{crop.expected_price} / {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-[#66756B]">
                    <span>Selected Qty:</span>
                    <span>{parsedQty} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between font-bold text-[#123524] pt-2 border-t border-[#DDE8DF] text-sm">
                    <span>Order Subtotal:</span>
                    <span className="text-[#075B2A]">₹{subtotal}</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#66756B] space-y-2 pt-2 border-t border-[#EBF2ED]">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#075B2A]" />
                    <span>Farmer: <strong className="text-[#123524]">{crop.farmer?.full_name || 'Verified Farmer'}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#075B2A]" />
                    <span>Inventory stock reserved upon placement</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
