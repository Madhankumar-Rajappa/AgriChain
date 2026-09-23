import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchMyCrops, deactivateCrop } from '../../api/crops';
import { Sprout, Plus, Search, Filter, Edit3, Trash2, Tag, MapPin, Calendar, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';

export default function MyCropsPage() {
  const [crops, setCrops] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadCrops = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await fetchMyCrops(params);
      setCrops(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your crop listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrops();
  }, [statusFilter]);

  const handleDeactivate = async (cropId, cropName) => {
    if (!window.confirm(`Are you sure you want to deactivate "${cropName}"? It will no longer appear in buyer searches.`)) {
      return;
    }
    try {
      await deactivateCrop(cropId);
      loadCrops();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to deactivate crop');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'AVAILABLE':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">AVAILABLE</span>;
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-950 text-amber-400 border border-amber-800">RESERVED</span>;
      case 'SOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-950 text-blue-400 border border-blue-800">SOLD</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">INACTIVE</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <Sprout className="w-6 h-6 text-emerald-400" /> My Crop Listings
            </h1>
            <p className="text-xs text-slate-400">Manage, update, and monitor your agricultural harvests</p>
          </div>

          <Link
            to="/farmer/crops/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" /> Add New Crop Listing
          </Link>
        </div>

        {/* Filters */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Total Crops: <strong className="text-slate-200">{total}</strong>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading crop yields...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-3 max-w-md mx-auto my-12">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <Sprout className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">No Crops Listed Yet</h3>
            <p className="text-xs text-slate-400 mb-6">Start offering your harvest yields directly to registered buyers across the supply chain.</p>
            <Link
              to="/farmer/crops/add"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md"
            >
              <Plus className="w-4 h-4" /> Add Your First Crop
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-lg"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-3xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-emerald-400 uppercase tracking-wider">
                        {crop.category}
                      </span>
                      <h3 className="text-lg font-bold text-slate-100 mt-1">{crop.name}</h3>
                    </div>
                    {getStatusBadge(crop.status)}
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 mb-4">
                    {crop.description || 'No additional description provided.'}
                  </p>

                  <div className="space-y-2 text-xs text-slate-300 bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 mb-4">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Available Quantity:</span>
                      <strong className="text-emerald-400">{crop.quantity} {crop.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Expected Price:</span>
                      <strong className="text-slate-100">₹{crop.expected_price} / {crop.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Quality Rating:</span>
                      <span className="font-semibold text-teal-300">{crop.quality}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-3xs text-slate-400 pt-1 border-t border-slate-800/60 mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-500" /> {crop.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-500" /> Harvest: {crop.harvest_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
                  <Link
                    to={`/farmer/crops/edit/${crop.id}`}
                    className="flex-1 py-1.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-emerald-400" /> Edit
                  </Link>

                  {crop.status !== 'INACTIVE' && (
                    <button
                      onClick={() => handleDeactivate(crop.id, crop.name)}
                      className="py-1.5 px-3 bg-slate-800 hover:bg-rose-950/70 hover:text-rose-400 text-slate-400 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                      title="Deactivate Crop"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
