import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, Mail, Lock, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, Zap, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/dashboard';

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(null);

  const demoAccounts = [
    { role: 'Farmer', email: 'farmer@agrichain.com', pass: 'Farmer123!' },
    { role: 'Buyer', email: 'buyer@agrichain.com', pass: 'Buyer123!' },
    { role: 'Transporter', email: 'transporter@agrichain.com', pass: 'Transporter123!' },
    { role: 'Warehouse', email: 'warehouse@agrichain.com', pass: 'Warehouse123!' },
    { role: 'Admin', email: 'admin@agrichain.com', pass: 'Admin123!' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(formData);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoFill = async (acc) => {
    setDemoLoading(acc.role);
    setError('');
    try {
      await login({ email: acc.email, password: acc.pass });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.response?.data?.detail || `Failed to log in as ${acc.role}.`);
    } finally {
      setDemoLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF5] flex flex-col md:flex-row">
      {/* LEFT SIDE: Agriculture Branding Panel */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-gradient-to-b from-[#075B2A] to-[#064D25] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle decorative circles */}
        <div className="absolute -top-16 -right-16 w-64 h-64 rounded-full bg-white/5 pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-white/5 pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="p-2.5 bg-[#0B7A36] rounded-2xl shadow-md text-white group-hover:scale-105 transition-transform">
              <Sprout className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-white block">AgriChain</span>
              <span className="text-[10px] text-emerald-200 tracking-wider uppercase">Supply Chain Platform</span>
            </div>
          </Link>
        </div>

        {/* Middle Feature Highlights */}
        <div className="my-10 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
            <span>Trusted by 10,000+ Agricultural Stakeholders</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            Empowering Farmers, <br />
            <span className="text-[#84CC16]">Connecting Markets.</span>
          </h2>

          <p className="text-sm text-emerald-100/90 leading-relaxed max-w-sm">
            Access transparent crop prices, verified buyers, cold storage facilities, and real-time transit logistics in one unified platform.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Direct farmer-to-buyer transparent pricing</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Real-time logistics & cold storage integration</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Zero intermediary markups & secure escrow</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[11px] text-emerald-200/70 relative z-10">
          © {new Date().getFullYear()} AgriChain Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: White Card Authentication Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="max-w-md w-full bg-white border border-[#DDE8DF] rounded-3xl p-8 sm:p-10 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#123524] tracking-tight">Welcome Back</h1>
            <p className="text-xs text-[#66756B] mt-1">
              Sign in to your AgriChain account to manage your supply chain
            </p>
          </div>

          {error && (
            <div className="p-4 mb-6 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#123524] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66756B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123524] mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#66756B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting || demoLoading !== null}
              className="w-full py-3 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-sm rounded-xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Authenticating...
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Fill Buttons */}
          <div className="mt-6 pt-5 border-t border-[#EBF2ED]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#66756B] flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-amber-500" /> Instant Demo Sign In
              </span>
              <span className="text-[10px] text-[#66756B]">Click to test role</span>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
              {demoAccounts.map((acc) => (
                <button
                  key={acc.role}
                  type="button"
                  disabled={demoLoading !== null || submitting}
                  onClick={() => handleDemoFill(acc)}
                  className="py-1.5 px-2 bg-[#F5F8F3] hover:bg-[#EAF5EC] hover:text-[#075B2A] text-[#123524] text-[11px] font-medium rounded-lg border border-[#DDE8DF] transition-all truncate"
                  title={`Sign In as ${acc.role}`}
                >
                  {demoLoading === acc.role ? '...' : acc.role}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-[#66756B]">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-[#075B2A] font-bold hover:underline">
              Create an Account →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
