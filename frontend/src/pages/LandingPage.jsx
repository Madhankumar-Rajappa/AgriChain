import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { fetchAvailableCrops } from '../api/crops';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  ArrowRight, 
  Store, 
  Search, 
  Zap, 
  MapPin, 
  Loader2,
  Leaf
} from 'lucide-react';

export default function LandingPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [loadingCrops, setLoadingCrops] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loggingInRole, setLoggingInRole] = useState(null);
  const [demoError, setDemoError] = useState('');

  // Pre-configured Demo Accounts
  const demoAccounts = [
    { role: 'FARMER', label: 'Farmer', name: 'Ramesh Patel', email: 'farmer@agrichain.com', pass: 'Farmer123!', icon: Sprout },
    { role: 'BUYER', label: 'Buyer', name: 'Anita Sharma', email: 'buyer@agrichain.com', pass: 'Buyer123!', icon: ShoppingBag },
    { role: 'TRANSPORTER', label: 'Transporter', name: 'Express Agri', email: 'transporter@agrichain.com', pass: 'Transporter123!', icon: Truck },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', name: 'Kisan Storage', email: 'warehouse@agrichain.com', pass: 'Warehouse123!', icon: Warehouse },
    { role: 'ADMIN', label: 'Admin', name: 'System Admin', email: 'admin@agrichain.com', pass: 'Admin123!', icon: ShieldCheck }
  ];

  // Load public crops for live preview
  useEffect(() => {
    const loadCrops = async () => {
      setLoadingCrops(true);
      try {
        const data = await fetchAvailableCrops({
          page: 1,
          page_size: 6,
          category: selectedCategory || undefined,
          search: searchTerm || undefined
        });
        setCrops(data.items || []);
      } catch (err) {
        console.error("Failed to fetch public crops:", err);
      } finally {
        setLoadingCrops(false);
      }
    };
    loadCrops();
  }, [selectedCategory, searchTerm]);

  // Handle 1-Click Demo Login
  const handleQuickDemoLogin = async (account) => {
    setLoggingInRole(account.role);
    setDemoError('');
    try {
      await login({ email: account.email, password: account.pass });
      navigate('/dashboard');
    } catch (err) {
      console.error("Demo login error:", err);
      setDemoError(`Failed to log in as ${account.label}. Ensure database is seeded.`);
    } finally {
      setLoggingInRole(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF5] text-[#123524] flex flex-col font-sans">
      <Navbar />

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-16 space-y-12">
        <div className="text-center space-y-5 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EAF5EC] border border-[#DDE8DF] text-[#075B2A] text-xs font-semibold shadow-2xs">
            <Leaf className="w-3.5 h-3.5 text-[#5FAF45]" />
            <span>Modern Farmer-First Agricultural Platform</span>
          </div>

          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#123524] leading-tight">
            Unified Agricultural <br />
            <span className="text-[#075B2A]">
              Supply Chain Ecosystem
            </span>
          </h2>

          <p className="text-sm sm:text-base lg:text-lg text-[#66756B] font-normal leading-relaxed max-w-2xl mx-auto">
            Connecting Farmers, Buyers, Transporters, Warehouse Managers, and Admins into a transparent marketplace and real-time logistics pipeline.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-7 py-3.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-sm rounded-2xl shadow-soft hover:shadow-card flex items-center justify-center gap-2 transition-all hover:scale-[1.02]"
            >
              <Store className="w-4 h-4" />
              <span>Explore Crop Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            {!user && (
              <Link
                to="/register"
                className="w-full sm:w-auto px-7 py-3.5 bg-white hover:bg-[#F5F8F3] border border-[#DDE8DF] text-[#123524] font-bold text-sm rounded-2xl shadow-2xs flex items-center justify-center gap-2 transition-all"
              >
                <span>Create New Account</span>
              </Link>
            )}
          </div>
        </div>

        {/* 1-CLICK DEMO LOGIN BANNER */}
        {!user && (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 shadow-card">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EBF2ED]">
              <div>
                <div className="inline-flex items-center gap-2 text-[#075B2A] font-bold text-sm">
                  <Zap className="w-4 h-4 text-amber-500" />
                  <span>Instant 1-Click Interactive Demo Login</span>
                </div>
                <p className="text-xs text-[#66756B] mt-1">
                  Click any role button below to instantly log in as a pre-seeded account and explore their dashboard!
                </p>
              </div>
              <div className="text-xs text-[#66756B] bg-[#F7FAF5] px-3.5 py-1.5 rounded-xl border border-[#DDE8DF]">
                Default Password: <code className="text-[#075B2A] font-semibold font-mono">RoleName123!</code>
              </div>
            </div>

            {demoError && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <span>⚠️ {demoError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
              {demoAccounts.map((acc) => {
                const IconComponent = acc.icon;
                const isLoggingIn = loggingInRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={isLoggingIn || loggingInRole !== null}
                    className="flex flex-col items-center text-center p-4 rounded-2xl bg-[#F7FAF5] hover:bg-[#EAF5EC] border border-[#DDE8DF] hover:border-[#075B2A] transition-all group disabled:opacity-50 cursor-pointer shadow-2xs"
                  >
                    <div className="p-3 rounded-xl bg-white text-[#075B2A] border border-[#DDE8DF] group-hover:scale-110 transition-transform mb-2.5 shadow-xs">
                      {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <IconComponent className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold text-[#123524] group-hover:text-[#075B2A] transition-colors">
                      {acc.label}
                    </span>
                    <span className="text-[11px] text-[#66756B] truncate max-w-[120px] mt-0.5">
                      {acc.name}
                    </span>
                    <span className="text-[10px] font-semibold text-[#075B2A] mt-2.5 bg-white px-2 py-0.5 rounded-full border border-[#DDE8DF] group-hover:border-[#075B2A]">
                      Login as {acc.role.split('_')[0]} &rarr;
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* LIVE MARKETPLACE DEMO / SEARCH SECTION */}
        <section className="space-y-6 pt-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-[#123524] flex items-center gap-2">
                <Store className="w-6 h-6 text-[#075B2A]" />
                <span>Live Crop Marketplace Feed</span>
              </h3>
              <p className="text-xs text-[#66756B] mt-1">
                Real harvest listings available from registered farmers across the country
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2">
              {[
                { label: 'All Categories', value: '' },
                { label: 'Grains', value: 'GRAINS' },
                { label: 'Fruits', value: 'FRUITS' },
                { label: 'Vegetables', value: 'VEGETABLES' },
                { label: 'Spices', value: 'SPICES' }
              ].map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all border cursor-pointer ${
                    selectedCategory === cat.value
                      ? 'bg-[#075B2A] text-white border-[#075B2A] shadow-soft'
                      : 'bg-white text-[#66756B] border-[#DDE8DF] hover:text-[#123524] hover:bg-[#F5F8F3]'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#66756B]" />
            <input
              type="text"
              placeholder="Search crops by name (e.g. Wheat, Alphonso Mangoes, Basmati Rice)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-white border border-[#DDE8DF] rounded-xl text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all shadow-xs"
            />
          </div>

          {/* Crop Cards Feed */}
          {loadingCrops ? (
            <div className="py-12 text-center text-[#66756B] text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-[#075B2A]" />
              <span>Loading live crops from database...</span>
            </div>
          ) : crops.length === 0 ? (
            <div className="py-12 text-center bg-white border border-[#DDE8DF] rounded-3xl p-6">
              <p className="text-sm font-semibold text-[#123524]">No crops found matching filters.</p>
              <p className="text-xs text-[#66756B] mt-1">Try clearing your search query or category selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-6 rounded-2xl bg-white border border-[#DDE8DF] hover:border-[#075B2A] hover:shadow-card transition-all duration-200 flex flex-col justify-between group shadow-soft"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]">
                        {crop.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF]">
                        {crop.quality}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[#123524] group-hover:text-[#075B2A] transition-colors">
                        {crop.name}
                      </h4>
                      <p className="text-xs text-[#66756B] line-clamp-2 mt-1 leading-relaxed">
                        {crop.description || 'Fresh harvested produce ready for direct procurement.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-[#66756B] pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> {crop.location}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-[#EBF2ED] flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-[#66756B] font-semibold">Expected Price</div>
                      <div className="text-lg font-extrabold text-[#075B2A]">
                        ₹{crop.expected_price} <span className="text-xs font-normal text-[#66756B]">/ {crop.unit}</span>
                      </div>
                    </div>

                    <Link
                      to={`/crops/${crop.id}`}
                      className="px-4 py-2 text-xs font-bold bg-[#075B2A] hover:bg-[#064D25] text-white rounded-xl shadow-2xs transition-all flex items-center gap-1"
                    >
                      View Details &rarr;
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="text-center pt-2">
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-[#123524] hover:text-[#075B2A] bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-xl shadow-2xs transition-all"
            >
              <span>Browse Full Marketplace & Order Crops</span>
              <ArrowRight className="w-4 h-4 text-[#075B2A]" />
            </Link>
          </div>
        </section>

        {/* Core Ecosystem Role Portals */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-[#123524]">Role-Based Supply Chain Capabilities</h3>
            <p className="text-xs text-[#66756B] mt-1">
              Select your role to access specialized portals tailored for each agricultural participant
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-6 rounded-2xl bg-white border border-[#DDE8DF] hover:border-[#075B2A] transition-all group flex flex-col justify-between shadow-soft hover:shadow-card">
              <div>
                <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#123524] mb-1 group-hover:text-[#075B2A] transition-colors">Farmers</h4>
                <p className="text-xs text-[#66756B] leading-relaxed">Register crop yields, set price expectations, inspect incoming orders, and manage sales.</p>
              </div>
              <div className="pt-4 border-t border-[#EBF2ED] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-[#075B2A]">Yield Management</span>
                <Link to="/register" className="text-xs font-bold text-[#075B2A] hover:underline">
                  Join as Farmer &rarr;
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#DDE8DF] hover:border-teal-600 transition-all group flex flex-col justify-between shadow-soft hover:shadow-card">
              <div>
                <div className="p-3 bg-teal-50 text-teal-700 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#123524] mb-1 group-hover:text-teal-700 transition-colors">Buyers</h4>
                <p className="text-xs text-[#66756B] leading-relaxed">Browse verified crops, filter by quality & location, place direct wholesale orders, and pay online.</p>
              </div>
              <div className="pt-4 border-t border-[#EBF2ED] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-teal-700">Direct Procurement</span>
                <Link to="/marketplace" className="text-xs font-bold text-teal-700 hover:underline">
                  Explore Market &rarr;
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#DDE8DF] hover:border-indigo-600 transition-all group flex flex-col justify-between shadow-soft hover:shadow-card">
              <div>
                <div className="p-3 bg-indigo-50 text-indigo-700 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#123524] mb-1 group-hover:text-indigo-700 transition-colors">Transporters</h4>
                <p className="text-xs text-[#66756B] leading-relaxed">Accept delivery dispatches, assign drivers and vehicles, and update live transit status milestones.</p>
              </div>
              <div className="pt-4 border-t border-[#EBF2ED] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-indigo-700">Logistics Pipeline</span>
                <Link to="/register" className="text-xs font-bold text-indigo-700 hover:underline">
                  Dispatch Jobs &rarr;
                </Link>
              </div>
            </div>

            <div className="p-6 rounded-2xl bg-white border border-[#DDE8DF] hover:border-amber-600 transition-all group flex flex-col justify-between shadow-soft hover:shadow-card">
              <div>
                <div className="p-3 bg-amber-50 text-amber-700 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Warehouse className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-[#123524] mb-1 group-hover:text-amber-700 transition-colors">Warehouses</h4>
                <p className="text-xs text-[#66756B] leading-relaxed">Manage cold storage capacity, approve incoming storage bookings, and release harvest for dispatch.</p>
              </div>
              <div className="pt-4 border-t border-[#EBF2ED] mt-4 flex items-center justify-between">
                <span className="text-[10px] font-semibold text-amber-700">Storage Hubs</span>
                <Link to="/register" className="text-xs font-bold text-amber-700 hover:underline">
                  Cold Storage &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>


      </main>

      <Footer />
    </div>
  );
}
