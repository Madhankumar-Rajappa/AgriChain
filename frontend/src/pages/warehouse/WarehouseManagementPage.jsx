import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
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
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  Truck, 
  Box, 
  Loader2,
  HardDrive,
  UserCheck
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
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> RESERVED
          </span>
        );
      case 'STORED':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#075B2A]" /> STORED IN BAY
          </span>
        );
      case 'RELEASED_FOR_DISPATCH':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-800 border border-blue-200 flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-blue-600" /> RELEASED FOR DISPATCH
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
      title="Warehouse & Cold Storage Hubs"
      subtitle="Monitor cold chain capacity, preserve post-harvest quality, and manage grain allocations"
      breadcrumb="Warehouse Management"
    >
      <div className="space-y-6">
        {/* Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {/* Tab Navigation */}
          <div className="flex items-center gap-2 border-b border-[#DDE8DF] pb-1">
            <button
              onClick={() => setActiveTab('facilities')}
              className={`pb-2.5 px-4 font-bold text-sm transition border-b-2 ${
                activeTab === 'facilities'
                  ? 'border-[#075B2A] text-[#075B2A]'
                  : 'border-transparent text-[#66756B] hover:text-[#123524]'
              }`}
            >
              Storage Facilities ({warehouses.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`pb-2.5 px-4 font-bold text-sm transition border-b-2 ${
                activeTab === 'bookings'
                  ? 'border-[#075B2A] text-[#075B2A]'
                  : 'border-transparent text-[#66756B] hover:text-[#123524]'
              }`}
            >
              Storage Allocations ({bookings.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAllocateModal(true)}
              className="px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-xs rounded-xl shadow-soft flex items-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Box className="w-4 h-4" /> Allocate Storage Space
            </button>
            <Link
              to="/warehouse/add"
              className="px-4 py-2.5 bg-white border border-[#DDE8DF] hover:bg-[#F7FAF5] text-[#123524] font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Plus className="w-4 h-4 text-[#075B2A]" /> Add Facility
            </Link>
          </div>
        </div>

        {/* Content View */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <Loader2 className="w-8 h-8 animate-spin text-[#075B2A] mb-3" />
            <p className="text-sm font-semibold">Loading warehouse telemetry...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-sm max-w-md mx-auto my-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            <span>{error}</span>
          </div>
        ) : activeTab === 'facilities' ? (
          /* Facilities Tab */
          warehouses.length === 0 ? (
            <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-soft">
              <Warehouse className="w-12 h-12 text-[#66756B] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#123524] mb-1">No Storage Facilities Registered</h3>
              <p className="text-xs text-[#66756B] mb-6">Create your first cold storage hub to start receiving crop inventory.</p>
              <Link
                to="/warehouse/add"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft"
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
                    className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-soft hover:shadow-card transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl border border-[#DDE8DF]">
                          <Warehouse className="w-5 h-5" />
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${
                          wh.is_active 
                            ? 'bg-[#EAF5EC] text-[#075B2A] border-[#DDE8DF]' 
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {wh.is_active ? 'ACTIVE HUB' : 'INACTIVE'}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-[#123524] mb-1">{wh.name}</h3>
                      <p className="text-xs text-[#66756B] flex items-center gap-1.5 mb-5">
                        <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> {wh.location}
                      </p>

                      {/* Capacity Meter */}
                      <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF] mb-4 space-y-2">
                        <div className="flex justify-between text-xs font-bold">
                          <span className="text-[#66756B]">Occupied Space</span>
                          <span className="text-[#075B2A]">{percentUsed}%</span>
                        </div>
                        <div className="w-full bg-[#E5ECE7] rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-[#075B2A] h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${percentUsed}%` }}
                          ></div>
                        </div>
                        <div className="flex justify-between text-[11px] text-[#66756B] pt-1">
                          <span>Available: <strong className="text-[#123524]">{wh.available_capacity_tons} Tons</strong></span>
                          <span>Total: {wh.total_capacity_tons} Tons</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-[#66756B] pt-3 border-t border-[#DDE8DF] flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#075B2A]" /> Manager:
                      </span>
                      <span className="font-semibold text-[#123524]">
                        {wh.manager?.full_name || 'AgriChain Admin'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )
        ) : (
          /* Bookings Tab */
          bookings.length === 0 ? (
            <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-soft">
              <Box className="w-12 h-12 text-[#66756B] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#123524] mb-1">No Active Storage Allocations</h3>
              <p className="text-xs text-[#66756B] mb-6">Allocate paid crop orders to registered warehouse facility bays.</p>
              <button
                onClick={() => setShowAllocateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft"
              >
                Allocate Storage Space
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white border border-[#DDE8DF] rounded-2xl p-5 shadow-soft hover:shadow-card transition flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-[#66756B]">Slot #{b.id}</span>
                      <span className="text-xs font-bold text-[#075B2A] bg-[#EAF5EC] px-2.5 py-0.5 rounded-full border border-[#DDE8DF]">
                        Order #{b.order_id}
                      </span>
                      {getStorageBadge(b.storage_status)}
                    </div>

                    <h3 className="text-base font-bold text-[#123524]">
                      {b.warehouse?.name || `Warehouse #${b.warehouse_id}`}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F7FAF5] p-3.5 rounded-xl border border-[#DDE8DF] max-w-2xl">
                      <div>
                        <span className="text-[#66756B] text-[11px] block">Tonnage Reserved:</span>
                        <div className="font-extrabold text-[#075B2A] text-sm">{b.quantity_stored} Tons</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[11px] block">Entry Timestamp:</span>
                        <div className="font-semibold text-[#123524]">{b.entry_date ? new Date(b.entry_date).toLocaleDateString() : 'Awaiting Arrival'}</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[11px] block">Release Timestamp:</span>
                        <div className="font-semibold text-[#123524]">{b.release_date ? new Date(b.release_date).toLocaleDateString() : 'In Storage'}</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[11px] block">Facility Region:</span>
                        <div className="font-semibold text-[#123524] line-clamp-1">{b.warehouse?.location}</div>
                      </div>
                    </div>

                    {b.notes && (
                      <p className="text-xs text-amber-800 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200 w-fit">
                        Note: {b.notes}
                      </p>
                    )}
                  </div>

                  {/* Status update buttons */}
                  <div className="flex flex-wrap items-center gap-2 shrink-0">
                    {b.storage_status === 'RESERVED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'STORED')}
                        className="px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" /> Mark Stored in Bay
                      </button>
                    )}
                    {b.storage_status === 'STORED' && (
                      <button
                        onClick={() => handleUpdateStatus(b.id, 'RELEASED_FOR_DISPATCH')}
                        className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition shadow-soft flex items-center gap-1.5"
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
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
            <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 max-w-md w-full shadow-2xl animate-in zoom-in-95 duration-150">
              <h3 className="text-lg font-bold text-[#123524] mb-1">Allocate Order Storage Space</h3>
              <p className="text-xs text-[#66756B] mb-5">Assign a paid order to a cold storage facility slot.</p>

              {allocError && (
                <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                  <span>{allocError}</span>
                </div>
              )}

              <form onSubmit={handleAllocateStorage} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#123524] mb-1.5">Paid Order ID</label>
                  <input
                    type="number"
                    required
                    value={allocOrderId}
                    onChange={(e) => setAllocOrderId(e.target.value)}
                    placeholder="e.g. 1"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-xs text-[#123524] outline-none focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123524] mb-1.5">Target Warehouse Facility</label>
                  <select
                    required
                    value={allocWarehouseId}
                    onChange={(e) => setAllocWarehouseId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-xs text-[#123524] outline-none focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A]"
                  >
                    <option value="">Select Storage Hub...</option>
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name} ({w.available_capacity_tons} Tons Available)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#123524] mb-1.5">Bay Assignment & Storage Notes</label>
                  <textarea
                    rows={2}
                    value={allocNotes}
                    onChange={(e) => setAllocNotes(e.target.value)}
                    placeholder="e.g. Assigned to Cold Bay 3 (Stored at 4°C)"
                    className="w-full px-3.5 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-xs text-[#123524] outline-none focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A]"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="submit"
                    disabled={allocLoading}
                    className="flex-1 py-3 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-xs rounded-xl shadow-soft disabled:opacity-50 transition"
                  >
                    {allocLoading ? 'Allocating Space...' : 'Confirm Allocation'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAllocateModal(false)}
                    className="px-5 py-3 bg-[#F7FAF5] hover:bg-[#EAF5EC] text-[#123524] border border-[#DDE8DF] text-xs font-bold rounded-xl transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default WarehouseManagementPage;
