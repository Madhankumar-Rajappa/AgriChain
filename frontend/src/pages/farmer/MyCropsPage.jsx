import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchMyCrops, deactivateCrop } from '../../api/crops';
import { Sprout, Plus, Filter, Edit3, Trash2, MapPin, Calendar, AlertCircle, RefreshCw } from 'lucide-react';

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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]">AVAILABLE</span>;
      case 'RESERVED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">RESERVED</span>;
      case 'SOLD':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">SOLD</span>;
      case 'INACTIVE':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF]">INACTIVE</span>;
      default:
        return null;
    }
  };

  return (
    <AppLayout
      title="My Crop Listings"
      subtitle="Manage, update, and monitor your agricultural harvests on the marketplace."
      breadcrumb="Farmer / Crops"
    >
      <div className="space-y-6">
        {/* Header Actions & Filter Toolbar */}
        <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 sm:p-5 shadow-soft flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123524]">
              <Filter className="w-4 h-4 text-[#075B2A]" />
              <span>Status Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7FAF5] border border-[#DDE8DF] text-xs text-[#123524] rounded-xl px-3 py-2 focus:outline-none focus:border-[#075B2A]"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="RESERVED">Reserved</option>
              <option value="SOLD">Sold</option>
              <option value="INACTIVE">Inactive</option>
            </select>
            <span className="text-xs text-[#66756B]">
              Total Listed: <strong className="text-[#123524] font-bold">{total}</strong>
            </span>
          </div>

          <Link
            to="/farmer/crops/add"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-xs rounded-xl shadow-soft hover:shadow-card transition-all shrink-0"
          >
            <Plus className="w-4 h-4" /> Add New Crop Listing
          </Link>
        </div>

        {/* Content Area */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-2" />
            <p className="text-xs">Loading crop yields from database...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3 max-w-md mx-auto my-12">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : crops.length === 0 ? (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#075B2A]">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#123524] mb-1">No Crops Listed Yet</h3>
            <p className="text-xs text-[#66756B] mb-6 leading-relaxed">
              Start offering your harvest yields directly to registered buyers across the agricultural supply chain.
            </p>
            <Link
              to="/farmer/crops/add"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-semibold rounded-xl shadow-soft transition-all"
            >
              <Plus className="w-4 h-4" /> List Your First Harvest
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {crops.map((crop) => (
              <div
                key={crop.id}
                className="bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 shadow-soft hover:shadow-card group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-md bg-[#EAF5EC] text-[#075B2A] uppercase tracking-wider border border-[#DDE8DF]">
                        {crop.category}
                      </span>
                      <h3 className="text-lg font-bold text-[#123524] mt-1.5 group-hover:text-[#075B2A] transition-colors">
                        {crop.name}
                      </h3>
                    </div>
                    {getStatusBadge(crop.status)}
                  </div>

                  <p className="text-xs text-[#66756B] line-clamp-2 mb-4 leading-relaxed">
                    {crop.description || 'No additional description provided.'}
                  </p>

                  <div className="space-y-2 text-xs text-[#123524] bg-[#F7FAF5] p-3.5 rounded-xl border border-[#DDE8DF] mb-4">
                    <div className="flex justify-between">
                      <span className="text-[#66756B]">Available Quantity:</span>
                      <strong className="text-[#075B2A] font-bold">{crop.quantity} {crop.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66756B]">Expected Price:</span>
                      <strong className="text-[#123524] font-bold">₹{crop.expected_price} / {crop.unit}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#66756B]">Quality Rating:</span>
                      <span className="font-semibold text-teal-700">{crop.quality}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-[#66756B] pt-1 border-t border-[#EBF2ED] mb-4">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> {crop.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#66756B]" /> Harvest: {crop.harvest_date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#EBF2ED]">
                  <Link
                    to={`/farmer/crops/edit/${crop.id}`}
                    className="flex-1 py-2 px-3 bg-[#F7FAF5] hover:bg-[#EAF5EC] text-[#075B2A] text-xs font-semibold rounded-xl border border-[#DDE8DF] flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Edit3 className="w-3.5 h-3.5" /> Edit
                  </Link>

                  {crop.status !== 'INACTIVE' && (
                    <button
                      onClick={() => handleDeactivate(crop.id, crop.name)}
                      className="py-2 px-3 bg-[#F7FAF5] hover:bg-rose-50 text-[#66756B] hover:text-rose-700 text-xs font-semibold rounded-xl border border-[#DDE8DF] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
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
      </div>
    </AppLayout>
  );
}
