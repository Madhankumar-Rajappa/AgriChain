import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { createCrop } from '../../api/crops';
import { Sprout, AlertCircle, ArrowRight, ArrowLeft } from 'lucide-react';

export default function AddCropPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    category: 'GRAINS',
    description: '',
    quantity: '',
    unit: 'kg',
    expected_price: '',
    quality: 'GRADE_A',
    harvest_date: new Date().toISOString().split('T')[0],
    location: '',
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const categories = ['GRAINS', 'VEGETABLES', 'FRUITS', 'PULSES', 'SPICES', 'OTHER'];
  const qualities = ['GRADE_A', 'GRADE_B', 'PREMIUM', 'STANDARD'];
  const units = ['kg', 'ton', 'quintal', 'bag', 'box'];

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
      await createCrop({
        ...formData,
        quantity: qty,
        expected_price: price,
      });
      navigate('/farmer/crops');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to register crop. Please check inputs.');
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
            <Sprout className="w-6 h-6 text-emerald-400" /> List New Harvest Yield
          </h1>
          <p className="text-xs text-slate-400">Register crop details to make your harvest available to buyers nationwide</p>
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          {error && (
            <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Alphonso Mango"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

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
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
              <textarea
                rows={3}
                placeholder="Describe crop quality, organic status, storage condition, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Available Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Measurement Unit</label>
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
                  placeholder="e.g. 85.50"
                  value={formData.expected_price}
                  onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location / District</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Punjab, India"
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
                {submitting ? 'Registering...' : 'Publish Crop Listing'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
