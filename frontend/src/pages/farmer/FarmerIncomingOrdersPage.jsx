import React, { useState, useEffect } from 'react';
import AppLayout from '../../components/AppLayout';
import { fetchIncomingOrders, acceptOrder, rejectOrder } from '../../api/orders';
import { Sprout, Filter, RefreshCw, AlertCircle, Check, X, Clock, MapPin, Calendar, Loader2 } from 'lucide-react';

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
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> ACTION REQUIRED (PENDING)</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200">ACCEPTED</span>;
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]">PAID</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200">REJECTED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF]">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">{status}</span>;
    }
  };

  return (
    <AppLayout
      title="Incoming Buyer Orders"
      subtitle="Review buyer purchase requests, confirm stock reservation, or reject unavailable requests."
      breadcrumb="Farmer / Incoming Orders"
    >
      <div className="space-y-6">
        {/* Filter Toolbar */}
        <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123524]">
              <Filter className="w-4 h-4 text-[#075B2A]" />
              <span>Filter Status:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7FAF5] border border-[#DDE8DF] text-xs text-[#123524] rounded-xl px-3 py-2 focus:outline-none focus:border-[#075B2A]"
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

          <div className="text-xs text-[#66756B]">
            Total Requests: <strong className="text-[#123524] font-bold">{total}</strong>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-2" />
            <p className="text-xs">Loading order requests...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-soft">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#075B2A]">
              <Sprout className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#123524] mb-1">No Incoming Orders</h3>
            <p className="text-xs text-[#66756B] leading-relaxed">
              When buyers place orders for your crop listings, they will appear here for your review and confirmation.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const isPending = order.status === 'PENDING';
              return (
                <div
                  key={order.id}
                  className="bg-white border border-[#DDE8DF] hover:border-[#075B2A] rounded-2xl p-6 transition-all duration-200 shadow-soft hover:shadow-card flex flex-col md:flex-row md:items-center justify-between gap-6"
                >
                  <div className="space-y-3 flex-1">
                    <div className="flex flex-wrap items-center gap-3">
                      <span className="text-xs font-bold text-[#66756B]">Order #{order.id}</span>
                      {getStatusBadge(order.status)}
                    </div>

                    <h3 className="text-lg font-bold text-[#123524]">
                      {order.crop?.name || 'Crop Yield'}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F7FAF5] p-3.5 rounded-xl border border-[#DDE8DF] max-w-2xl">
                      <div>
                        <span className="text-[#66756B] text-[10px]">Buyer Name:</span>
                        <div className="font-semibold text-[#123524] truncate">{order.buyer?.full_name || 'Buyer'}</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[10px]">Quantity:</span>
                        <div className="font-semibold text-[#123524]">{order.quantity} {order.crop?.unit || 'kg'}</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[10px]">Unit Price:</span>
                        <div className="font-semibold text-[#123524]">₹{order.unit_price}</div>
                      </div>
                      <div>
                        <span className="text-[#66756B] text-[10px]">Total Amount:</span>
                        <div className="font-bold text-[#075B2A]">₹{order.total_amount}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-[#66756B] pt-1">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> Delivery To: {order.delivery_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#66756B]" /> Placed: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>

                    {order.notes && (
                      <p className="text-[11px] text-[#123524] bg-[#F7FAF5] px-3 py-1.5 rounded-xl border border-[#DDE8DF] w-fit">
                        Buyer Note: {order.notes}
                      </p>
                    )}
                  </div>

                  {/* Accept / Reject Action Controls */}
                  {isPending ? (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleAccept(order.id)}
                        className="px-4 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-semibold rounded-xl shadow-soft flex items-center gap-1.5 transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {processingId === order.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                        <span>Accept Order</span>
                      </button>

                      <button
                        disabled={processingId === order.id}
                        onClick={() => handleReject(order.id, order.crop?.name)}
                        className="px-4 py-2.5 bg-white hover:bg-rose-50 border border-[#DDE8DF] hover:border-rose-300 text-rose-700 text-xs font-semibold rounded-xl transition-all disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  ) : (
                    <div className="text-right shrink-0">
                      <span className="text-[11px] text-[#66756B]">Status:</span>
                      <div className="font-bold text-xs text-[#123524]">{order.status}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
