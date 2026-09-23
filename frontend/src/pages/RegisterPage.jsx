import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { UserPlus, Sprout, ShoppingBag, Truck, Warehouse, Shield, AlertCircle, ArrowRight } from 'lucide-react';

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
    { id: 'FARMER', label: 'Farmer', icon: Sprout, desc: 'List crops, accept orders, manage harvest sales' },
    { id: 'BUYER', label: 'Buyer', icon: ShoppingBag, desc: 'Browse produce, place orders, complete payments' },
    { id: 'TRANSPORTER', label: 'Transporter', icon: Truck, desc: 'Accept deliveries, update logistics status' },
    { id: 'WAREHOUSE_MANAGER', label: 'Warehouse Manager', icon: Warehouse, desc: 'Allocate storage capacity, manage facilities' },
    { id: 'ADMIN', label: 'Admin / Agriculture Officer', icon: Shield, desc: 'System overview, user management, market prices' },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await register(formData);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-emerald-950 text-emerald-400 border border-emerald-800/60 rounded-2xl mb-2">
              <UserPlus className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-100">Create AgriChain Account</h2>
            <p className="text-xs text-slate-400">Join the unified agricultural supply chain network</p>
          </div>

          {error && (
            <div className="p-4 bg-rose-950/70 border border-rose-800 text-rose-300 rounded-xl text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <input
                type="text"
                required
                placeholder="e.g. John Doe"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
              <input
                type="email"
                required
                placeholder="e.g. john@agrichain.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={6}
                placeholder="Minimum 6 characters"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-2">Select Your System Role</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {roles.map((r) => {
                  const Icon = r.icon;
                  const selected = formData.role === r.id;
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, role: r.id })}
                      className={`p-3 text-left rounded-xl border text-xs transition-all ${
                        selected
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 ring-1 ring-emerald-500'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2 font-semibold text-slate-200 mb-0.5">
                        <Icon className={`w-4 h-4 ${selected ? 'text-emerald-400' : 'text-slate-500'}`} />
                        <span>{r.label}</span>
                      </div>
                      <p className="text-3xs text-slate-400 line-clamp-2">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting ? 'Creating Account...' : 'Complete Registration'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <p className="text-center text-xs text-slate-400">
            Already registered?{' '}
            <Link to="/login" className="text-emerald-400 font-semibold hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
