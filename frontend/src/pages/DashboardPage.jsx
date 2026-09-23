import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  Plus, 
  Inbox, 
  CreditCard, 
  Store, 
  User, 
  BarChart3, 
  ArrowRight,
  Box
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const roleConfig = {
    FARMER: {
      title: 'Farmer Dashboard',
      subtitle: 'Manage your active crop yields, list new produce, and manage incoming buyer orders.',
      badgeColor: 'bg-emerald-950 text-emerald-300 border-emerald-800',
      icon: Sprout,
      actions: [
        { title: 'My Crop Listings', desc: 'View, edit, and deactivate active produce', link: '/farmer/crops', icon: PackageIcon, color: 'emerald' },
        { title: 'Post New Harvest', desc: 'List new crop yield on the marketplace', link: '/farmer/crops/add', icon: Plus, color: 'emerald' },
        { title: 'Incoming Buyer Orders', desc: 'Review, accept, or reject incoming orders', link: '/farmer/orders', icon: Inbox, color: 'indigo' },
        { title: 'Crop Marketplace', desc: 'Browse live prices & competing listings', link: '/marketplace', icon: Store, color: 'teal' }
      ]
    },
    BUYER: {
      title: 'Buyer Marketplace Dashboard',
      subtitle: 'Search fresh crop harvests, place wholesale orders, and track mock payments & dispatches.',
      badgeColor: 'bg-teal-950 text-teal-300 border-teal-800',
      icon: ShoppingBag,
      actions: [
        { title: 'Browse Crop Marketplace', desc: 'Search crops by category, price, and quality', link: '/marketplace', icon: Store, color: 'teal' },
        { title: 'My Placed Orders', desc: 'Track order statuses, cancel, or initiate mock payment', link: '/orders/mine', icon: ShoppingBag, color: 'emerald' }
      ]
    },
    WAREHOUSE_MANAGER: {
      title: 'Warehouse Capacity Portal',
      subtitle: 'Manage cold storage facilities, monitor live capacity, and allocate storage slots for paid orders.',
      badgeColor: 'bg-amber-950 text-amber-300 border-amber-800',
      icon: Warehouse,
      actions: [
        { title: 'Storage Facilities', desc: 'View warehouses, live capacity gauges, and allocations', link: '/warehouse/facilities', icon: Warehouse, color: 'amber' },
        { title: 'Register New Storage Hub', desc: 'Add new warehouse facility & capacity', link: '/warehouse/add', icon: Plus, color: 'amber' },
        { title: 'Crop Marketplace', desc: 'Inspect current marketplace inventory', link: '/marketplace', icon: Store, color: 'teal' }
      ]
    },
    TRANSPORTER: {
      title: 'Transporter Logistics Portal',
      subtitle: 'Dispatch transport vehicles, assign drivers, and update live transit & delivery statuses.',
      badgeColor: 'bg-indigo-950 text-indigo-300 border-indigo-800',
      icon: Truck,
      actions: [
        { title: 'My Active Dispatches', desc: 'View assigned shipments and update progress', link: '/transporter/shipments', icon: Truck, color: 'indigo' },
        { title: 'Dispatch New Vehicle', desc: 'Assign vehicle number & driver to ready order', link: '/transporter/assign', icon: Plus, color: 'indigo' }
      ]
    },
    ADMIN: {
      title: 'Executive Admin Control Center',
      subtitle: 'System-wide analytics, total merchandise volume (₹), role distribution, and logistics throughput.',
      badgeColor: 'bg-purple-950 text-purple-300 border-purple-800',
      icon: ShieldCheck,
      actions: [
        { title: 'Executive Analytics Portal', desc: 'View gross revenue, order pipeline & storage occupancy', link: '/admin/analytics', icon: BarChart3, color: 'purple' },
        { title: 'Warehouse Storage Hubs', desc: 'Overview of all registered cold storage facilities', link: '/warehouse/facilities', icon: Warehouse, color: 'amber' },
        { title: 'Logistics Dispatches', desc: 'Monitor system transport vehicle dispatches', link: '/transporter/shipments', icon: Truck, color: 'indigo' },
        { title: 'Crop Marketplace', desc: 'Inspect live marketplace listings', link: '/marketplace', icon: Store, color: 'teal' }
      ]
    }
  };

  function PackageIcon(props) {
    return <Box {...props} />;
  }

  const currentRoleConfig = roleConfig[user?.role] || roleConfig.BUYER;
  const RoleMainIcon = currentRoleConfig.icon;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Welcome Banner */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 backdrop-blur-xl mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="p-4 bg-slate-950 text-emerald-400 border border-slate-800 rounded-2xl">
              <RoleMainIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold text-slate-100">{currentRoleConfig.title}</h1>
                <span className={`px-2.5 py-0.5 rounded-full text-3xs font-extrabold uppercase border ${currentRoleConfig.badgeColor}`}>
                  {user?.role}
                </span>
              </div>
              <p className="text-xs text-slate-400">{currentRoleConfig.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-slate-950/80 p-3.5 rounded-2xl border border-slate-800 text-xs">
            <User className="w-4 h-4 text-emerald-400" />
            <div>
              <div className="font-semibold text-slate-200">{user?.full_name}</div>
              <div className="text-3xs text-slate-400">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Quick Actions Grid for Logged-In User Role */}
        <div className="mb-6">
          <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
            <RoleMainIcon className="w-5 h-5 text-emerald-400" /> Quick Role Management Shortcuts
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentRoleConfig.actions.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <Link
                  key={idx}
                  to={act.link}
                  className="bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl p-6 transition-all shadow-lg hover:shadow-emerald-950/20 group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-950 text-emerald-400 rounded-xl border border-slate-800 group-hover:scale-110 transition-transform">
                        <IconComp className="w-6 h-6" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                    </div>
                    <h3 className="text-lg font-bold text-slate-100 mb-1 group-hover:text-emerald-400 transition-colors">
                      {act.title}
                    </h3>
                    <p className="text-xs text-slate-400 mb-4">{act.desc}</p>
                  </div>

                  <div className="text-3xs font-semibold text-emerald-400 flex items-center gap-1 pt-2 border-t border-slate-800/60">
                    Open {act.title} &rarr;
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
