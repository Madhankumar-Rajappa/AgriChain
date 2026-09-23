import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchMyShipments, updateShipmentStatus } from '../../api/shipments';
import { 
  Truck, 
  Plus, 
  MapPin, 
  Phone, 
  User, 
  Calendar, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Navigation,
  ShieldCheck,
  Filter
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
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-indigo-950 text-indigo-300 border border-indigo-800 flex items-center gap-1"><Clock className="w-3 h-3" /> VEHICLE ASSIGNED</span>;
      case 'PICKED_UP':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><Navigation className="w-3 h-3" /> PICKED UP</span>;
      case 'IN_TRANSIT':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1"><Truck className="w-3 h-3" /> IN TRANSIT</span>;
      case 'DELIVERED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> SAFELY DELIVERED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-slate-800 text-slate-300">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Truck className="w-6 h-6 text-indigo-400" /> Logistics & Transport Dispatch
            </h1>
            <p className="text-xs text-slate-400">Track assigned vehicle dispatches, update live transit locations, and complete crop deliveries</p>
          </div>

          <Link
            to="/transporter/assign"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Dispatch New Shipment
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500"
            >
              <option value="">All Shipments</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="PICKED_UP">Picked Up</option>
              <option value="IN_TRANSIT">In Transit</option>
              <option value="DELIVERED">Delivered</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Total Active Dispatches: <strong className="text-slate-200">{total}</strong>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-indigo-500 mb-2" />
            <p className="text-xs">Loading assigned dispatches...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : shipments.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <Truck className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">No Active Assigned Shipments</h3>
            <p className="text-xs text-slate-400 mb-6">Dispatch a vehicle for a paid crop order ready for transportation.</p>
            <Link
              to="/transporter/assign"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl"
            >
              Dispatch New Vehicle
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {shipments.map((s) => (
              <div
                key={s.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <span className="text-xs font-bold text-slate-400">Shipment #{s.id}</span>
                    <span className="text-xs font-bold text-indigo-400">Order #{s.order_id}</span>
                    {getShipmentBadge(s.shipment_status)}
                  </div>

                  <div className="flex items-center space-x-3">
                    <span className="px-3 py-1 bg-indigo-950 border border-indigo-800 rounded-lg font-mono font-bold text-sm text-indigo-300">
                      {s.vehicle_number}
                    </span>
                    <span className="text-xs text-slate-300 font-semibold flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-slate-400" /> Driver: {s.driver_name}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                      <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.driver_phone}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 max-w-2xl mt-2">
                    <div>
                      <span className="text-slate-400 text-3xs block mb-0.5">Pickup Origin:</span>
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {s.pickup_address}
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-3xs block mb-0.5">Delivery Destination:</span>
                      <div className="font-semibold text-slate-200 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {s.delivery_address}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-3xs text-slate-400 pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> Est. Delivery: {s.estimated_delivery ? new Date(s.estimated_delivery).toLocaleDateString() : 'N/A'}
                    </span>
                    {s.actual_delivery && (
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Delivered: {new Date(s.actual_delivery).toLocaleString()}
                      </span>
                    )}
                  </div>

                  {s.tracking_notes && (
                    <p className="text-3xs text-indigo-300/80 bg-indigo-950/30 px-3 py-1 rounded-lg border border-indigo-900/40 w-fit">
                      Note: {s.tracking_notes}
                    </p>
                  )}
                </div>

                {/* Status action buttons */}
                <div className="flex flex-wrap items-center gap-2 shrink-0">
                  {s.shipment_status === 'ASSIGNED' && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'PICKED_UP')}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Navigation className="w-4 h-4" /> Mark Picked Up
                    </button>
                  )}

                  {(s.shipment_status === 'PICKED_UP' || s.shipment_status === 'ASSIGNED') && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'IN_TRANSIT')}
                      className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <Truck className="w-4 h-4" /> Mark In Transit
                    </button>
                  )}

                  {s.shipment_status === 'IN_TRANSIT' && (
                    <button
                      onClick={() => handleUpdateStatus(s.id, 'DELIVERED')}
                      className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                    >
                      <ShieldCheck className="w-4 h-4" /> Mark Delivered
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default TransporterDashboardPage;
