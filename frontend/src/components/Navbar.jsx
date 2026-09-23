import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthBadge from './HealthBadge';
import NotificationBell from './NotificationBell';
import { Sprout, LogOut, User as UserIcon, LayoutDashboard, LogIn, UserPlus, Package, Store, ShoppingBag, Inbox, Warehouse, Truck, ShieldCheck } from 'lucide-react';




export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'FARMER': return 'bg-emerald-950 text-emerald-300 border-emerald-800';
      case 'BUYER': return 'bg-teal-950 text-teal-300 border-teal-800';
      case 'TRANSPORTER': return 'bg-indigo-950 text-indigo-300 border-indigo-800';
      case 'WAREHOUSE_MANAGER': return 'bg-amber-950 text-amber-300 border-amber-800';
      case 'ADMIN': return 'bg-purple-950 text-purple-300 border-purple-800';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-emerald-600 rounded-xl text-white shadow-lg shadow-emerald-600/30 group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                AgriChain
              </h1>
              <p className="text-3xs text-slate-400 tracking-wide uppercase">Supply Chain Platform</p>
            </div>
          </Link>

          <Link
            to="/marketplace"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/marketplace'
                ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/80'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-400" />
            Marketplace
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-4">
          <HealthBadge />
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <NotificationBell />

              <Link
                to="/dashboard"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
              >
                <LayoutDashboard className="w-4 h-4 text-emerald-400" />
                Dashboard
              </Link>

              {user.role === 'ADMIN' && (
                <Link
                  to="/admin/analytics"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-purple-950/60 hover:bg-purple-900/60 border border-purple-800/80 text-purple-300 text-xs font-semibold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  Admin Portal
                </Link>
              )}


              {user.role === 'FARMER' && (
                <>
                  <Link
                    to="/farmer/crops"
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-800/80 text-emerald-300 text-xs font-semibold transition-colors"
                  >
                    <Package className="w-4 h-4 text-emerald-400" />
                    My Crops
                  </Link>
                  <Link
                    to="/farmer/orders"
                    className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 text-indigo-300 text-xs font-semibold transition-colors"
                  >
                    <Inbox className="w-4 h-4 text-indigo-400" />
                    Incoming Orders
                  </Link>
                </>
              )}

              {user.role === 'BUYER' && (
                <Link
                  to="/orders/mine"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-950/60 hover:bg-teal-900/60 border border-teal-800/80 text-teal-300 text-xs font-semibold transition-colors"
                >
                  <ShoppingBag className="w-4 h-4 text-teal-400" />
                  My Orders
                </Link>
              )}

              {(user.role === 'WAREHOUSE_MANAGER' || user.role === 'ADMIN') && (
                <Link
                  to="/warehouse/facilities"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-950/60 hover:bg-amber-900/60 border border-amber-800/80 text-amber-300 text-xs font-semibold transition-colors"
                >
                  <Warehouse className="w-4 h-4 text-amber-400" />
                  Warehouse Storage
                </Link>
              )}

              {(user.role === 'TRANSPORTER' || user.role === 'ADMIN') && (
                <Link
                  to="/transporter/shipments"
                  className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-800/80 text-indigo-300 text-xs font-semibold transition-colors"
                >
                  <Truck className="w-4 h-4 text-indigo-400" />
                  Logistics & Shipments
                </Link>
              )}



              <div className={`hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border text-xs font-semibold ${getRoleColor(user.role)}`}>
                <UserIcon className="w-3.5 h-3.5" />
                <span>{user.full_name} ({user.role})</span>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 rounded-lg bg-slate-800 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white transition-colors"
              >
                <LogIn className="w-4 h-4 text-slate-400" />
                Sign In
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-md shadow-emerald-600/20 transition-all hover:scale-[1.02]"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
