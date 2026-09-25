import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import AppLayout from '../../components/AppLayout';
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

  useEffect(() => {
    const loadDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchCropDetails(id);
        setCrop(data);
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

  const Content = (
    <div className="space-y-6">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#075B2A] hover:underline"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Crop Marketplace
      </Link>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center text-[#66756B]">
          <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-3" />
          <p className="text-xs">Loading crop specifications...</p>
        </div>
      ) : error || !crop ? (
        <div className="p-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-3xl text-xs max-w-md mx-auto my-12 text-center shadow-soft">
          <p className="mb-4">{error || 'Crop yield not found.'}</p>
          <Link to="/marketplace" className="px-4 py-2 bg-[#075B2A] text-white rounded-xl font-semibold">
            Return to Marketplace
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Main Details Column */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 shadow-card space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] uppercase tracking-wider">
                    {crop.category}
                  </span>
                  <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF]">
                    {crop.quality}
                  </span>
                </div>

                <span className="px-3 py-1 rounded-full text-[10px] font-semibold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#075B2A]" />
                  <span>Verified Harvest</span>
                </span>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123524] mb-2">{crop.name}</h1>
                <p className="text-xs sm:text-sm text-[#66756B] leading-relaxed">
                  {crop.description || 'Verified farm harvest registered under platform agricultural supply chain standard.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-4 border-t border-[#EBF2ED]">
                <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                  <div className="text-[10px] uppercase font-bold text-[#66756B] mb-1">Available Stock</div>
                  <div className="text-base font-bold text-[#123524]">{crop.quantity} {crop.unit}</div>
                </div>
                <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                  <div className="text-[10px] uppercase font-bold text-[#66756B] mb-1">Harvest Date</div>
                  <div className="text-xs font-semibold text-[#123524] flex items-center gap-1 mt-1">
                    <Calendar className="w-3.5 h-3.5 text-[#075B2A]" /> {crop.harvest_date}
                  </div>
                </div>
                <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF] col-span-2 sm:col-span-1">
                  <div className="text-[10px] uppercase font-bold text-[#66756B] mb-1">Farm Location</div>
                  <div className="text-xs font-semibold text-[#123524] flex items-center gap-1 mt-1">
                    <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> {crop.location}
                  </div>
                </div>
              </div>

              {/* Farmer Profile Card */}
              <div className="bg-[#F7FAF5] border border-[#DDE8DF] rounded-2xl p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white text-[#075B2A] rounded-xl border border-[#DDE8DF]">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-[11px] text-[#66756B]">Cultivated & Listed by Farmer</div>
                    <div className="text-sm font-bold text-[#123524]">{crop.farmer?.full_name || 'Verified Farmer'}</div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-white text-[#075B2A] border border-[#DDE8DF] flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#075B2A]" /> Verified Producer
                </span>
              </div>
            </div>
          </div>

          {/* Right Purchase Action Column */}
          <div className="space-y-6">
            <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-card space-y-6 sticky top-24">
              <div>
                <div className="text-xs text-[#66756B] mb-1 font-semibold">Expected Wholesale Price</div>
                <div className="text-3xl font-extrabold text-[#075B2A]">
                  ₹{crop.expected_price} <span className="text-xs font-normal text-[#66756B]">/ {crop.unit}</span>
                </div>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF] space-y-2 text-xs">
                <div className="flex justify-between text-[#66756B]">
                  <span>Remaining Yield:</span>
                  <span className="font-bold text-[#123524]">{crop.quantity} {crop.unit}</span>
                </div>
                <div className="flex justify-between text-[#66756B]">
                  <span>Escrow Protection:</span>
                  <span className="font-bold text-[#075B2A]">100% Guaranteed</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrderClick}
                className="w-full py-3.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-sm rounded-xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Proceed to Order Harvest</span>
              </button>

              <div className="text-[11px] text-[#66756B] text-center flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 text-[#075B2A]" />
                <span>Escrow payment held until delivery confirmation</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  if (user) {
    return (
      <AppLayout
        title="Crop Specifications"
        subtitle="Detailed harvest metadata and verified farm procurement parameters."
        breadcrumb="Marketplace / Crop Details"
      >
        {Content}
      </AppLayout>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7FAF5] text-[#123524] flex flex-col font-sans">
      <Navbar />
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {Content}
      </main>
      <Footer />
    </div>
  );
}
