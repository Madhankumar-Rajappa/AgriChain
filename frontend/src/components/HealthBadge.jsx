import React, { useEffect, useState } from 'react';
import { fetchHealthCheck } from '../api/health';
import { CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function HealthBadge() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkHealth = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchHealthCheck();
      setHealth(data);
    } catch (err) {
      setError(err.message || 'Failed to connect to backend server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  if (loading) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F8F3] border border-[#DDE8DF] text-[#66756B] text-xs font-medium animate-pulse">
        <RefreshCw className="w-3 h-3 animate-spin text-[#0B7A36]" />
        <span>Connecting API...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
        <span>Backend Offline</span>
        <button 
          onClick={checkHealth} 
          className="ml-1 underline hover:text-amber-900 text-3xs font-semibold"
          title="Retry health check"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#EAF5EC] border border-[#DDE8DF] text-[#075B2A] text-xs font-medium shadow-xs">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-[#075B2A]"></span>
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-[#075B2A]" />
      <span className="font-semibold" title={`API v${health?.version || '1.0.0'} • DB: ${health?.database || 'connected'}`}>
        All Systems Operational
      </span>
    </div>
  );
}
