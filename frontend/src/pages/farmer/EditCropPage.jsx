import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchCropDetails, updateCrop } from '../../api/crops';
import { Edit3, AlertCircle, ArrowLeft, RefreshCw, Save } from 'lucide-react';

export default function EditCropPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'GRAINS',
    description: '',
    quantity: '',
    unit: 'kg',
    expected_price: '',
    quality: 'GRADE_A',
    harvest_date: '',
    location: '',
    status: 'AVAILABLE',
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['GRAINS', 'VEGETABLES', 'FRUITS', 'PULSES', 'SPICES', 'OTHER'];
  const qualities = ['GRADE_A', 'GRADE_B', 'PREMIUM', 'STANDARD'];
  const statuses = ['AVAILABLE', 'RESERVED', 'SOLD', 'INACTIVE'];
  const units = ['kg', 'ton', 'quintal', 'bag', 'box'];

  useEffect(() => {
    const loadCrop = async () => {
      setLoading(true);
      setError('');
      try {
        const crop = await fetchCropDetails(id);
        setFormData({
          name: crop.name,
          category: crop.category,
          description: crop.description || '',
          quantity: crop.quantity,
          unit: crop.unit,
          expected_price: crop.expected_price,
          quality: crop.quality,
          harvest_date: crop.harvest_date,
          location: crop.location,
          status: crop.status,
        });
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load crop details');
      } finally {
        setLoading(false);
      }
    };
    loadCrop();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const qty = parseFloat(formData.quantity);
    const price = parseFloat(formData.expected_price);

    if (isNaN(qty) || qty <= 0) {
      setError('Quantity must be greater than 0');
      return;
    }
    if (isNaN(price) || price <= 0) {
      setError('Expected price must be greater than 0');
      return;
    }

    setSubmitting(true);
    try {
      await updateCrop(id, {
        ...formData,
        quantity: qty,
        expected_price: price,
      });
      navigate('/farmer/crops');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update crop listing');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <Link
            to="/farmer/crops"
            className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Crops
          </Link>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Edit3 className="w-6 h-6 text-emerald-400" /> Edit Crop Listing #{id}
          </h1>
          <p className="text-xs text-slate-400">Update price, quantity, description, or status</p>
        </div>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Fetching crop data...</p>
          </div>
        ) : (
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
            {error && (
              <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quality Grade</label>
                  <select
                    value={formData.quality}
                    onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {qualities.map((q) => (
                      <option key={q} value={q}>{q}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  >
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Price (₹ / {formData.unit})</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={formData.expected_price}
                    onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    required
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3">
                <Link
                  to="/farmer/crops"
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  {submitting ? 'Saving Changes...' : 'Save Crop Updates'}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
