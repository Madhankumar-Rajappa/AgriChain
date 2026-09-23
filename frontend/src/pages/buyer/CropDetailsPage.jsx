import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchCropDetails } from '../../api/crops';
import { useAuth } from '../../context/AuthContext';
import { Sprout, MapPin, Calendar, CheckCircle2, User, ArrowLeft, RefreshCw, ShoppingBag, ShieldCheck, Info } from 'lucide-react';

export default function CropDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [crop, setCrop] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(10);

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCropDetails(id);
        setCrop(data);
        if (data.quantity > 0) {
          setOrderQuantity(Math.min(10, data.quantity));
        }
      } catch (err) {
        setError(err.response?.data?.detail || 'Failed to load crop details');
      } finally {
        setLoading(false);
      }
    };
    loadDetails();
  }, [id]);

  const handlePlaceOrderClick = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/orders/place/${id}` } } });
      return;
    }
    navigate(`/orders/place/${id}`);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="mb-6">
          <Link
            to="/marketplace"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-emerald-400 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Marketplace
          </Link>
        </div>

        {loading ? (
          <div className="py-24 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-3" />
            <p className="text-xs">Loading crop specifications...</p>
          </div>
        ) : error || !crop ? (
          <div className="p-6 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-3xl text-xs max-w-md mx-auto my-12 text-center">
            <p className="mb-4">{error || 'Crop yield not found.'}</p>
            <Link to="/marketplace" className="px-4 py-2 bg-rose-900 text-rose-100 rounded-xl">
              Return to Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Main Details Column */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl shadow-2xl space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-3xs font-extrabold bg-emerald-950 text-emerald-400 border border-emerald-800 uppercase tracking-wider">
                      {crop.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-3xs font-extrabold bg-teal-950 text-teal-300 border border-teal-800">
                      {crop.quality}
                    </span>
                  </div>

                  <span className="px-3 py-1 rounded-full text-3xs font-semibold bg-emerald-950/60 text-emerald-300 border border-emerald-800/80 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Verified Available
                  </span>
                </div>

                <div>
                  <h1 className="text-3xl font-extrabold text-slate-100 mb-2">{crop.name}</h1>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {crop.description || 'No specific description provided by farmer. Quality guaranteed under platform agricultural supply chain standard.'}
                  </p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                    <div className="text-3xs text-slate-400 mb-0.5">Available Stock</div>
                    <div className="text-base font-bold text-slate-100">{crop.quantity} {crop.unit}</div>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80">
                    <div className="text-3xs text-slate-400 mb-0.5">Harvest Date</div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> {crop.harvest_date}
                    </div>
                  </div>
                  <div className="bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800/80 col-span-2 sm:col-span-1">
                    <div className="text-3xs text-slate-400 mb-0.5">Farm Location</div>
                    <div className="text-sm font-semibold text-slate-200 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" /> {crop.location}
                    </div>
                  </div>
                </div>

                {/* Farmer Profile Card */}
                <div className="bg-slate-950/90 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="text-xs text-slate-400">Produced by Farmer</div>
                      <div className="text-sm font-bold text-slate-100">{crop.farmer?.full_name || 'Verified Farmer'}</div>
                    </div>
                  </div>
                  <span className="text-3xs font-semibold px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> KYC Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Right Purchase Action Column */}
            <div className="space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6 sticky top-24">
                <div>
                  <div className="text-xs text-slate-400 mb-1">Expected Price per {crop.unit}</div>
                  <div className="text-3xl font-extrabold text-emerald-400">
                    ₹{crop.expected_price} <span className="text-xs font-normal text-slate-400">/ {crop.unit}</span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-400">
                    <span>Stock Remaining:</span>
                    <span className="text-slate-200">{crop.quantity} {crop.unit}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Logistics & Handling:</span>
                    <span className="text-emerald-400">Calculated at Checkout</span>
                  </div>
                </div>

                <button
                  onClick={handlePlaceOrderClick}
                  className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4" />
                  Proceed to Checkout Order
                </button>

                <div className="text-3xs text-slate-400 text-center flex items-center justify-center gap-1">
                  <Info className="w-3 h-3 text-slate-500" />
                  <span>Transactional safety guaranteed under AgriChain supply chain terms</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
