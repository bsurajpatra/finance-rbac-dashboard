import { useState } from 'react';
import api from './api/api';

function App() {
  const [healthStatus, setHealthStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkBackendHealth = async () => {
    setLoading(true);
    setError('');
    setHealthStatus('');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 600)); 
      
      const response = await api.get('/health');
      setHealthStatus(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to connect to backend. Verify the Node server is running on port 5000.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#0a0a0f] text-slate-50 overflow-hidden font-['Outfit'] px-4 py-8">
      {/* Background gradients */}
      <div className="absolute inset-0 z-[0]">
        <div className="absolute top-1/2 left-[15%] -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(109,40,217,0.1)_0%,transparent_50%)]"></div>
        <div className="absolute top-[30%] right-[15%] -translate-y-1/2 w-[100vw] h-[100vh] bg-[radial-gradient(circle_at_center,rgba(14,165,233,0.1)_0%,transparent_50%)]"></div>
      </div>

      <div className="relative z-[10] w-full max-w-xl bg-white/5 backdrop-blur-[20px] border border-white/10 rounded-3xl p-8 sm:p-12 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] transform-style-3d animate-[float_6s_ease-in-out_infinite]">
        
        {/* Glow circles attached to card */}
        <div className="absolute -top-[50px] -left-[50px] w-[200px] h-[200px] bg-purple-600 rounded-full blur-[60px] opacity-60 z-[-1] animate-[pulse_4s_alternate_infinite]"></div>
        <div className="absolute -bottom-[50px] -right-[50px] w-[200px] h-[200px] bg-sky-500 rounded-full blur-[60px] opacity-60 z-[-1] animate-[pulse_5s_alternate-reverse_infinite]"></div>

        <header className="text-center mb-10">
          <h1 className="text-4xl sm:text-5xl font-extrabold bg-gradient-to-br from-white to-slate-400 bg-clip-text text-transparent mb-2 tracking-tight">Finance RBAC System</h1>
          <p className="text-slate-400 text-lg font-light">Secure Role-Based Access Control Dashboard</p>
        </header>

        <div className="flex justify-center mb-10">
          <button 
            className="group relative bg-gradient-to-br from-purple-600 to-indigo-600 text-white px-10 py-4 rounded-full text-lg font-semibold overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:scale-[1.02] hover:shadow-[0_15px_25px_-10px_rgba(109,40,217,0.5),inset_0_0_15px_rgba(255,255,255,0.2)] active:translate-y-0 disabled:opacity-80 disabled:cursor-not-allowed disabled:hover:transform-none shadow-[0_10px_20px_-10px_rgba(109,40,217,0.5)]"
            onClick={checkBackendHealth}
            disabled={loading}
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Checking Pulse...
                </>
              ) : 'Ping Backend System'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
          </button>
        </div>

        <div className="min-h-[80px]">
          {healthStatus && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-black/20 border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 to-transparent animate-[fadeInUp_0.5s_ease-out_forwards]">
              <div className="shrink-0 w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">System Online</span>
                <span className="text-lg font-medium text-slate-50">{healthStatus}</span>
              </div>
            </div>
          )}
          
          {error && (
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-black/20 border border-red-500/30 bg-gradient-to-br from-red-500/10 to-transparent animate-[fadeInUp_0.5s_ease-out_forwards]">
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-500/20 text-red-500 flex items-center justify-center">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex flex-col">
                <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-1">Connection Failed</span>
                <span className="text-lg font-medium text-red-500">{error}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
