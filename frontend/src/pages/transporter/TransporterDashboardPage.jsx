import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchMyShipments, updateShipmentStatus } from '../../api/shipments';
import { 
  Truck, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Navigation, 
  ShieldCheck, 
  Filter,
  Loader2,
  Radio
} from 'lucide-react';

const TransporterDashboardPage = () => {
  const [shipments, setShipments] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    loadShipments();
  }, [statusFilter]);

  const loadShipments = async () => {
    setLoading(true);
    setError('');
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await fetchMyShipments(params);
      setShipments(data.items);
      setTotal(data.total);
    } catch (err) {
      console.error('Failed to load shipments:', err);
      setError(err.response?.data?.detail || 'Failed to load assigned shipments.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (shipmentId, newStatus) => {
    const notes = prompt(`Update shipment status to "${newStatus}"? Add optional location or transit note:`) || '';
    try {
      await updateShipmentStatus(shipmentId, {
        shipment_status: newStatus,
        tracking_notes: notes
      });
      loadShipments();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update shipment status.');
    }
  };

  const getShipmentBadge = (status) => {
    switch (status) {
      case 'ASSIGNED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-800 border border-indigo-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-indigo-600" /> VEHICLE ASSIGNED
          </span>
        );
      case 'PICKED_UP':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Navigation className="w-3.5 h-3.5 text-amber-600" /> PICKED UP FROM HUB
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> IN HIGHWAY TRANSIT
          </span>
        );
      case 'DELIVERED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#075B2A]" /> SAFELY DELIVERED
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            {status}
          </span>
        );
    }
  };

  return (
    <AppLayout
      title="Logistics & Fleet Dispatch"
      subtitle="Track assigned vehicle dispatches, update live transit locations, and complete crop deliveries"
      breadcrumb="Logistics Management"
    >
      <div className="space-y-6">
        {/* Top Controls Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Filter Bar */}
          <div className="bg-white border border-[#DDE8DF] rounded-2xl px-4 py-2.5 shadow-soft flex items-center gap-3">
            <Filter className="w-4 h-4 text-[#66756B]" />
            <span className="text-xs text-[#123524] font-bold">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7FAF5] border border-[#DDE8DF] text-xs text-[#123524] font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#075B2A]"
            >
              <option value="">All Dispatches ({total})</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          <Link
            to="/transporter/assign"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-xs rounded-xl shadow-soft transition-all hover:scale-[1.02] self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Dispatch New Vehicle
          </Link>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#075B2A] mb-3" />
            <p className="text-sm font-semibold">Loading assigned dispatches...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs max-w-md mx-auto my-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-soft">
            <Truck className="w-12 h-12 text-[#66756B] mx-auto mb-3" />
            <h3 className="text-base font-bold text-[#123524] mb-1">No Active Assigned Shipments</h3>
            <p className="text-xs text-[#66756B] mb-6">Dispatch a vehicle for a paid crop consignment awaiting road transport.</p>
            <Link
              to="/transporter/assign"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft"
            >
              Dispatch New Vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-[#DDE8DF] hover:border-[#B2D8BD] rounded-3xl p-6 transition-all shadow-soft hover:shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-[#66756B]">Dispatch #{s.id}</span>
                    <span className="text-xs font-bold text-[#075B2A] bg-[#EAF5EC] px-2.5 py-0.5 rounded-full border border-[#DDE8DF]">
                      Order #{s.order_id}
                    </span>
                    {getShipmentBadge(s.shipment_status)}
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <span className="px-3.5 py-1 bg-[#EAF5EC] border border-[#DDE8DF] rounded-xl font-mono font-bold text-sm text-[#075B2A]">
                      {s.vehicle_number}
                    </span>
                    <span className="text-xs text-[#123524] font-bold flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#075B2A]" /> Driver: {s.driver_name}
                    </span>
                    <span className="text-xs text-[#66756B] flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-[#075B2A]" /> {s.driver_phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF] max-w-2xl">
                    <div>
                      <span className="text-[#66756B] text-[11px] block mb-0.5">Pickup Warehouse / Farm:</span>
                      <div className="font-semibold text-[#123524] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" /> {s.pickup_address}
                      </div>
                    </div>
                    <div>
                      <span className="text-[#66756B] text-[11px] block mb-0.5">Delivery Destination:</span>
                      <div className="font-semibold text-[#123524] flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#075B2A] shrink-0" /> {s.delivery_address}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[#66756B]">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#075B2A]" /> Est. Delivery: {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString() : 'Pending ETA'}
                    </span>
                    {s.actual_delivery && (
                      <span className="text-[#075B2A] font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#075B2A]" /> Delivered: {new Date(s.actual_delivery).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {s.tracking_notes && (
                    <p className="text-xs text-[#123524] bg-[#EAF5EC] px-3.5 py-1.5 rounded-xl border border-[#DDE8DF] w-fit font-medium">
                      Transit Note: {s.tracking_notes}
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0">
                  <Link
                    to={`/tracking/${s.id}`}
                    className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
                  >
                    <Radio className="w-4 h-4 animate-pulse" /> Live Tracking Map
                  </Link>

                  {s.shipment_status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'PICKED_UP')}
                      className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" /> Mark Picked Up
                    </button>
                  )}

                  {(s.shipment_status === 'PICKED_UP' || s.shipment_status === 'ASSIGNED') && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'IN_TRANSIT')}
                      className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" /> Mark In Transit
                    </button>
                  )}

                  {s.shipment_status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'DELIVERED')}
                      className="px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Confirm Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default TransporterDashboardPage;
