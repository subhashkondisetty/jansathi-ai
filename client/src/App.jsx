import { useState, useEffect, useCallback } from 'react';
import api from './services/api.js';

export default function App() {
  const [healthData, setHealthData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchHealth = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/health');
      if (response.data && response.data.success) {
        setHealthData(response.data.data);
      } else {
        throw new Error('Unexpected response format');
      }
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Cannot reach server');
      setHealthData(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHealth();
  }, [fetchHealth]);

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden">
        {/* Header */}
        <header className="bg-slate-900 text-white px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight">JanSathi AI</h1>
              <p className="text-xs text-slate-400 mt-0.5">Civic Information Assistant</p>
            </div>
            <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              Phase 1
            </span>
          </div>
        </header>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              System Health
            </h2>
            <button
              onClick={fetchHealth}
              disabled={loading}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking...' : 'Refresh Status'}
            </button>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-sm text-slate-600 font-medium">
                Connecting to JanSathi AI server...
              </p>
              <p className="text-xs text-slate-400 mt-1">Calling GET /api/health</p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-rose-100 text-rose-600 mb-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <p className="text-sm font-semibold text-rose-800">Cannot reach server</p>
              <p className="text-xs text-rose-600 mt-1 break-words">{error}</p>
              <button
                onClick={fetchHealth}
                className="mt-4 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
              >
                Retry Connection
              </button>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && healthData && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2 bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-emerald-800">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-xs font-semibold">Server is reachable and operating</span>
              </div>

              <dl className="grid grid-cols-1 gap-2.5 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Service</dt>
                  <dd className="font-mono font-semibold text-slate-800">{healthData.service}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Status</dt>
                  <dd className="inline-flex items-center px-2 py-0.5 rounded text-emerald-700 bg-emerald-100 font-semibold uppercase">
                    {healthData.status}
                  </dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Environment</dt>
                  <dd className="font-mono text-slate-700 capitalize">{healthData.environment}</dd>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <dt className="text-slate-500 font-medium">Uptime</dt>
                  <dd className="font-mono text-slate-700">{healthData.uptimeSeconds}s</dd>
                </div>
                <div className="flex flex-col py-2">
                  <dt className="text-slate-500 font-medium mb-1">Timestamp (UTC)</dt>
                  <dd className="font-mono text-[11px] text-slate-600 break-all bg-slate-50 p-1.5 rounded border border-slate-100">
                    {healthData.timestamp}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="bg-slate-50 px-6 py-3 border-t border-slate-200 text-center">
          <p className="text-[11px] text-slate-500">
            FORGE &apos;26 &bull; Theme 1 &quot;Civic Pulse&quot;
          </p>
        </footer>
      </div>
    </main>
  );
}
