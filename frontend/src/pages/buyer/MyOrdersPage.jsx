import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import { fetchMyOrders, cancelOrder } from '../../api/orders';
import { ShoppingBag, Filter, RefreshCw, AlertCircle, MapPin, Calendar, XCircle, CheckCircle2, Clock, CreditCard } from 'lucide-react';


export default function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await fetchMyOrders(params);
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load your order history');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter]);

  const handleCancelOrder = async (orderId, cropName) => {
    const reason = prompt(`Cancel order #${orderId} for "${cropName}"? Reason for cancellation:`);
    if (reason === null) return;

    try {
      await cancelOrder(orderId, reason);
      loadOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to cancel order.');
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> PENDING FARMER ACCEPTANCE</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-teal-950 text-teal-300 border border-teal-800 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> ACCEPTED (PAYMENT PENDING)</span>;
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">PAID</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-rose-950 text-rose-300 border border-rose-800 flex items-center gap-1"><XCircle className="w-3 h-3" /> REJECTED BY FARMER</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-slate-800 text-slate-400 border border-slate-700">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-blue-950 text-blue-300 border border-blue-800">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
              <ShoppingBag className="w-6 h-6 text-emerald-400" /> My Crop Orders
            </h1>
            <p className="text-xs text-slate-400">Track purchase history, order statuses, and mock payments</p>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-emerald-600/30 transition-all hover:scale-[1.02]"
          >
            Browse Marketplace
          </Link>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Filter by Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Total Orders: <strong className="text-slate-200">{total}</strong>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading order history...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">No Orders Placed Yet</h3>
            <p className="text-xs text-slate-400 mb-6">Discover verified fresh crop yields from local farmers in the marketplace.</p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl"
            >
              Browse Crop Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isEligibleForCancel = order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PAYMENT_PENDING';
              return (
                <div
                  key={order.id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-5 transition-all shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-slate-400">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>

                    <h3 className="text-lg font-bold text-slate-100">
                      {order.crop?.name || 'Crop Harvest'}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 max-w-2xl">
                      <div>
                        <span className="text-slate-400 text-3xs">Ordered Qty:</span>
                        <div className="font-semibold text-slate-200">{order.quantity} {order.crop?.unit || 'kg'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Unit Price:</span>
                        <div className="font-semibold text-slate-200">₹{order.unit_price}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Total Amount:</span>
                        <div className="font-extrabold text-emerald-400">₹{order.total_amount}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Farmer:</span>
                        <div className="font-semibold text-slate-200 line-clamp-1">{order.farmer?.full_name || 'Farmer'}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-3xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> {order.delivery_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Placed on: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-3xs text-amber-300/80 bg-amber-950/30 px-3 py-1 rounded-lg border border-amber-900/40 w-fit">
                        Note: {order.notes}
                      </p>
                    )}
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2 flex-shrink-0">
                    {(order.status === 'ACCEPTED' || order.status === 'PAYMENT_PENDING') && (
                      <Link
                        to={`/orders/${order.id}/pay`}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/30 flex items-center gap-1.5 transition-all hover:scale-105"
                      >
                        <CreditCard className="w-4 h-4" /> Pay ₹{order.total_amount} Now
                      </Link>
                    )}

                    {isEligibleForCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id, order.crop?.name || 'Crop')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 text-xs font-semibold rounded-lg transition-colors"
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
