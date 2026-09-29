import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/AppLayout';
import { 
  Sprout, 
  ShoppingBag, 
  Truck, 
  Warehouse, 
  ShieldCheck, 
  Plus, 
  Inbox, 
  Store, 
  BarChart3, 
  ArrowRight,
  Box,
  TrendingUp,
  Clock,
  IndianRupee,
  Layers
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const roleConfig = {
    FARMER: {
      title: 'Farmer Dashboard',
      subtitle: "Here's what's happening on your farm and harvest sales today.",
      icon: Sprout,
      stats: [
        { label: 'Active Crops', value: '6 Crops', change: '+2 this month', icon: Sprout, color: 'emerald' },
        { label: 'Incoming Orders', value: '4 Orders', change: '2 pending review', icon: Inbox, color: 'indigo' },
        { label: 'Total Sales', value: '₹48,500', change: 'Escrow protected', icon: IndianRupee, color: 'emerald' },
      ],
      actions: [
        { title: 'Mandi Market Prices', desc: 'Real-time official government mandi benchmark rates & crop photos', link: '/farmer/market-prices', icon: TrendingUp },
        { title: 'My Crop Listings', desc: 'View, edit, and deactivate active produce', link: '/farmer/crops', icon: Box },
        { title: 'Post New Harvest', desc: 'List new crop yield on the marketplace', link: '/farmer/crops/add', icon: Plus },
        { title: 'Incoming Buyer Orders', desc: 'Review, accept, or reject incoming orders', link: '/farmer/orders', icon: Inbox }
      ]
    },
    BUYER: {
      title: 'Buyer Marketplace Dashboard',
      subtitle: 'Browse fresh harvests, place wholesale orders, and track dispatches.',
      icon: ShoppingBag,
      stats: [
        { label: 'Available Crops', value: '120+ Tons', change: 'Across 6 regions', icon: Store, color: 'emerald' },
        { label: 'My Placed Orders', value: '3 Active', change: '1 in transit', icon: ShoppingBag, color: 'teal' },
        { label: 'Total Procured', value: '₹1,24,000', change: 'Verified quality', icon: IndianRupee, color: 'emerald' },
      ],
      actions: [
        { title: 'Browse Crop Marketplace', desc: 'Search crops by category, price, and quality', link: '/marketplace', icon: Store },
        { title: 'My Placed Orders', desc: 'Track order statuses, cancel, or initiate mock payment', link: '/orders/mine', icon: ShoppingBag }
      ]
    },
    WAREHOUSE_MANAGER: {
      title: 'Warehouse Capacity Portal',
      subtitle: 'Manage cold storage facilities, monitor live capacity, and allocate storage slots.',
      icon: Warehouse,
      stats: [
        { label: 'Managed Facilities', value: '3 Hubs', change: 'Operational', icon: Warehouse, color: 'amber' },
        { label: 'Total Capacity', value: '2,500 Tons', change: 'Cold storage', icon: Layers, color: 'emerald' },
        { label: 'Available Space', value: '1,970 Tons', change: '78.8% available', icon: TrendingUp, color: 'teal' },
      ],
      actions: [
        { title: 'Storage Facilities', desc: 'View warehouses, live capacity gauges, and allocations', link: '/warehouse/facilities', icon: Warehouse },
        { title: 'Register Storage Hub', desc: 'Add new warehouse facility & capacity', link: '/warehouse/add', icon: Plus },
        { title: 'Crop Marketplace', desc: 'Inspect current marketplace inventory', link: '/marketplace', icon: Store }
      ]
    },
    TRANSPORTER: {
      title: 'Transporter Logistics Portal',
      subtitle: 'Dispatch transport vehicles, assign drivers, and update live transit & delivery statuses.',
      icon: Truck,
      stats: [
        { label: 'Active Dispatches', value: '2 Shipments', change: 'In transit', icon: Truck, color: 'indigo' },
        { label: 'Assigned Drivers', value: '5 Drivers', change: 'Ready for pickup', icon: Clock, color: 'emerald' },
        { label: 'Delivered Orders', value: '18 Completed', change: '100% on time', icon: CheckCircleIcon, color: 'emerald' },
      ],
      actions: [
        { title: 'Active Dispatches', desc: 'View assigned shipments and update progress', link: '/transporter/shipments', icon: Truck },
        { title: 'Dispatch Vehicle', desc: 'Assign vehicle number & driver to ready order', link: '/transporter/assign', icon: Plus }
      ]
    },
    ADMIN: {
      title: 'Executive Admin Control Center',
      subtitle: 'System-wide analytics, total merchandise volume, role distribution, and logistics throughput.',
      icon: ShieldCheck,
      stats: [
        { label: 'Gross Volume', value: '₹14,80,000', change: '+18.4% this month', icon: IndianRupee, color: 'emerald' },
        { label: 'Registered Users', value: '5 Users', change: 'All roles active', icon: ShieldCheck, color: 'purple' },
        { label: 'Total Produce Listed', value: '27,300 kg', change: '6 crop types', icon: Sprout, color: 'emerald' },
      ],
      actions: [
        { title: 'Executive Analytics Portal', desc: 'View gross revenue, order pipeline & storage occupancy', link: '/admin/analytics', icon: BarChart3 },
        { title: 'Warehouse Storage Hubs', desc: 'Overview of all registered cold storage facilities', link: '/warehouse/facilities', icon: Warehouse },
        { title: 'Logistics Dispatches', desc: 'Monitor system transport vehicle dispatches', link: '/transporter/shipments', icon: Truck },
        { title: 'Crop Marketplace', desc: 'Inspect live marketplace listings', link: '/marketplace', icon: Store }
      ]
    }
  };

  function CheckCircleIcon(props) {
    return <TrendingUp {...props} />;
  }

  const currentRoleConfig = roleConfig[user?.role] || roleConfig.BUYER;
  const RoleMainIcon = currentRoleConfig.icon;

  return (
    <AppLayout
      title={currentRoleConfig.title}
      subtitle={currentRoleConfig.subtitle}
      breadcrumb={`Dashboard / ${user?.role || 'Home'}`}
    >
      <div className="space-y-8">
        {/* Welcome Card */}
        <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 sm:p-8 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="p-3.5 bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF] rounded-2xl shrink-0">
              <RoleMainIcon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-xl sm:text-2xl font-bold text-[#123524]">
                  Welcome back, {user?.full_name}!
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-[#66756B]">
                {currentRoleConfig.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-[#F7FAF5] px-4 py-3 rounded-2xl border border-[#DDE8DF] text-xs shrink-0">
            <div className="w-8 h-8 rounded-full bg-[#075B2A] text-white flex items-center justify-center font-bold text-xs">
              {user?.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div>
              <div className="font-bold text-[#123524]">{user?.full_name}</div>
              <div className="text-[11px] text-[#66756B]">{user?.email}</div>
            </div>
          </div>
        </div>

        {/* Clean Statistic Cards */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#123524] mb-4 flex items-center gap-2">
            <span>Key Performance Highlights</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {currentRoleConfig.stats.map((stat, idx) => {
              const StatIcon = stat.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#DDE8DF] rounded-2xl p-6 shadow-soft hover:shadow-card transition-all flex items-start justify-between"
                >
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-[#66756B]">{stat.label}</span>
                    <div className="text-2xl font-extrabold text-[#123524] tracking-tight">{stat.value}</div>
                    <span className="text-[11px] text-[#075B2A] font-medium bg-[#EAF5EC] px-2 py-0.5 rounded-full inline-block mt-1">
                      {stat.change}
                    </span>
                  </div>
                  <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-xl border border-[#DDE8DF]">
                    <StatIcon className="w-5 h-5" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Role Actions */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#123524] mb-4 flex items-center gap-2">
            <span>Quick Role Management Shortcuts</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {currentRoleConfig.actions.map((act, idx) => {
              const IconComp = act.icon;
              return (
                <Link
                  key={idx}
                  to={act.link}
                  className="bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-2xl p-6 transition-all duration-150 shadow-soft hover:shadow-card group flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-xl border border-[#DDE8DF] group-hover:scale-110 transition-transform">
                        <IconComp className="w-5 h-5" />
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#66756B] group-hover:text-[#075B2A] group-hover:translate-x-1 transition-all" />
                    </div>
                    <h4 className="text-base font-bold text-[#123524] mb-1 group-hover:text-[#075B2A] transition-colors">
                      {act.title}
                    </h4>
                    <p className="text-xs text-[#66756B] mb-4 leading-relaxed">{act.desc}</p>
                  </div>

                  <div className="text-[11px] font-bold text-[#075B2A] flex items-center gap-1 pt-3 border-t border-[#EBF2ED]">
                    Open {act.title} &rarr;
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
