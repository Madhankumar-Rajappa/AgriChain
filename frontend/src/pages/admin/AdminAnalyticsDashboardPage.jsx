import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchAdminAnalytics } from '../../api/admin';
import { 
  ShieldCheck, 
  Users, 
  ShoppingBag, 
  TrendingUp, 
  Warehouse, 
  Truck, 
  Sprout, 
  RefreshCw, 
  AlertCircle,
  IndianRupee,
  Activity,
  Layers
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
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="w-8 h-8 animate-spin text-purple-500" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100">
        <Navbar />
        <div className="max-w-md mx-auto my-12 p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center">
          <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-100 mb-2">Access Denied / Error</h2>
          <p className="text-xs text-slate-400 mb-6">{error}</p>
        </div>
        <Footer />
      </div>
    );
  }

  const { user_stats, crop_stats, order_stats, financial_stats, warehouse_stats, shipment_stats } = analytics;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShieldCheck className="w-7 h-7 text-purple-400" /> System Executive Analytics
            </h1>
            <p className="text-xs text-slate-400">Platform-wide statistics, gross merchandise volume, role counts, and storage logistics</p>
          </div>

          <button
            onClick={loadAnalytics}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-purple-400" /> Refresh Live Metrics
          </button>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Revenue */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Gross Transaction Volume</span>
              <div className="p-2 bg-emerald-600/20 text-emerald-400 rounded-xl border border-emerald-500/30">
                <IndianRupee className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 mb-1">
              ₹{financial_stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-3xs text-slate-400">Avg Order: ₹{financial_stats.average_order_value}</p>
          </div>

          {/* Users */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Total Registered Users</span>
              <div className="p-2 bg-purple-600/20 text-purple-400 rounded-xl border border-purple-500/30">
                <Users className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-100 mb-1">{user_stats.total}</div>
            <p className="text-3xs text-slate-400">{user_stats.farmer} Farmers | {user_stats.buyer} Buyers</p>
          </div>

          {/* Orders */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Total Crop Orders</span>
              <div className="p-2 bg-teal-600/20 text-teal-400 rounded-xl border border-teal-500/30">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-100 mb-1">{order_stats.total_orders}</div>
            <p className="text-3xs text-teal-400 font-semibold">{order_stats.delivered_orders} Completed / Delivered</p>
          </div>

          {/* Warehouse Occupancy */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-lg">
            <div className="flex justify-between items-start mb-3">
              <span className="text-xs font-semibold text-slate-400">Storage Occupancy</span>
              <div className="p-2 bg-amber-600/20 text-amber-400 rounded-xl border border-amber-500/30">
                <Warehouse className="w-5 h-5" />
              </div>
            </div>
            <div className="text-2xl font-extrabold text-slate-100 mb-1">{warehouse_stats.occupancy_percentage}%</div>
            <p className="text-3xs text-slate-400">{warehouse_stats.occupied_capacity_tons} / {warehouse_stats.total_capacity_tons} Tons Used</p>
          </div>
        </div>

        {/* Detailed Metrics Grids */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* User Role Distribution */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" /> Platform Roles Breakdown
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-emerald-400">Farmers</span>
                <span className="text-xs font-bold text-slate-200">{user_stats.farmer}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-teal-400">Buyers</span>
                <span className="text-xs font-bold text-slate-200">{user_stats.buyer}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-indigo-400">Transporters</span>
                <span className="text-xs font-bold text-slate-200">{user_stats.transporter}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-amber-400">Warehouse Managers</span>
                <span className="text-xs font-bold text-slate-200">{user_stats.warehouse_manager}</span>
              </div>
              <div className="flex justify-between items-center bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-xs font-semibold text-purple-400">Administrators</span>
                <span className="text-xs font-bold text-slate-200">{user_stats.admin}</span>
              </div>
            </div>
          </div>

          {/* Order Lifecycle Breakdown */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-lg">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-400" /> Order Fulfillment Pipeline
            </h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">Pending Farmer Acceptance</span>
                <span className="text-base font-bold text-amber-400">{order_stats.pending_orders}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">Accepted / Payment Pending</span>
                <span className="text-base font-bold text-teal-400">{order_stats.accepted_orders}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">Paid / Storage Reserved</span>
                <span className="text-base font-bold text-emerald-400">{order_stats.paid_orders}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">In Transit Vehicles</span>
                <span className="text-base font-bold text-indigo-400">{order_stats.in_transit_orders}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">Completed Deliveries</span>
                <span className="text-base font-bold text-emerald-400">{order_stats.delivered_orders}</span>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/80">
                <span className="text-3xs text-slate-400 block">Cancelled / Rejected</span>
                <span className="text-base font-bold text-rose-400">{order_stats.cancelled_orders}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default AdminAnalyticsDashboardPage;
