import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchCropDetails, updateCrop } from '../../api/crops';
import { Edit3, AlertCircle, ArrowLeft, RefreshCw, Save, Loader2 } from 'lucide-react';

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
    <AppLayout
      title={`Edit Crop Listing #${id}`}
      subtitle="Update price, quantity, quality rating, or status."
      breadcrumb="Farmer / Crops / Edit"
    >
      <div className="max-w-3xl mx-auto space-y-6">
        <Link
          to="/farmer/crops"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075B2A] hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to My Crops
        </Link>

        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-2" />
            <p className="text-xs">Fetching crop data...</p>
          </div>
        ) : (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-10 shadow-card">
            <div className="flex items-center gap-3 pb-6 border-b border-[#EBF2ED] mb-6">
              <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl">
                <Edit3 className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#123524]">Edit Harvest Details</h2>
                <p className="text-xs text-[#66756B]">Modify crop parameters and marketplace availability</p>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3 mb-6">
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-[#123524] mb-1.5">Crop Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#123524] mb-1.5">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                  >
                    {statuses.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#123524] mb-1.5">Description</label>
                <textarea
                  rows={3}
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
                    value={formData.expected_price}
                    onChange={(e) => setFormData({ ...formData, expected_price: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:outline-none focus:border-[#075B2A] transition-all"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#EBF2ED]">
                <Link
                  to="/farmer/crops"
                  className="px-5 py-2.5 bg-white hover:bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF] text-xs font-semibold rounded-xl transition-colors"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-xs rounded-xl shadow-soft hover:shadow-card transition-all flex items-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" /> Save Crop Updates
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
