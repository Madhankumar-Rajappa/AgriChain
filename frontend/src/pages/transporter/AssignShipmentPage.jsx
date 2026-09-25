import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { createShipment } from '../../api/shipments';
import { fetchOrderDetails } from '../../api/orders';
import { Truck, User, Phone, MapPin, Calendar, ArrowLeft, AlertCircle, ShieldCheck, Loader2 } from 'lucide-react';

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
        pickup_address: data.crop?.location ? `${data.crop.location} Agricultural Hub` : 'Central Grain Warehouse'
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
    <AppLayout
      title="Dispatch Vehicle Consignment"
      subtitle="Assign carrier vehicle, driver credentials, and scheduled routing for agricultural harvest delivery"
      breadcrumb="Logistics / Dispatch Consignment"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link 
          to="/transporter/shipments" 
          className="inline-flex items-center text-xs font-bold text-[#66756B] hover:text-[#075B2A] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Logistics Fleet
        </Link>

        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-9 shadow-soft">
          <div className="flex items-center space-x-3.5 mb-6 pb-5 border-b border-[#DDE8DF]">
            <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl border border-[#DDE8DF]">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#123524]">Consignment Dispatch Manifest</h1>
              <p className="text-xs text-[#66756B]">Assign verified driver, transport vehicle, and route</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          {order && (
            <div className="bg-[#F7FAF5] p-5 rounded-2xl border border-[#DDE8DF] mb-6 text-xs space-y-2">
              <div className="flex justify-between font-bold text-[#123524] text-sm">
                <span>Order #{order.id} — {order.crop?.name || 'Crop Consignment'}</span>
                <span className="text-[#075B2A]">₹{order.total_amount?.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <p className="text-[#66756B]">
                <strong className="text-[#123524]">Delivery Address:</strong> {order.delivery_address}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {!orderId && (
              <div>
                <label className="block text-xs font-bold text-[#123524] mb-2">Paid Order Reference ID</label>
                <input
                  type="number"
                  name="order_id"
                  required
                  onChange={handleChange}
                  placeholder="e.g. 1"
                  className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                  <Truck className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Vehicle Registration No.
                </label>
                <input
                  type="text"
                  name="vehicle_number"
                  required
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  placeholder="e.g. PB-10-AB-9876"
                  className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm font-mono text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                  <User className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Assigned Driver Full Name
                </label>
                <input
                  type="text"
                  name="driver_name"
                  required
                  value={formData.driver_name}
                  onChange={handleChange}
                  placeholder="e.g. Gurpreet Singh"
                  className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                  <Phone className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Driver Contact Mobile
                </label>
                <input
                  type="text"
                  name="driver_phone"
                  required
                  value={formData.driver_phone}
                  onChange={handleChange}
                  placeholder="e.g. +91-9876543210"
                  className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm font-mono text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                  <Calendar className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Estimated Delivery Date
                </label>
                <input
                  type="date"
                  name="estimated_delivery"
                  value={formData.estimated_delivery}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Pickup Point (Warehouse / Farm Depot)
              </label>
              <input
                type="text"
                name="pickup_address"
                required
                value={formData.pickup_address}
                onChange={handleChange}
                placeholder="e.g. Cold Storage Bay 4, Ludhiana Agro Hub"
                className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123524] mb-2">Transit & Handling Directives</label>
              <textarea
                name="tracking_notes"
                rows={2}
                value={formData.tracking_notes}
                onChange={handleChange}
                placeholder="e.g. Perishable cargo - Maintain 4°C cooling. Deliver within 24 hours."
                className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3.5 px-4 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-sm rounded-xl transition shadow-soft flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching Consignment...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Confirm & Authorize Dispatch</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/transporter/shipments')}
                className="px-6 py-3.5 bg-[#F7FAF5] hover:bg-[#EAF5EC] text-[#123524] font-bold text-sm rounded-xl border border-[#DDE8DF] transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
};

export default AssignShipmentPage;
