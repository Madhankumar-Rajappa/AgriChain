import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthBadge from './HealthBadge';
import NotificationBell from './NotificationBell';
import { Sprout, LogOut, LayoutDashboard, LogIn, UserPlus, Store } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="border-b border-[#DDE8DF] bg-white/95 backdrop-blur-md sticky top-0 z-50 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="p-2 bg-[#075B2A] rounded-xl text-white shadow-sm group-hover:scale-105 transition-transform">
              <Sprout className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-[#123524] leading-none">
                AgriChain
              </h1>
              <p className="text-[10px] text-[#66756B] tracking-wide uppercase mt-0.5">Supply Chain Ecosystem</p>
            </div>
          </Link>

          <Link
            to="/marketplace"
            className={`hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors ${
              location.pathname === '/marketplace'
                ? 'bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]'
                : 'text-[#66756B] hover:text-[#123524] hover:bg-[#F5F8F3]'
            }`}
          >
            <Store className="w-4 h-4 text-[#075B2A]" />
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#075B2A] hover:bg-[#0B7A36] text-white text-xs font-semibold shadow-sm transition-all"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard</span>
              </Link>

              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-[#F5F8F3] hover:bg-rose-50 hover:text-rose-600 text-[#66756B] border border-[#DDE8DF] transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#123524] hover:text-[#075B2A] bg-[#F5F8F3] hover:bg-white border border-[#DDE8DF] rounded-xl transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-[#075B2A]" />
                <span>Sign In</span>
              </Link>
              <Link
                to="/register"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold bg-[#075B2A] hover:bg-[#0B7A36] text-white rounded-xl shadow-sm transition-all hover:scale-[1.01]"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
