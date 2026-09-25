import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { createWarehouse } from '../../api/warehouses';
import { Warehouse, MapPin, HardDrive, ArrowLeft, AlertCircle, PlusCircle, Loader2 } from 'lucide-react';

const AddWarehousePage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    total_capacity_tons: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        name: formData.name.trim(),
        location: formData.location.trim(),
        total_capacity_tons: parseFloat(formData.total_capacity_tons)
      };

      await createWarehouse(payload);
      navigate('/warehouse/facilities');
    } catch (err) {
      console.error('Failed to create warehouse:', err);
      setError(err.response?.data?.detail || 'Failed to create warehouse facility. Check inputs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AppLayout
      title="Register Storage Facility"
      subtitle="Expand cold storage and grain inventory capacity across agricultural supply corridors"
      breadcrumb="Warehouse Management / New Facility"
    >
      <div className="max-w-2xl mx-auto space-y-6">
        <Link 
          to="/warehouse/facilities" 
          className="inline-flex items-center text-xs font-bold text-[#66756B] hover:text-[#075B2A] transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Storage Facilities
        </Link>

        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 sm:p-9 shadow-soft">
          <div className="flex items-center space-x-3.5 mb-6 pb-5 border-b border-[#DDE8DF]">
            <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl border border-[#DDE8DF]">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[#123524]">Facility Specifications</h1>
              <p className="text-xs text-[#66756B]">Register storage parameters and available tonnage</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
              <span className="font-medium">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                <Warehouse className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Facility Hub Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Central Punjab Cold Storage Hub"
                className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Location / Agricultural District
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Ludhiana Mandi Road, Punjab"
                className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#123524] mb-2 flex items-center">
                <HardDrive className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Total Storage Capacity (Metric Tons)
              </label>
              <input
                type="number"
                name="total_capacity_tons"
                step="0.1"
                min="0.1"
                required
                value={formData.total_capacity_tons}
                onChange={handleChange}
                placeholder="e.g. 500.0"
                className="w-full px-4 py-3 bg-[#F7FAF5] border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none font-mono"
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
                    <span>Registering Facility...</span>
                  </>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Register Storage Facility</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/warehouse/facilities')}
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

export default AddWarehousePage;
