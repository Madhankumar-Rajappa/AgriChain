import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7FAF5] flex flex-col items-center justify-center text-[#66756B]">
        <Loader2 className="w-10 h-10 animate-spin text-[#075B2A] mb-3" />
        <p className="text-sm font-semibold">Verifying secure agricultural credentials...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles.length > 0 && user.role !== 'ADMIN' && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-screen bg-[#F7FAF5] flex flex-col items-center justify-center px-4 text-center">
        <div className="p-8 bg-white border border-[#DDE8DF] rounded-3xl max-w-md shadow-soft">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-500 border border-rose-200 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-[#123524] mb-2">Access Restricted</h2>
          <p className="text-xs text-[#66756B] mb-6">
            Your user credential (<strong className="text-rose-700 font-bold">{user.role}</strong>) does not have authorization to view this module.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2.5 bg-[#075B2A] hover:bg-[#064D25] text-white text-xs font-bold rounded-xl shadow-soft transition-all"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return children;
}
