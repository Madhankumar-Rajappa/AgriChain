import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { createWarehouse } from '../../api/warehouses';
import { Warehouse, MapPin, HardDrive, ArrowLeft, AlertCircle, PlusCircle } from 'lucide-react';

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
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
      <Navbar />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-8">
        <Link 
          to="/warehouse/facilities" 
          className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-emerald-400 transition mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Storage Facilities
        </Link>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-slate-800">
            <div className="p-3 bg-emerald-600/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Warehouse className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-100">Register New Warehouse Storage Facility</h1>
              <p className="text-xs text-slate-400">Add a new agricultural storage hub to manage crop inventory & logistics</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                <Warehouse className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Facility Name
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Central Punjab Agro Cold Storage Hub"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Location / Region
              </label>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Ludhiana Sector 14, Punjab"
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center">
                <HardDrive className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Total Storage Capacity (in Metric Tons)
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
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none font-mono"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Registering...</span>
                ) : (
                  <>
                    <PlusCircle className="w-4 h-4" />
                    <span>Register Facility</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={() => navigate('/warehouse/facilities')}
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

export default AddWarehousePage;
