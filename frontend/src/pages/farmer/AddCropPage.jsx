import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { createCrop } from '../../api/crops';
import { Sprout, AlertCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';

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
    <AppLayout
      title="List New Harvest Yield"
      subtitle="Register crop details to make your harvest available to buyers nationwide."
      breadcrumb="Farmer / Crops / Add"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/farmer/crops"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075B2A] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Crops
        </Link>

        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-10 shadow-card">
          <div className="flex items-center gap-3 pb-6 border-b border-[#EBF2ED] mb-6">
            <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#123524]">Crop Registration Form</h2>
              <p className="text-xs text-[#66756B]">Fill in harvest parameters for automated marketplace listing</p>
            </div>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3 mb-6">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Crop Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Basmati Rice, Alphonso Mango"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123524] mb-1.5">Description</label>
              <textarea
                rows={3}
                placeholder="Describe crop quality, organic status, storage condition, etc."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Available Quantity</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 500"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Measurement Unit</label>
                <select
                  value={formData.unit}
                  onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                >
                  {units.map((u) => (
                    <option key={u} value={u}>{u}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Expected Price (₹ / {formData.unit})</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  required
                  placeholder="e.g. 85.50"
                  value={formData.expected_price}
                  onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Quality Grade</label>
                <select
                  value={formData.quality}
                  onChange={(e) => setFormData({ ...formData, quality: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                >
                  {qualities.map((q) => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Harvest Date</label>
                <input
                  type="date"
                  required
                  value={formData.harvest_date}
                  onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Farm Location / Region</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Karnal, Haryana"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-sm rounded-xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Listing Crop...
                  </>
                ) : (
                  <>
                    <span>Publish Crop Yield on Marketplace</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AppLayout>
  );
}
