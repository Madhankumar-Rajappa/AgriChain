import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createShipment } from '../../api/shipments';
import { fetchOrderDetails } from '../../api/orders';
import { Truck, User, Phone, MapPin, Calendar, ArrowLeft, AlertCircle, ShieldCheck } from 'lucide-react';

const AssignShipmentPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [formData, setFormData] = useState({
    vehicle_number: '',
    driver_name: '',
    driver_phone: '',
    pickup_address: '',
    estimated_delivery: '',
    tracking_notes: ''
  });

  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (orderId) {
      loadOrder();
    } else {
      setOrderLoading(false);
    }
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setOrderLoading(true);
      const data = await fetchOrderDetails(orderId);
      setOrder(data);
      setFormData((prev) => ({
        ...prev,
        pickup_address: data.crop?.location ? `${data.crop.location} Agro Hub` : 'Central Grain Warehouse'
      }));
    } catch (err) {
      console.error('Failed to load order:', err);
    } finally {
      setOrderLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        order_id: parseInt(formData.order_id || orderId),
        vehicle_number: formData.vehicle_number.trim(),
        driver_name: formData.driver_name.trim(),
        driver_phone: formData.driver_phone.trim(),
        pickup_address: formData.pickup_address.trim(),
        estimated_delivery: formData.estimated_delivery ? new Date(formData.estimated_delivery).toISOString() : null,
        tracking_notes: formData.tracking_notes.trim()
      };

      await createShipment(payload);
      navigate('/transporter/shipments');
    } catch (err) {
      console.error('Failed to create shipment:', err);
      setError(err.response?.data?.detail || 'Failed to dispatch vehicle. Verify Order ID is paid.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Link 
          to="/transporter/shipments" 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-indigo-400 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Logistics Shipments
        </Link>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Dispatch Vehicle Shipment</h1>
              <p className="text-xs text-slate-400">Assign vehicle, driver, and transit schedule for crop transport delivery</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {order && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 mb-6 text-xs space-y-2">
              <div className="flex justify-between font-bold text-slate-200">
                <span>Order #{order.id} - {order.crop?.name || 'Crop Order'}</span>
                <span className="text-emerald-400">₹{order.total_amount}</span>
              </div>
              <p className="text-slate-400">Delivery Address: {order.delivery_address}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!orderId && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Paid Order ID</label>
                <input
                  type="number"
                  name="order_id"
                  required
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Vehicle Registration Number
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  required
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="e.g. PB-10-AB-9876"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Assigned Driver Full Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  required
                  value={formData.driver_name}
                  onChange={handleChange}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Driver Contact Phone
                </label>
                <input
                  type="text"
                  name="driver_phone"
                  required
                  value={formData.driver_phone}
                  onChange={handleChange}
                  placeholder="e.g. +91-9876543210"
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-mono focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Estimated Delivery Date
                </label>
                <input
                  type="date"
                  name="estimated_delivery"
                  value={formData.estimated_delivery}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-indigo-400" /> Pickup Location / Warehouse
              </label>
              <input
                type="text"
                name="pickup_address"
                required
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="e.g. Cold Storage Bay 4, Ludhiana Agro Hub"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Dispatch / Cargo Notes</label>
              <textarea
                name="tracking_notes"
                rows={2}
                value={formData.tracking_notes}
                onChange={handleChange}
                placeholder="e.g. Refrigerated container sealed at 4°C"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:border-indigo-500 outline-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Dispatching...</span>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Dispatch Vehicle</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/transporter/shipments')}
                className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AssignShipmentPage;
