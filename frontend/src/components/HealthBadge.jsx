import React, { useEffect, useState } from 'react';
import { fetchHealthCheck } from '../api/health';
import { Activity, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

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
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400 text-xs font-medium animate-pulse">
        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
        Checking API Health...
      </div>
    );
  }

  if (error) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-950/60 border border-amber-800/60 text-amber-300 text-xs font-medium">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
        Backend Disconnected
        <button 
          onClick={checkHealth} 
          className="ml-1 underline hover:text-amber-200 text-2xs"
          title="Retry health check"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-800/50 text-emerald-300 text-xs font-medium backdrop-blur-sm">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
      <span>Backend Operational (v{health?.version || '1.0.0'})</span>
      <span className="text-slate-500">•</span>
      <span className="text-slate-400">DB: {health?.database}</span>
    </div>
  );
}
