import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { fetchAdminAnalytics } from '../../api/admin';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Warehouse, 
  Truck, 
  Sprout, 
  AlertCircle,
  IndianRupee,
  Layers,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  Package,
  Activity,
  Loader2
} from 'lucide-react';

const AdminAnalyticsDashboardPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await fetchAdminAnalytics();
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
      setError(err.response?.data?.detail || 'Failed to load executive system metrics.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AppLayout title="Executive Analytics & Operations" subtitle="Aggregating platform intelligence...">
        <div className="py-24 flex flex-col items-center justify-center text-[#66756B]">
          <Loader2 className="w-10 h-10 animate-spin text-[#075B2A] mb-3" />
          <p className="text-sm font-semibold">Aggregating live agricultural ecosystem telemetry...</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !analytics) {
    return (
      <AppLayout title="Executive Analytics & Operations">
        <div className="max-w-md mx-auto my-12 p-8 bg-white border border-[#DDE8DF] rounded-3xl text-center shadow-soft">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-[#123524] mb-2">Unable to Load Analytics</h2>
          <p className="text-xs text-[#66756B] mb-6">{error || 'An unexpected error occurred while aggregating ecosystem telemetry.'}</p>
          <button
            onClick={loadAnalytics}
            className="px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold text-xs rounded-xl shadow-soft transition cursor-pointer"
          >
            Retry Analytics
          </button>
        </div>
      </AppLayout>
    );
  }

  const { user_stats, crop_stats, order_stats, financial_stats, warehouse_stats, shipment_stats } = analytics;

  return (
    <AppLayout
      title="System Executive Intelligence"
      subtitle="Ecosystem performance, escrow clearing volume, stakeholder demographic distribution, and logistics throughput"
      breadcrumb="Platform Administration / Analytics"
    >
      <div className="space-y-8">
        {/* Header Action */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold text-[#075B2A]">Real-Time AgriChain Telemetry Active</span>
          </div>
          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-white hover:bg-[#F7FAF5] text-[#123524] font-bold text-xs rounded-xl border border-[#DDE8DF] flex items-center gap-2 shadow-xs transition"
          >
            <Activity className="w-3.5 h-3.5 text-[#075B2A]" /> Refresh Telemetry
          </button>
        </div>

        {/* Top 4 Primary KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Gross Transaction Volume */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-[#66756B]">Gross Merchandise Value</span>
              <div className="p-3 bg-[#EAF5EC] text-[#075B2A] rounded-2xl border border-[#DDE8DF]">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#123524] mb-1">
              ₹{financial_stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-[#075B2A] font-semibold flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Avg Order: ₹{financial_stats.average_order_value}
            </p>
          </div>

          {/* Users */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-[#66756B]">Registered Participants</span>
              <div className="p-3 bg-purple-50 text-purple-700 rounded-2xl border border-purple-200">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#123524] mb-1">{user_stats.total}</div>
            <p className="text-xs text-[#66756B]">
              <strong className="text-[#075B2A]">{user_stats.farmer}</strong> Farmers • <strong className="text-teal-700">{user_stats.buyer}</strong> Buyers
            </p>
          </div>

          {/* Orders */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-[#66756B]">Crop Order Volume</span>
              <div className="p-3 bg-teal-50 text-teal-700 rounded-2xl border border-teal-200">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#123524] mb-1">{order_stats.total_orders}</div>
            <p className="text-xs text-teal-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> {order_stats.delivered_orders} Consignments Delivered
            </p>
          </div>

          {/* Warehouse Occupancy */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-6 shadow-soft hover:shadow-card transition-all">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold text-[#66756B]">Cold Chain Utilization</span>
              <div className="p-3 bg-amber-50 text-amber-700 rounded-2xl border border-amber-200">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-[#123524] mb-1">{warehouse_stats.occupancy_percentage}%</div>
            <p className="text-xs text-[#66756B]">
              {warehouse_stats.occupied_capacity_tons} / {warehouse_stats.total_capacity_tons} Tons Allocated
            </p>
          </div>
        </div>

        {/* Detailed Insights Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Role Distribution */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 shadow-soft">
            <h3 className="text-base font-bold text-[#123524] mb-5 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#075B2A]" /> Platform Stakeholder Distribution
            </h3>
            
            <div className="space-y-3.5">
              <div className="flex justify-between items-center bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-[#075B2A]"></div>
                  <span className="text-xs font-bold text-[#123524]">Farmers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#66756B]">
                    {user_stats.total > 0 ? Math.round((user_stats.farmer / user_stats.total) * 100) : 0}%
                  </span>
                  <span className="text-xs font-extrabold text-[#075B2A] bg-[#EAF5EC] px-3 py-1 rounded-xl border border-[#DDE8DF]">
                    {user_stats.farmer} Users
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-teal-600"></div>
                  <span className="text-xs font-bold text-[#123524]">Buyers / Wholesalers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#66756B]">
                    {user_stats.total > 0 ? Math.round((user_stats.buyer / user_stats.total) * 100) : 0}%
                  </span>
                  <span className="text-xs font-extrabold text-teal-800 bg-teal-50 px-3 py-1 rounded-xl border border-teal-200">
                    {user_stats.buyer} Users
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-indigo-600"></div>
                  <span className="text-xs font-bold text-[#123524]">Logistics Transporters</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#66756B]">
                    {user_stats.total > 0 ? Math.round((user_stats.transporter / user_stats.total) * 100) : 0}%
                  </span>
                  <span className="text-xs font-extrabold text-indigo-800 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
                    {user_stats.transporter} Users
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-amber-600"></div>
                  <span className="text-xs font-bold text-[#123524]">Warehouse Hub Managers</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#66756B]">
                    {user_stats.total > 0 ? Math.round((user_stats.warehouse_manager / user_stats.total) * 100) : 0}%
                  </span>
                  <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                    {user_stats.warehouse_manager} Users
                  </span>
                </div>
              </div>

              <div className="flex justify-between items-center bg-[#F7FAF5] p-3.5 rounded-2xl border border-[#DDE8DF]">
                <div className="flex items-center gap-2.5">
                  <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                  <span className="text-xs font-bold text-[#123524]">Ecosystem Administrators</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-[#66756B]">
                    {user_stats.total > 0 ? Math.round((user_stats.admin / user_stats.total) * 100) : 0}%
                  </span>
                  <span className="text-xs font-extrabold text-purple-800 bg-purple-50 px-3 py-1 rounded-xl border border-purple-200">
                    {user_stats.admin} Users
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Lifecycle Fulfillment Pipeline */}
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-7 shadow-soft">
            <h3 className="text-base font-bold text-[#123524] mb-5 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#075B2A]" /> Order Fulfillment Pipeline
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">Farmer Review</span>
                <span className="text-xl font-extrabold text-amber-700">{order_stats.pending_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">Awaiting Acceptance</span>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">Accepted</span>
                <span className="text-xl font-extrabold text-teal-700">{order_stats.accepted_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">Pending Payment</span>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">Escrow Paid</span>
                <span className="text-xl font-extrabold text-[#075B2A]">{order_stats.paid_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">Ready for Storage</span>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">In Transit</span>
                <span className="text-xl font-extrabold text-indigo-700">{order_stats.in_transit_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">On Fleet Trucks</span>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">Delivered</span>
                <span className="text-xl font-extrabold text-emerald-700">{order_stats.delivered_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">Successfully Closed</span>
              </div>

              <div className="bg-[#F7FAF5] p-4 rounded-2xl border border-[#DDE8DF]">
                <span className="text-[11px] font-bold text-[#66756B] block mb-1">Cancelled</span>
                <span className="text-xl font-extrabold text-rose-600">{order_stats.cancelled_orders}</span>
                <span className="text-[10px] text-[#66756B] block mt-0.5">Voided / Rejected</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default AdminAnalyticsDashboardPage;
