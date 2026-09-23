import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { 
  fetchWarehouses, 
  fetchStorageBookings, 
  bookStorage, 
  updateStorageStatus 
} from '../../api/warehouses';
import { 
  Warehouse, 
  Plus, 
  MapPin, 
  HardDrive, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Box, 
  ShieldCheck,
  Search
} from 'lucide-react';

const WarehouseManagementPage = () => {
  const [activeTab, setActiveTab] = useState('facilities'); // 'facilities' or 'bookings'
  
  const [warehouses, setWarehouses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Storage Allocation Modal State
  const [showAllocateModal, setShowAllocateModal] = useState(false);
  const [allocOrderId, setAllocOrderId] = useState('');
  const [allocWarehouseId, setAllocWarehouseId] = useState('');
  const [allocNotes, setAllocNotes] = useState('');
  const [allocLoading, setAllocLoading] = useState(false);
  const [allocError, setAllocError] = useState('');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      if (activeTab === 'facilities') {
        const res = await fetchWarehouses();
        setWarehouses(res.items);
      } else {
        const res = await fetchStorageBookings();
        setBookings(res.items);
      }
    } catch (err) {
      console.error('Failed to load warehouse data:', err);
      setError(err.response?.data?.detail || 'Failed to load storage data');
    } finally {
      setLoading(false);
    }
  };

  const handleAllocateStorage = async (e) => {
    e.preventDefault();
    setAllocLoading(true);
    setAllocError('');

    try {
      await bookStorage({
        order_id: parseInt(allocOrderId),
        warehouse_id: parseInt(allocWarehouseId),
        notes: allocNotes
      });
      setShowAllocateModal(false);
      setAllocOrderId('');
      setAllocNotes('');
      loadData();
    } catch (err) {
      console.error('Allocation error:', err);
      setAllocError(err.response?.data?.detail || 'Failed to allocate storage. Verify Order ID is PAID.');
    } finally {
      setAllocLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId, newStatus) => {
    const notes = prompt(`Update storage status to "${newStatus}"? Add optional verification note:`) || '';
    try {
      await updateStorageStatus(bookingId, {
        storage_status: newStatus,
        notes: notes
      });
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update storage status.');
    }
  };

  const getStorageBadge = (status) => {
    switch (status) {
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> RESERVED</span>;
      case 'STORED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> STORED IN BAY</span>;
      case 'RELEASED_FOR_DISPATCH':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-950 text-blue-300 border border-blue-800 flex items-center gap-1"><Truck className="w-3 h-3" /> RELEASED FOR DISPATCH</span>;
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
              <Warehouse className="w-6 h-6 text-emerald-400" /> Warehouse & Storage Management
            </h1>
            <p className="text-xs text-slate-400">Manage cold storage facilities, monitor capacity, and allocate inventory slots for paid orders</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllocateModal(true)}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 transition-all hover:scale-[1.02]"
            >
              <Box className="w-4 h-4" /> Allocate Order Storage
            </button>
            <Link
              to="/warehouse/add"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-emerald-400" /> Add New Facility
            </Link>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 mb-6">
          <button
            onClick={() => setActiveTab('facilities')}
            className={`pb-3 px-4 font-semibold text-xs transition border-b-2 ${
              activeTab === 'facilities'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Facilities Overview ({warehouses.length})
          </button>
          <button
            onClick={() => setActiveTab('bookings')}
            className={`pb-3 px-4 font-semibold text-xs transition border-b-2 ${
              activeTab === 'bookings'
                ? 'border-emerald-500 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Storage Allocations ({bookings.length})
          </button>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading warehouse metrics...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : activeTab === 'facilities' ? (
          /* Facilities Tab */
          warehouses.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
              <Warehouse className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200 mb-1">No Storage Facilities Registered</h3>
              <p className="text-xs text-slate-400 mb-6">Create your first cold storage hub to start receiving crop inventory.</p>
              <Link
                to="/warehouse/add"
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
              >
                Register Storage Facility
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {warehouses.map((wh) => {
                const usedCapacity = wh.total_capacity_tons - wh.available_capacity_tons;
                const percentUsed = Math.min(100, Math.round((usedCapacity / wh.total_capacity_tons) * 100));

                return (
                  <div
                    key={wh.id}
                    className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-slate-700 transition"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <div className="p-2.5 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                          <Warehouse className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-3xs font-semibold ${
                          wh.is_active ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' : 'bg-slate-800 text-slate-400'
                        }`}>
                          {wh.is_active ? 'ACTIVE' : 'INACTIVE'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-slate-100 mb-1">{wh.name}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                        <MapPin className="w-3.5 h-3.5 text-slate-500" /> {wh.location}
                      </p>

                      {/* Capacity Bar */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 mb-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                          <span className="text-slate-400">Occupied Capacity</span>
                          <span className="text-emerald-400">{percentUsed}%</span>
                        </div>
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-3xs text-slate-400 pt-1">
                          <span>Available: <strong>{wh.available_capacity_tons} Tons</strong></span>
                          <span>Total: {wh.total_capacity_tons} Tons</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-3xs text-slate-500 pt-2 border-t border-slate-800/60">
                      Managed by: {wh.manager?.full_name || 'System Admin'}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Bookings Tab */
          bookings.length === 0 ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
              <Box className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-200 mb-1">No Active Storage Bookings</h3>
              <p className="text-xs text-slate-400 mb-6">Allocate paid crop orders to registered warehouse facilities.</p>
              <button
                onClick={() => setShowAllocateModal(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
              >
                Allocate Storage Space
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-slate-700 transition"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">Booking #{b.id}</span>
                      <span className="text-xs font-bold text-emerald-400">Order #{b.order_id}</span>
                      {getStorageBadge(b.storage_status)}
                    </div>

                    <h3 className="text-base font-bold text-slate-100">
                      {b.warehouse?.name || `Warehouse #${b.warehouse_id}`}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 max-w-2xl">
                      <div>
                        <span className="text-slate-400 text-3xs">Tonnage Reserved:</span>
                        <div className="font-extrabold text-emerald-400">{b.quantity_stored} Tons</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Entry Date:</span>
                        <div className="font-semibold text-slate-200">{b.entry_date ? new Date(b.entry_date).toLocaleDateString() : 'Pending Arrival'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Release Date:</span>
                        <div className="font-semibold text-slate-200">{b.release_date ? new Date(b.release_date).toLocaleDateString() : 'Not Released'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Location:</span>
                        <div className="font-semibold text-slate-200 line-clamp-1">{b.warehouse?.location}</div>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-3xs text-amber-300/80 bg-amber-950/30 px-3 py-1 rounded-lg border border-amber-900/40 w-fit">
                        Note: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Status update buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {b.storage_status === 'RESERVED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'STORED')}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Stored in Bay
                      </button>
                    )}
                    {b.storage_status === 'STORED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'RELEASED_FOR_DISPATCH')}
                        className="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5"
                      >
                        <Truck className="w-4 h-4" /> Release for Dispatch
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )
        )}

        {/* ALLOCATE STORAGE MODAL */}
        {showAllocateModal && (
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl">
              <h3 className="text-lg font-bold text-slate-100 mb-1">Allocate Order Storage Space</h3>
              <p className="text-xs text-slate-400 mb-5">Assign a paid order to a warehouse facility slot.</p>

              {allocError && (
                <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{allocError}</span>
                </div>
              )}

              <form onSubmit={handleAllocateStorage} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paid Order ID</label>
                  <input
                    type="number"
                    required
                    value={allocOrderId}
                    onChange={(e) => setAllocOrderId(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Target Warehouse</label>
                  <select
                    required
                    value={allocWarehouseId}
                    onChange={(e) => setAllocWarehouseId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  >
                    <option value="">Select Warehouse Facility...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.available_capacity_tons} Tons Available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Bay / Inspection Notes</label>
                  <textarea
                    rows={2}
                    value={allocNotes}
                    onChange={(e) => setAllocNotes(e.target.value)}
                    placeholder="e.g. Assigned to Bay 3 Cold Storage"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={allocLoading}
                    className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50"
                  >
                    {allocLoading ? 'Allocating...' : 'Confirm Allocation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllocateModal(false)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default WarehouseManagementPage;
