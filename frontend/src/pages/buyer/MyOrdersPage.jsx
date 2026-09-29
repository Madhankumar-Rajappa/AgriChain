import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchMyOrders, cancelOrder } from '../../api/orders';
import { fetchShipmentByOrderId } from '../../api/shipments';
import { ShoppingBag, Filter, RefreshCw, AlertCircle, MapPin, Calendar, XCircle, CheckCircle2, Clock, CreditCard, Radio } from 'lucide-react';

export default function MyOrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [trackingOrderId, setTrackingOrderId] = useState(null);

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

  const handleTrackOrder = async (orderId) => {
    setTrackingOrderId(orderId);
    try {
      const shipment = await fetchShipmentByOrderId(orderId);
      if (shipment?.id) {
        navigate(`/tracking/${shipment.id}`);
      } else {
        alert(`Shipment dispatch has not been created yet for Order #${orderId}.`);
      }
    } catch (err) {
      alert(err.response?.data?.detail || 'No shipment dispatch has been assigned to this order yet.');
    } finally {
      setTrackingOrderId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1"><Clock className="w-3 h-3" /> PENDING ACCEPTANCE</span>;
      case 'ACCEPTED':
      case 'PAYMENT_PENDING':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-800 border border-teal-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> PAYMENT PENDING</span>;
      case 'PAID':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EAF5EC] text-[#075B2A] border border-[#DDE8DF]">PAID</span>;
      case 'REJECTED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-800 border border-rose-200 flex items-center gap-1"><XCircle className="w-3 h-3" /> REJECTED</span>;
      case 'CANCELLED':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#F5F8F3] text-[#66756B] border border-[#DDE8DF]">CANCELLED</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-800 border border-blue-200">{status}</span>;
    }
  };

  return (
    <AppLayout
      title="My Crop Orders"
      subtitle="Track your procurement history, order statuses, and mock payments."
      breadcrumb="Buyer / Orders"
    >
      <div className="space-y-6">
        {/* Actions & Filters */}
        <div className="bg-white border border-[#DDE8DF] rounded-2xl p-4 sm:p-5 shadow-soft flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#123524]">
              <Filter className="w-4 h-4 text-[#075B2A]" />
              <span>Status Filter:</span>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#F7FAF5] border border-[#DDE8DF] text-xs text-[#123524] rounded-xl px-3 py-2 focus:outline-none focus:border-[#075B2A]"
            >
              <option value="">All Orders</option>
              <option value="PENDING">Pending</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="PAYMENT_PENDING">Payment Pending</option>
              <option value="PAID">Paid</option>
              <option value="REJECTED">Rejected</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
            <span className="text-xs text-[#66756B]">
              Total Placed: <strong className="text-[#123524] font-bold">{total}</strong>
            </span>
          </div>

          <Link
            to="/marketplace"
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-xs rounded-xl shadow-soft transition-all"
          >
            <ShoppingBag className="w-4 h-4" /> Browse Marketplace
          </Link>
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-[#66756B]">
            <RefreshCw className="w-8 h-8 animate-spin text-[#075B2A] mb-2" />
            <p className="text-xs">Loading your order history...</p>
          </div>
        ) : error ? (
          <div className="p-5 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs max-w-md mx-auto my-12 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-[#DDE8DF] rounded-3xl p-12 text-center max-w-lg mx-auto my-8 shadow-card">
            <div className="w-16 h-16 rounded-full bg-[#EAF5EC] flex items-center justify-center mx-auto mb-4 text-[#075B2A]">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#123524] mb-1">No Orders Placed Yet</h3>
            <p className="text-xs text-[#66756B] mb-6 leading-relaxed">
              Explore the live marketplace to discover verified fresh crops directly from farmers.
            </p>
            <Link
              to="/marketplace"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-semibold rounded-xl shadow-soft"
            >
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const canPay = order.status === 'ACCEPTED' || order.status === 'PAYMENT_PENDING';
              const canCancel = order.status === 'PENDING' || order.status === 'ACCEPTED' || order.status === 'PAYMENT_PENDING';

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
                      {order.crop?.name || 'Crop Harvest'}
                    </h3>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-[#F7FAF5] p-3.5 rounded-xl border border-[#DDE8DF] max-w-2xl">
                      <div>
                        <span className="text-[#66756B] text-[10px]">Farmer:</span>
                        <div className="font-semibold text-[#123524] truncate">{order.farmer?.full_name || 'Farmer'}</div>
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
                        <MapPin className="w-3.5 h-3.5 text-[#075B2A]" /> Destination: {order.delivery_address}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-[#66756B]" /> Ordered on: {new Date(order.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div className="flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-2 shrink-0">
                    {['READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'COMPLETED', 'PAID', 'STORAGE_PENDING'].includes(order.status) && (
                      <button
                        onClick={() => handleTrackOrder(order.id)}
                        disabled={trackingOrderId === order.id}
                        className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-soft flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
                      >
                        <Radio className="w-4 h-4 animate-pulse" />
                        <span>{trackingOrderId === order.id ? 'Locating...' : 'Track Live Shipment'}</span>
                      </button>
                    )}

                    {canPay && (
                      <Link
                        to={`/orders/${order.id}/pay`}
                        className="px-5 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft flex items-center justify-center gap-1.5 transition-all"
                      >
                        <CreditCard className="w-4 h-4" /> Pay Now (₹{order.total_amount})
                      </Link>
                    )}

                    {canCancel && (
                      <button
                        onClick={() => handleCancelOrder(order.id, order.crop?.name)}
                        className="px-4 py-2 bg-white hover:bg-rose-50 border border-[#DDE8DF] hover:border-rose-200 text-rose-700 text-xs font-medium rounded-xl transition-colors cursor-pointer"
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
      </div>
    </AppLayout>
  );
}
