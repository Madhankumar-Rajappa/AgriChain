import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, ShoppingBag, Truck, Warehouse, ShieldCheck, AlertCircle, ArrowRight, CheckCircle2, User, Mail, Lock, Loader2 } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    password: '',
    role: 'FARMER',
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const roles = [
    { id: 'FARMER', label: 'Farmer', icon: Sprout, desc: 'List crop yields, set expected prices, accept purchase orders' },
    { id: 'BUYER', label: 'Buyer', icon: ShoppingBag, desc: 'Browse fresh produce, place orders, complete payments' },
    { id: 'TRANSPORTER', label: 'Transporter', icon: Truck, desc: 'Dispatch vehicles, assign drivers, update live delivery status' },
    { id: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', icon: Warehouse, desc: 'Manage cold storage facilities and accept storage bookings' },
    { id: 'ADMIN', label: 'System Admin', icon: ShieldCheck, desc: 'Executive overview, supply chain analytics, platform metrics' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      if (err.response?.data?.detail) {
        setError(typeof err.response.data.detail === 'string' ? err.response.data.detail : JSON.stringify(err.response.data.detail));
      } else if (err.message === 'Network Error' || !err.response) {
        setError('Network Error: Unable to reach backend API. If you are on Vercel, please ensure VITE_API_URL is configured in your Vercel settings.');
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7FAF5] flex flex-col md:flex-row">
      {/* LEFT SIDE: Agriculture Branding Panel */}
      <div className="w-full md:w-5/12 lg:w-4/12 bg-gradient-to-b from-[#075B2A] to-[#064D25] text-white p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden">
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

        {/* Highlight Content */}
        <div className="my-10 space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-emerald-200 text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-[#84CC16]" />
            <span>Unified Agricultural Network</span>
          </div>

          <h2 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight">
            Join the Modern <br />
            <span className="text-[#84CC16]">AgriTech Ecosystem.</span>
          </h2>

          <p className="text-sm text-emerald-100/90 leading-relaxed max-w-sm">
            Whether you cultivate crops, procure wholesale harvest, manage storage facilities, or handle logistics — AgriChain connects your workflow.
          </p>

          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Tailored dashboards for all 5 supply chain roles</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Automated escrow payments and dispatch milestones</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-emerald-100">
              <CheckCircle2 className="w-4 h-4 text-[#84CC16] shrink-0" />
              <span>Cold storage capacity reservations in real-time</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-[11px] text-emerald-200/70 relative z-10">
          © {new Date().getFullYear()} AgriChain Inc. All rights reserved.
        </div>
      </div>

      {/* RIGHT SIDE: White Card Registration Form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 lg:p-14">
        <div className="max-w-xl w-full bg-white border border-[#DDE8DF] rounded-3xl p-8 sm:p-10 shadow-card">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-[#123524] tracking-tight">Create Account</h1>
            <p className="text-xs text-[#66756B] mt-1">
              Join the unified agricultural supply chain network today
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
              <label className="block text-xs font-semibold text-[#123524] mb-1.5">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-[#66756B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Ramesh Patel"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123524] mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-[#66756B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  placeholder="e.g. ramesh@agrichain.com"
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
                  minLength={6}
                  placeholder="Minimum 6 characters"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#DDE8DF] rounded-xl text-sm text-[#123524] placeholder-[#66756B]/60 focus:outline-none focus:border-[#075B2A] focus:ring-1 focus:ring-[#075B2A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#123524] mb-2">Select Your Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const selected = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-3 text-left rounded-xl border text-xs transition-all cursor-pointer ${
                        selected
                          ? 'bg-[#EAF5EC] border-[#075B2A] text-[#075B2A] ring-1 ring-[#075B2A]'
                          : 'bg-[#F7FAF5] border-[#DDE8DF] text-[#66756B] hover:border-[#0B7A36]'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-bold text-[#123524] mb-1">
                        <Icon className={`w-4 h-4 ${selected ? 'text-[#075B2A]' : 'text-[#66756B]'}`} />
                        <span>{r.label}</span>
                      </div>
                      <p className="text-[11px] text-[#66756B] line-clamp-2 leading-relaxed">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-[#075B2A] hover:bg-[#064D25] text-white font-semibold text-sm rounded-xl shadow-soft hover:shadow-card transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer pt-3"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Creating Account...
                </>
              ) : (
                <>
                  <span>Complete Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#66756B]">
            Already registered?{' '}
            <Link to="/login" className="text-[#075B2A] font-bold hover:underline">
              Sign In Here →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
