import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '../../components/AppLayout';
import { fetchOrderDetails } from '../../api/orders';
import { processPayment } from '../../api/payments';
import { 
  CreditCard, 
  Smartphone, 
  Building2, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  Lock, 
  ShieldCheck,
  RefreshCw,
  Loader2,
  Receipt,
  Package
} from 'lucide-react';

const PaymentCheckoutPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [successPayment, setSuccessPayment] = useState(null);

  // Form states
  const [paymentMethod, setPaymentMethod] = useState('MOCK_CARD');
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Dummy inputs for UI interaction
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [expiry, setExpiry] = useState('12/28');
  const [cvv, setCvv] = useState('123');
  const [upiId, setUpiId] = useState('buyer@upi');
  const [selectedBank, setSelectedBank] = useState('SBI - State Bank of India');

  useEffect(() => {
    loadOrder();
  }, [orderId]);

  const loadOrder = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await fetchOrderDetails(orderId);
      setOrder(data);
    } catch (err) {
      console.error('Failed to load order:', err);
      setError(err.response?.data?.detail || 'Failed to load order details.');
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setError('');

    try {
      const payload = {
        order_id: parseInt(orderId),
        payment_method: paymentMethod,
        simulate_failure: simulateFailure
      };

      const payment = await processPayment(payload);
      setSuccessPayment(payment);
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.detail || 'Payment failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex flex-col items-center justify-center min-h-[55vh]">
          <Loader2 className="w-10 h-10 animate-spin text-[#075B2A] mb-3" />
          <p className="text-sm font-semibold text-[#66756B]">Loading secure payment gateway...</p>
        </div>
      </AppLayout>
    );
  }

  if (error && !order) {
    return (
      <AppLayout>
        <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl border border-[#DDE8DF] shadow-soft text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#123524] mb-2">Error Loading Order</h2>
          <p className="text-sm text-[#66756B] mb-6">{error}</p>
          <button 
            onClick={() => navigate('/buyer/orders')}
            className="px-6 py-2.5 bg-[#075B2A] text-white font-bold rounded-xl hover:bg-[#064D25] transition-all shadow-soft"
          >
            Return to My Orders
          </button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Navigation header */}
        <div className="flex items-center justify-between">
          <Link 
            to="/buyer/orders" 
            className="inline-flex items-center text-sm font-semibold text-[#66756B] hover:text-[#075B2A] transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Orders
          </Link>
          <div className="flex items-center text-xs font-semibold text-[#075B2A] bg-[#EAF5EC] px-3.5 py-1.5 rounded-full border border-[#DDE8DF]">
            <Lock className="w-3.5 h-3.5 mr-1.5" /> 256-Bit SSL Escrow Protected
          </div>
        </div>

        {/* SUCCESS RECEIPT VIEW */}
        {successPayment ? (
          <div className="bg-white rounded-3xl shadow-soft border border-[#DDE8DF] overflow-hidden max-w-2xl mx-auto">
            <div className="bg-[#075B2A] text-white p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-emerald-200" />
              <h1 className="text-2xl font-bold">Payment Completed!</h1>
              <p className="text-emerald-100 text-sm mt-1">Escrow payment captured & verified for Order #{orderId}</p>
            </div>

            <div className="p-8">
              <div className="bg-[#F7FAF5] rounded-2xl p-6 mb-6 border border-[#DDE8DF] space-y-3.5">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#66756B]">Transaction Reference</span>
                  <span className="font-mono font-bold text-[#123524]">{successPayment.transaction_reference}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#66756B]">Order ID</span>
                  <span className="font-bold text-[#123524]">#{successPayment.order_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#66756B]">Payment Method</span>
                  <span className="font-semibold text-[#123524]">{successPayment.payment_method.replace('MOCK_', '')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#66756B]">Amount Paid</span>
                  <span className="text-xl font-extrabold text-[#075B2A]">
                    ₹{successPayment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-[#66756B]">Payment Date</span>
                  <span className="text-[#123524] font-medium">{new Date(successPayment.paid_at || successPayment.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/buyer/orders"
                  className="flex-1 py-3 text-center bg-[#075B2A] text-white font-bold rounded-xl hover:bg-[#064D25] transition shadow-soft"
                >
                  View Order Tracking
                </Link>
                <Link
                  to="/marketplace"
                  className="flex-1 py-3 text-center bg-[#F7FAF5] text-[#123524] font-semibold rounded-xl hover:bg-[#EAF5EC] border border-[#DDE8DF] transition"
                >
                  Explore Marketplace
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl shadow-soft border border-[#DDE8DF] p-7">
                <h2 className="text-xl font-bold text-[#123524] mb-1">Select Payment Channel</h2>
                <p className="text-xs text-[#66756B] mb-6">Choose your preferred settlement method for agricultural escrow.</p>

                {error && (
                  <div className="mb-6 p-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-sm flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2.5 shrink-0 text-rose-500 mt-0.5" />
                    <div className="font-medium">{error}</div>
                  </div>
                )}

                {/* Method selector options */}
                <div className="grid grid-cols-2 gap-3.5 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_CARD')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_CARD'
                        ? 'border-[#075B2A] bg-[#EAF5EC] text-[#075B2A]'
                        : 'border-[#DDE8DF] hover:border-slate-300 text-[#66756B] bg-white'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_CARD' ? 'text-[#075B2A]' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-[#123524]">Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_UPI')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_UPI'
                        ? 'border-[#075B2A] bg-[#EAF5EC] text-[#075B2A]'
                        : 'border-[#DDE8DF] hover:border-slate-300 text-[#66756B] bg-white'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_UPI' ? 'text-[#075B2A]' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-[#123524]">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_BANK')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_BANK'
                        ? 'border-[#075B2A] bg-[#EAF5EC] text-[#075B2A]'
                        : 'border-[#DDE8DF] hover:border-slate-300 text-[#66756B] bg-white'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_BANK' ? 'text-[#075B2A]' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-[#123524]">Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_WALLET')}
                    className={`p-4 rounded-2xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_WALLET'
                        ? 'border-[#075B2A] bg-[#EAF5EC] text-[#075B2A]'
                        : 'border-[#DDE8DF] hover:border-slate-300 text-[#66756B] bg-white'
                    }`}
                  >
                    <Wallet className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_WALLET' ? 'text-[#075B2A]' : 'text-slate-400'}`} />
                    <span className="font-bold text-sm text-[#123524]">AgroWallet</span>
                  </button>
                </div>

                {/* Form fields based on selected payment method */}
                <form onSubmit={handlePayment} className="space-y-4">
                  {paymentMethod === 'MOCK_CARD' && (
                    <div className="space-y-3 bg-[#F7FAF5] p-5 rounded-2xl border border-[#DDE8DF]">
                      <div>
                        <label className="block text-xs font-bold text-[#123524] mb-1.5">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm font-mono text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                          placeholder="4532 •••• •••• 8892"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3.5">
                        <div>
                          <label className="block text-xs font-bold text-[#123524] mb-1.5">Expiry Date</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-[#123524] mb-1.5">CVV</label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            maxLength={3}
                            className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm font-mono text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'MOCK_UPI' && (
                    <div className="bg-[#F7FAF5] p-5 rounded-2xl border border-[#DDE8DF] space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#123524] mb-1.5">Virtual Payment Address (VPA / UPI ID)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                          placeholder="username@bank"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'MOCK_BANK' && (
                    <div className="bg-[#F7FAF5] p-5 rounded-2xl border border-[#DDE8DF] space-y-3">
                      <div>
                        <label className="block text-xs font-bold text-[#123524] mb-1.5">Select Settlement Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] focus:ring-2 focus:ring-[#075B2A] focus:border-[#075B2A] outline-none"
                        >
                          <option>SBI - State Bank of India</option>
                          <option>HDFC Bank</option>
                          <option>ICICI Bank</option>
                          <option>Punjab National Bank (PNB)</option>
                          <option>NABARD Farmer Co-op Bank</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'MOCK_WALLET' && (
                    <div className="bg-[#EAF5EC] p-5 rounded-2xl border border-[#DDE8DF] text-sm text-[#123524]">
                      <div className="font-bold mb-1 flex items-center text-[#075B2A]">
                        <Wallet className="w-4 h-4 mr-2" /> AgroWallet Balance: ₹50,000.00
                      </div>
                      <p className="text-xs text-[#66756B]">Settlement will be instantly debited from your verified digital agricultural wallet balance.</p>
                    </div>
                  )}

                  {/* SIMULATE FAILURE TOGGLE FOR TESTING */}
                  <div className="pt-2">
                    <label className="flex items-center justify-between p-3.5 bg-amber-50 rounded-2xl border border-amber-200 cursor-pointer">
                      <div className="flex items-center space-x-2.5">
                        <RefreshCw className="w-4 h-4 text-amber-700" />
                        <span className="text-xs font-semibold text-amber-900">Simulate Payment Gateway Failure (Edge Case Test)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="w-4 h-4 accent-[#075B2A] rounded border-amber-300"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-4 px-5 bg-[#075B2A] hover:bg-[#064D25] text-white font-bold rounded-xl transition shadow-soft flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Escrow Authorization...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pay ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} to Escrow</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-3xl shadow-soft border border-[#DDE8DF] p-6 sticky top-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-[#DDE8DF]">
                  <Receipt className="w-5 h-5 text-[#075B2A]" />
                  <h3 className="text-lg font-bold text-[#123524]">Order Summary</h3>
                </div>

                <div className="space-y-4 my-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-[#123524]">{order.crop?.name || `Crop #${order.crop_id}`}</h4>
                      <p className="text-xs text-[#66756B] mt-0.5">Farmer: {order.farmer?.full_name || `Farmer #${order.farmer_id}`}</p>
                    </div>
                    <span className="text-xs font-bold bg-[#EAF5EC] text-[#075B2A] px-3 py-1 rounded-full border border-[#DDE8DF]">
                      {order.quantity} {order.crop?.unit || 'kg'}
                    </span>
                  </div>

                  <div className="space-y-2.5 text-sm text-[#66756B] pt-3 border-t border-[#DDE8DF]">
                    <div className="flex justify-between">
                      <span>Unit Rate</span>
                      <span className="font-medium text-[#123524]">₹{order.unit_price} / {order.crop?.unit || 'kg'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Harvest Subtotal</span>
                      <span className="font-medium text-[#123524]">₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-[#075B2A] font-medium">
                      <span>Escrow Platform Fee</span>
                      <span className="font-bold">FREE (0%)</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#DDE8DF] flex justify-between items-baseline">
                    <span className="font-bold text-[#123524]">Total Payable</span>
                    <span className="text-2xl font-extrabold text-[#075B2A]">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-[#F7FAF5] rounded-2xl p-4 border border-[#DDE8DF] text-xs text-[#66756B] space-y-1">
                  <div className="font-bold text-[#123524] mb-1 flex items-center">
                    <Package className="w-3.5 h-3.5 mr-1.5 text-[#075B2A]" /> Destination Address:
                  </div>
                  <p className="text-[#123524]">{order.delivery_address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default PaymentCheckoutPage;
