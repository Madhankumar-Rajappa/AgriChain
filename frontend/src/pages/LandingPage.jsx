import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthBadge from '../components/HealthBadge';
import Footer from '../components/Footer';
import { fetchAvailableCrops } from '../api/crops';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  ArrowRight, 
  Database, 
  Server, 
  LogIn, 
  UserPlus, 
  Store,
  LayoutDashboard,
  Search,
  Zap,
  MapPin,
  Tag,
  CheckCircle2,
  Lock,
  Loader2
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
    { role: 'FARMER', label: 'Farmer', name: 'Ramesh Patel', email: 'farmer@agrichain.com', pass: 'Farmer123!', icon: Sprout, color: 'emerald' },
    { role: 'BUYER', label: 'Buyer', name: 'Anita Sharma', email: 'buyer@agrichain.com', pass: 'Buyer123!', icon: ShoppingBag, color: 'teal' },
    { role: 'TRANSPORTER', label: 'Transporter', name: 'Express Agri', email: 'transporter@agrichain.com', pass: 'Transporter123!', icon: Truck, color: 'indigo' },
    { role: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', name: 'Kisan Storage', email: 'warehouse@agrichain.com', pass: 'Warehouse123!', icon: Warehouse, color: 'amber' },
    { role: 'ADMIN', label: 'Admin', name: 'System Admin', email: 'admin@agrichain.com', pass: 'Admin123!', icon: ShieldCheck, color: 'purple' }
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Header / Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
                <Sprout className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent leading-none">
                  AgriChain
                </h1>
                <p className="text-[10px] text-slate-400 tracking-wide uppercase mt-0.5">Supply Chain Ecosystem</p>
              </div>
            </Link>

            <Link
              to="/marketplace"
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              Live Marketplace
            </Link>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center">
              <HealthBadge />
            </div>

            {user ? (
              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all hover:scale-[1.02]"
              >
                <LayoutDashboard className="w-4 h-4" /> Go to Dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700 rounded-xl transition-all"
                >
                  <LogIn className="w-3.5 h-3.5 text-emerald-400" /> Sign In
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
                >
                  <UserPlus className="w-3.5 h-3.5" /> Register Account
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 lg:py-14 space-y-12">
        
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <div className="inline-flex lg:hidden mb-2">
            <HealthBadge />
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-800 text-emerald-300 text-xs font-semibold shadow-sm">
            <Zap className="w-3.5 h-3.5 text-amber-400 animate-bounce" /> Fully Operational Interactive Platform
          </div>
          
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-100 leading-tight">
            Unified Agricultural <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-lime-400 bg-clip-text text-transparent">
              Supply Chain Ecosystem
            </span>
          </h2>
          
          <p className="text-sm sm:text-base lg:text-lg text-slate-300 font-normal leading-relaxed max-w-2xl mx-auto">
            Connecting Farmers, Buyers, Transporters, Warehouse Managers, and Admins into a transparent marketplace and real-time logistics pipeline.
          </p>

          {/* Primary Action Callouts */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link
              to="/marketplace"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all hover:scale-105"
            >
              <Store className="w-5 h-5" /> Explore Crop Marketplace <ArrowRight className="w-4 h-4" />
            </Link>

            {!user && (
              <Link
                to="/register"
                className="w-full sm:w-auto px-6 py-3.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-bold text-sm rounded-2xl flex items-center justify-center gap-2 transition-all hover:border-slate-500"
              >
                <UserPlus className="w-5 h-5 text-emerald-400" /> Create New Account
              </Link>
            )}
          </div>
        </div>

        {/* 1-CLICK DEMO LOGIN BANNER */}
        {!user && (
          <div className="bg-gradient-to-r from-slate-900 via-emerald-950/40 to-slate-900 border border-emerald-800/60 rounded-3xl p-6 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
              <div>
                <div className="inline-flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Zap className="w-4 h-4 text-amber-400" /> Instant 1-Click Interactive Demo Login
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Click any role button below to instantly log in as a pre-seeded account and test the full interactive workflow!
                </p>
              </div>
              <div className="text-2xs text-slate-500 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                Default Password: <code className="text-slate-300 font-mono">RoleName123!</code>
              </div>
            </div>

            {demoError && (
              <div className="mb-4 p-3 rounded-xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <span>⚠️ {demoError}</span>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {demoAccounts.map((acc) => {
                const IconComponent = acc.icon;
                const isLoggingIn = loggingInRole === acc.role;
                return (
                  <button
                    key={acc.role}
                    onClick={() => handleQuickDemoLogin(acc)}
                    disabled={isLoggingIn || loggingInRole !== null}
                    className="flex flex-col items-center text-center p-3.5 rounded-2xl bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/80 transition-all group disabled:opacity-50 shadow-sm"
                  >
                    <div className="p-2.5 rounded-xl bg-slate-900 group-hover:scale-110 transition-transform mb-2 text-emerald-400">
                      {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <IconComponent className="w-5 h-5" />}
                    </div>
                    <span className="text-xs font-bold text-slate-200 group-hover:text-emerald-400 transition-colors">
                      {acc.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate max-w-[120px] mt-0.5">
                      {acc.name}
                    </span>
                    <span className="text-[9px] font-mono text-emerald-400/80 mt-2 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-900">
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
              <h3 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
                <Store className="w-6 h-6 text-emerald-400" /> Live Crop Marketplace Feed
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Real harvest listings available from registered farmers across India.
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
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all border ${
                    selectedCategory === cat.value
                      ? 'bg-emerald-600 text-white border-emerald-500 shadow-md shadow-emerald-600/20'
                      : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search crops by name (e.g. Wheat, Alphonso Mangoes, Basmati Rice)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Crop Cards Feed */}
          {loadingCrops ? (
            <div className="py-12 text-center text-slate-500 text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Loading live crops from database...
            </div>
          ) : crops.length === 0 ? (
            <div className="py-12 text-center bg-slate-900/50 border border-slate-800 rounded-2xl p-6">
              <p className="text-sm font-semibold text-slate-300">No crops found matching filters.</p>
              <p className="text-xs text-slate-500 mt-1">Try clearing your search query or category selection.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {crops.map((crop) => (
                <div
                  key={crop.id}
                  className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500/80 transition-all duration-200 flex flex-col justify-between group shadow-lg"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold tracking-wide uppercase bg-emerald-950 text-emerald-400 border border-emerald-800/80">
                        {crop.category}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300">
                        {crop.quality}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
                        {crop.name}
                      </h4>
                      <p className="text-xs text-slate-400 line-clamp-2 mt-1">
                        {crop.description || 'Fresh harvested produce ready for purchase.'}
                      </p>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                      <span className="flex items-center gap-1 text-slate-400">
                        <MapPin className="w-3.5 h-3.5 text-emerald-400" /> {crop.location}
                      </span>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold">Expected Price</div>
                      <div className="text-lg font-extrabold text-emerald-400">
                        ₹{crop.expected_price} <span className="text-xs font-normal text-slate-400">/ {crop.unit}</span>
                      </div>
                    </div>

                    <Link
                      to={`/crops/${crop.id}`}
                      className="px-3.5 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-md transition-all flex items-center gap-1"
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
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-xl transition-all"
            >
              Browse Full Marketplace & Order Crops <ArrowRight className="w-4 h-4 text-emerald-400" />
            </Link>
          </div>
        </section>

        {/* Core Ecosystem Role Portals */}
        <section className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-100">Role-Based End-to-End Capabilities</h3>
            <p className="text-xs text-slate-400 mt-1">
              Select your role to access specialized features tailored for each supply chain participant.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-emerald-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-emerald-950 text-emerald-400 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Sprout className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-emerald-400 transition-colors">Farmers</h4>
                <p className="text-xs text-slate-400">Register crop yields, set price expectations, inspect incoming orders, and manage sales.</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-2xs font-semibold text-emerald-400">Yield Management</span>
                <Link to="/register" className="text-xs font-bold text-emerald-400 hover:underline">
                  Join as Farmer &rarr;
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-teal-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-teal-950 text-teal-400 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-teal-400 transition-colors">Buyers</h4>
                <p className="text-xs text-slate-400">Browse verified crops, filter by quality & location, place direct orders, and pay online.</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-2xs font-semibold text-teal-400">Direct Procurement</span>
                <Link to="/marketplace" className="text-xs font-bold text-teal-400 hover:underline">
                  Explore Market &rarr;
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-indigo-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-indigo-950 text-indigo-400 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Truck className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-indigo-400 transition-colors">Transporters</h4>
                <p className="text-xs text-slate-400">Accept delivery jobs, assign drivers and vehicles, and update live transit status milestones.</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-2xs font-semibold text-indigo-400">Logistics Pipeline</span>
                <Link to="/register" className="text-xs font-bold text-indigo-400 hover:underline">
                  Dispatch Jobs &rarr;
                </Link>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-amber-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="p-3 bg-amber-950 text-amber-400 rounded-xl w-fit mb-4 group-hover:scale-105 transition-transform">
                  <Warehouse className="w-6 h-6" />
                </div>
                <h4 className="text-base font-bold text-slate-100 mb-1 group-hover:text-amber-400 transition-colors">Warehouses</h4>
                <p className="text-xs text-slate-400">Manage cold storage capacity, approve incoming storage bookings, and release harvest for dispatch.</p>
              </div>
              <div className="pt-4 border-t border-slate-800/80 mt-4 flex items-center justify-between">
                <span className="text-2xs font-semibold text-amber-400">Storage Hubs</span>
                <Link to="/register" className="text-xs font-bold text-amber-400 hover:underline">
                  Manage Cold Storage &rarr;
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Stack Card */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 md:p-8 backdrop-blur-sm max-w-4xl mx-auto">
          <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-4 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4" /> Production-Grade Architecture & Verification
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-300">
            <div className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <Server className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">FastAPI REST API</div>
                <div className="text-slate-500 text-[10px]">Python 3.12 / JWT Auth</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <Database className="w-5 h-5 text-teal-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">MySQL Database</div>
                <div className="text-slate-500 text-[10px]">SQLAlchemy 2.0 / Alembic</div>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3.5 bg-slate-950 rounded-xl border border-slate-800">
              <Sprout className="w-5 h-5 text-lime-400 flex-shrink-0" />
              <div>
                <div className="font-semibold text-slate-200">Vite React Frontend</div>
                <div className="text-slate-500 text-[10px]">Tailwind CSS / Axios</div>
              </div>
            </div>
          </div>
        </div>

      </main>

      <Footer />
    </div>
  );
}
