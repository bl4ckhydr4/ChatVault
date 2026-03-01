
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { User } from './types';

// Pages
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Imports from './pages/Imports';
import BatchDetail from './pages/BatchDetail';
import Threads from './pages/Threads';
import ThreadView from './pages/ThreadView';
import AnalystConsole from './pages/AnalystConsole';
import Settings from './pages/Settings';
import PromptEnhancer from './pages/PromptEnhancer';

const Sidebar: React.FC<{ user: User; onLogout: () => void }> = ({ user, onLogout }) => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Overview', icon: 'fa-table-columns' },
    { path: '/enhancer', label: 'Prompt Enhancer', icon: 'fa-wand-magic-sparkles' },
    { path: '/console', label: 'AI Navigator', icon: 'fa-compass' },
    { path: '/imports', label: 'Data Ingestion', icon: 'fa-cloud-arrow-up' },
    { path: '/threads', label: 'Evidence Vault', icon: 'fa-database' },
    { path: '/settings', label: 'Configuration', icon: 'fa-sliders' },
  ];

  return (
    <div className="w-64 flex flex-col h-screen bg-[#121212]/90 backdrop-blur-xl border-r border-white/5 shrink-0 z-20">
      <div className="p-6">
        <div className="flex items-center space-x-3 mb-10">
          <div className="w-10 h-10 bg-[#d4a373] rounded-xl flex items-center justify-center text-[#121212] shadow-[0_0_20px_rgba(212,163,115,0.2)]">
            <i className="fa-solid fa-layer-group text-xl"></i>
          </div>
          <span className="text-2xl font-bold tracking-tighter italic text-white">ScopeX</span>
        </div>

        <nav className="space-y-1">
          {navItems.map(item => (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex items-center space-x-3 px-4 py-3.5 rounded-xl text-[11px] font-bold uppercase tracking-widest transition-all ${
                location.pathname === item.path || (item.path === '/imports' && location.pathname.startsWith('/batches'))
                  ? 'bg-white/5 text-[#d4a373] shadow-inner' 
                  : 'text-[#9e9e9e] hover:text-[#e0e0e0] hover:bg-white/5'
              }`}
            >
              <i className={`fa-solid ${item.icon} w-5 text-center text-sm`}></i>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-6 border-t border-white/5">
        <div className="flex items-center justify-between">
          <div className="truncate pr-2">
            <p className="text-xs font-bold truncate text-white uppercase tracking-tight">{user.displayName || user.email}</p>
            <p className="text-[9px] text-[#d4a373] uppercase font-bold tracking-[0.2em] opacity-60">Auth_ID: {user.uid.slice(-4)}</p>
          </div>
          <button 
            onClick={onLogout}
            className="text-[#9e9e9e] hover:text-red-400 transition-colors"
          >
            <i className="fa-solid fa-power-off"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('vault_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('vault_user');
    setUser(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="w-16 h-16 border-2 border-white/10 border-t-[#d4a373] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <HashRouter>
      <div className="flex h-screen overflow-hidden text-[#e0e0e0]">
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Routes>
            <Route path="/auth" element={!user ? <Auth setUser={setUser} /> : <Navigate to="/" />} />
            <Route path="/" element={user ? <Dashboard user={user} /> : <Navigate to="/auth" />} />
            <Route path="/enhancer" element={user ? <PromptEnhancer user={user} /> : <Navigate to="/auth" />} />
            <Route path="/imports" element={user ? <Imports user={user} /> : <Navigate to="/auth" />} />
            <Route path="/batches/:batchId" element={user ? <BatchDetail user={user} /> : <Navigate to="/auth" />} />
            <Route path="/threads" element={user ? <Threads user={user} /> : <Navigate to="/auth" />} />
            <Route path="/threads/:threadId" element={user ? <ThreadView user={user} /> : <Navigate to="/auth" />} />
            <Route path="/console" element={user ? <AnalystConsole user={user} /> : <Navigate to="/auth" />} />
            <Route path="/settings" element={user ? <Settings user={user} /> : <Navigate to="/auth" />} />
          </Routes>
        </div>
      </div>
    </HashRouter>
  );
};

export default App;
