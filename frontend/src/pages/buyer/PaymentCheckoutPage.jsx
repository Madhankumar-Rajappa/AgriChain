import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
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
  RefreshCw
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
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <div className="max-w-xl mx-auto my-12 p-6 bg-white rounded-xl shadow-sm text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Order</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => navigate('/buyer/orders')}
            className="px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition"
          >
            Return to My Orders
          </button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-8">
        {/* Navigation header */}
        <div className="mb-6 flex items-center justify-between">
          <Link 
            to="/buyer/orders" 
            className="inline-flex items-center text-sm font-semibold text-slate-600 hover:text-emerald-600 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to My Orders
          </Link>
          <div className="flex items-center text-xs text-slate-500 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full border border-emerald-200">
            <Lock className="w-3.5 h-3.5 mr-1" /> 256-Bit SSL Mock Security
          </div>
        </div>

        {/* SUCCESS RECEIPT VIEW */}
        {successPayment ? (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl mx-auto">
            <div className="bg-emerald-600 text-white p-8 text-center">
              <CheckCircle2 className="w-16 h-16 mx-auto mb-3 text-emerald-100" />
              <h1 className="text-2xl font-bold">Payment Successful!</h1>
              <p className="text-emerald-100 text-sm mt-1">Transaction Completed Successfully</p>
            </div>

            <div className="p-8">
              <div className="bg-slate-50 rounded-xl p-5 mb-6 border border-slate-100 space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Transaction Reference</span>
                  <span className="font-mono font-bold text-slate-800">{successPayment.transaction_reference}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Order ID</span>
                  <span className="font-semibold text-slate-800">#{successPayment.order_id}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Payment Method</span>
                  <span className="font-semibold text-slate-800">{successPayment.payment_method.replace('MOCK_', '')}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Amount Paid</span>
                  <span className="text-lg font-extrabold text-emerald-600">₹{successPayment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Payment Date</span>
                  <span className="text-slate-700">{new Date(successPayment.paid_at || successPayment.created_at).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  to="/buyer/orders"
                  className="flex-1 py-3 text-center bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm"
                >
                  View Order Status
                </Link>
                <Link
                  to="/marketplace"
                  className="flex-1 py-3 text-center bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition"
                >
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        ) : (
          /* CHECKOUT FORM VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Payment Methods */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-900 mb-1">Select Payment Method</h2>
                <p className="text-xs text-slate-500 mb-5">All transactions are simulated for testing.</p>

                {error && (
                  <div className="mb-5 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm flex items-start">
                    <AlertCircle className="w-5 h-5 mr-2 shrink-0 text-red-500 mt-0.5" />
                    <div>{error}</div>
                  </div>
                )}

                {/* Method selector options */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_CARD')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_CARD'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <CreditCard className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_CARD' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm">Credit / Debit Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_UPI')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_UPI'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Smartphone className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_UPI' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm">UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_BANK')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_BANK'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Building2 className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_BANK' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm">Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('MOCK_WALLET')}
                    className={`p-4 rounded-xl border-2 text-left flex flex-col justify-between transition ${
                      paymentMethod === 'MOCK_WALLET'
                        ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900'
                        : 'border-slate-200 hover:border-slate-300 text-slate-700'
                    }`}
                  >
                    <Wallet className={`w-6 h-6 mb-2 ${paymentMethod === 'MOCK_WALLET' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span className="font-semibold text-sm">AgroWallet</span>
                  </button>
                </div>

                {/* Form fields based on selected payment method */}
                <form onSubmit={handlePayment} className="space-y-4">
                  {paymentMethod === 'MOCK_CARD' && (
                    <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="4532 •••• •••• 8892"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Expiry</label>
                          <input
                            type="text"
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="MM/YY"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-600 mb-1">CVV</label>
                          <input
                            type="password"
                            value={cvv}
                            onChange={(e) => setCvv(e.target.value)}
                            maxLength={3}
                            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500 outline-none"
                            placeholder="•••"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'MOCK_UPI' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Virtual Payment Address (VPA / UPI ID)</label>
                        <input
                          type="text"
                          value={upiId}
                          onChange={(e) => setUpiId(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                          placeholder="username@bank"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'MOCK_BANK' && (
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Select Bank</label>
                        <select
                          value={selectedBank}
                          onChange={(e) => setSelectedBank(e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
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
                    <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 text-sm text-emerald-900">
                      <div className="font-semibold mb-1 flex items-center">
                        <Wallet className="w-4 h-4 mr-1.5 text-emerald-600" /> AgroWallet Balance: ₹50,000.00
                      </div>
                      <p className="text-xs text-emerald-700">Payment will be instantly deducted from your verified wallet balance.</p>
                    </div>
                  )}

                  {/* SIMULATE FAILURE TOGGLE FOR TESTING */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="flex items-center justify-between p-3 bg-amber-50 rounded-xl border border-amber-200 cursor-pointer">
                      <div className="flex items-center space-x-2">
                        <RefreshCw className="w-4 h-4 text-amber-600" />
                        <span className="text-xs font-semibold text-amber-900">Simulate Payment Failure (Test Edge Case)</span>
                      </div>
                      <input
                        type="checkbox"
                        checked={simulateFailure}
                        onChange={(e) => setSimulateFailure(e.target.checked)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500 rounded border-amber-300"
                      />
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={processing}
                    className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processing Payment...</span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-5 h-5" />
                        <span>Pay ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} Now</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Right Column: Order Summary */}
            <div className="lg:col-span-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sticky top-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4 pb-3 border-b border-slate-100">Order Summary</h3>

                <div className="space-y-4 mb-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-bold text-slate-800">{order.crop?.name || `Crop #${order.crop_id}`}</h4>
                      <p className="text-xs text-slate-500">Farmer: {order.farmer?.full_name || `Farmer #${order.farmer_id}`}</p>
                    </div>
                    <span className="text-xs font-semibold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full">
                      {order.quantity} {order.crop?.unit || 'kg'}
                    </span>
                  </div>

                  <div className="space-y-2 text-sm text-slate-600 pt-2 border-t border-slate-100">
                    <div className="flex justify-between">
                      <span>Unit Price</span>
                      <span>₹{order.unit_price} / {order.crop?.unit || 'kg'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="flex justify-between text-emerald-700 font-medium">
                      <span>Escrow Processing Fee</span>
                      <span>FREE</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-200 flex justify-between items-center">
                    <span className="font-bold text-slate-900">Total Payable</span>
                    <span className="text-2xl font-extrabold text-emerald-600">
                      ₹{order.total_amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-xs text-slate-500 space-y-1">
                  <div className="font-semibold text-slate-700 mb-1">Delivery Destination:</div>
                  <p>{order.delivery_address}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PaymentCheckoutPage;
