import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { fetchIncomingOrders, acceptOrder, rejectOrder } from '../../api/orders';
import { Sprout, Filter, RefreshCw, AlertCircle, Check, X, Clock, MapPin, Calendar, User } from 'lucide-react';

export default function FarmerIncomingOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [processingId, setProcessingId] = useState(null);

  const loadIncomingOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = {};
      if (statusFilter) params.status = statusFilter;
      const data = await fetchIncomingOrders(params);
      setOrders(data.items);
      setTotal(data.total);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to load incoming order requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIncomingOrders();
  }, [statusFilter]);

  const handleAccept = async (orderId) => {
    if (!window.confirm(`Accept incoming order #${orderId}? Stock reservation will be confirmed.`)) return;
    setProcessingId(orderId);
    try {
      await acceptOrder(orderId);
      loadIncomingOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to accept order.');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (orderId, cropName) => {
    const reason = prompt(`Reject order #${orderId} for "${cropName}"? Reason for rejection:`);
    if (reason === null) return;

    setProcessingId(orderId);
    try {
      await rejectOrder(orderId, reason);
      loadIncomingOrders();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to reject order.');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-amber-950 text-amber-300 border border-amber-800 flex items-center gap-1"><Clock className="w-3 h-3" /> ACTION REQUIRED (PENDING)</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-teal-950 text-teal-300 border border-teal-800">ACCEPTED</span>;
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">PAID</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-3xs font-semibold bg-rose-950 text-rose-300 border border-rose-800">REJECTED</span>;
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
              <Sprout className="w-6 h-6 text-emerald-400" /> Incoming Buyer Order Requests
            </h1>
            <p className="text-xs text-slate-400">Review buyer order requests, accept orders, or reject unavailable requests</p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs text-slate-300 font-medium">Filter Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-emerald-500"
            >
              <option value="">All Incoming Orders</option>
              <option value="PENDING">Pending Action</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          <div className="text-xs text-slate-400">
            Total Incoming: <strong className="text-slate-200">{total}</strong>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin text-emerald-500 mb-2" />
            <p className="text-xs">Loading order requests...</p>
          </div>
        ) : error ? (
          <div className="p-4 bg-rose-950/60 border border-rose-800 text-rose-300 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-400" />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <Sprout className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-200 mb-1">No Incoming Orders</h3>
            <p className="text-xs text-slate-400">When buyers place orders for your crop listings, they will appear here for your review.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = order.status === 'PENDING';
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
                      {order.crop?.name || 'Crop Yield'}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/80 max-w-2xl">
                      <div>
                        <span className="text-slate-400 text-3xs">Buyer Name:</span>
                        <div className="font-semibold text-slate-200 line-clamp-1">{order.buyer?.full_name || 'Buyer'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Quantity Requested:</span>
                        <div className="font-semibold text-slate-200">{order.quantity} {order.crop?.unit || 'kg'}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Unit Price:</span>
                        <div className="font-semibold text-slate-200">₹{order.unit_price}</div>
                      </div>
                      <div>
                        <span className="text-slate-400 text-3xs">Total Value:</span>
                        <div className="font-extrabold text-emerald-400">₹{order.total_amount}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-3xs text-slate-400 pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-500" /> Delivery To: {order.delivery_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-500" /> Requested: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-3xs text-slate-300 bg-slate-950 px-3 py-1 rounded-lg border border-slate-800 w-fit">
                        Buyer Note: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Accept / Reject Action Controls */}
                  {isPending ? (
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleAccept(order.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-md flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Accept Order
                      </button>
                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleReject(order.id, order.crop?.name || 'Crop')}
                        className="px-4 py-2 bg-slate-800 hover:bg-rose-950/80 hover:text-rose-400 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 flex items-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <X className="w-4 h-4" /> Reject Order
                      </button>
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 font-medium italic flex-shrink-0">
                      Status: {order.status}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
