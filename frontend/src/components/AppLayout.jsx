import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import HealthBadge from './HealthBadge';
import NotificationBell from './NotificationBell';
import { 
  Sprout, 
  LayoutDashboard, 
  Store, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  Inbox, 
  PlusCircle, 
  LogOut, 
  Menu, 
  X, 
  User, 
  ChevronRight,
  Leaf
} from 'lucide-react';

export default function AppLayout({ children, title, subtitle, breadcrumb }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine navigation items according to user role
  const getNavItems = () => {
    const common = [
      { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
      { name: 'Marketplace', path: '/marketplace', icon: Store },
    ];

    if (!user) return common;

    if (user.role === 'FARMER') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'My Crops', path: '/farmer/crops', icon: Sprout },
        { name: 'Post Harvest', path: '/farmer/crops/add', icon: PlusCircle },
        { name: 'Incoming Orders', path: '/farmer/orders', icon: Inbox },
        { name: 'Marketplace', path: '/marketplace', icon: Store },
      ];
    }

    if (user.role === 'BUYER') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Browse Crops', path: '/marketplace', icon: Store },
        { name: 'My Orders', path: '/orders/mine', icon: ShoppingBag },
      ];
    }

    if (user.role === 'TRANSPORTER') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Logistics & Transit', path: '/transporter/shipments', icon: Truck },
        { name: 'Marketplace', path: '/marketplace', icon: Store },
      ];
    }

    if (user.role === 'WAREHOUSE_MANAGER') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Cold Storage Hubs', path: '/warehouse/facilities', icon: Warehouse },
        { name: 'Add Facility', path: '/warehouse/add', icon: PlusCircle },
        { name: 'Marketplace', path: '/marketplace', icon: Store },
      ];
    }

    if (user.role === 'ADMIN') {
      return [
        { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        { name: 'Admin Analytics', path: '/admin/analytics', icon: ShieldCheck },
        { name: 'Crop Directory', path: '/farmer/crops', icon: Sprout },
        { name: 'Storage Facilities', path: '/warehouse/facilities', icon: Warehouse },
        { name: 'Dispatches & Logistics', path: '/transporter/shipments', icon: Truck },
        { name: 'Marketplace', path: '/marketplace', icon: Store },
      ];
    }

    return common;
  };

  const navItems = getNavItems();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case 'FARMER': return 'bg-emerald-100 text-[#075B2A] border-emerald-200';
      case 'BUYER': return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'TRANSPORTER': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'WAREHOUSE_MANAGER': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#075B2A] text-white">
      {/* Brand Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-[#064D25]">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2 bg-[#0B7A36] rounded-xl text-white shadow-md group-hover:scale-105 transition-transform">
            <Sprout className="w-5 h-5 text-white" />
          </div>
          <div>
            <span className="font-bold text-lg tracking-tight text-white block leading-none">
              AgriChain
            </span>
            <span className="text-[10px] text-emerald-200 font-medium tracking-wide uppercase">
              Supply Chain Ecosystem
            </span>
          </div>
        </Link>
        <button 
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-[#064D25]"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-300/80 px-3 mb-2">
          Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path || (item.path !== '/' && item.path !== '/dashboard' && location.pathname.startsWith(item.path));
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#0B7A36] text-white shadow-sm font-semibold'
                  : 'text-emerald-100/90 hover:bg-[#064D25] hover:text-white'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-emerald-300'}`} />
              <span>{item.name}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-emerald-200" />}
            </Link>
          );
        })}
      </div>

      {/* Bottom Nature Decal & User Profile */}
      <div className="p-4 border-t border-[#064D25] bg-[#064D25]/40 space-y-3">
        {user ? (
          <div className="flex items-center justify-between gap-3 p-2 rounded-xl bg-[#064D25]/70">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-9 h-9 rounded-full bg-[#0B7A36] flex items-center justify-center font-bold text-white text-xs shrink-0">
                {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.full_name}
                </p>
                <p className="text-[10px] text-emerald-200 truncate capitalize">
                  {user.role ? user.role.toLowerCase().replace('_', ' ') : 'User'}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-emerald-200 hover:text-rose-200 hover:bg-rose-900/30 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <Link
            to="/login"
            className="flex items-center justify-center gap-2 w-full py-2 bg-[#0B7A36] hover:bg-[#16A34A] text-white text-xs font-semibold rounded-xl shadow-sm transition-colors"
          >
            <User className="w-3.5 h-3.5" /> Sign In
          </Link>
        )}

        <div className="flex items-center justify-center gap-1.5 text-[10px] text-emerald-300/60 pt-1">
          <Leaf className="w-3 h-3 text-[#5FAF45]" />
          <span>Sustainable & Transparent Farming</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F7FAF5] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0 z-30 shadow-lg">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-72 max-w-full shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            <SidebarContent />
          </div>
        </div>
      )}

      {/* Main Content Workspace */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#DDE8DF] sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl text-[#123524] hover:bg-[#F5F8F3] transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              {breadcrumb && (
                <div className="text-[11px] font-medium text-[#66756B] mb-0.5">
                  {breadcrumb}
                </div>
              )}
              {title && (
                <h1 className="text-lg font-bold text-[#123524] tracking-tight leading-none">
                  {title}
                </h1>
              )}
            </div>
          </div>

          {/* Header Controls (Health Badge, Notifications, User Badge) */}
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="hidden md:flex">
              <HealthBadge />
            </div>

            {user && <NotificationBell />}

            {user && (
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeStyle(user.role)}`}>
                <span className="w-2 h-2 rounded-full bg-current opacity-80" />
                <span>{user.role.replace('_', ' ')}</span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {subtitle && (
            <div className="mb-6">
              <p className="text-xs sm:text-sm text-[#66756B]">{subtitle}</p>
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
