
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Thread, Batch } from '../types';

const Dashboard: React.FC<{ user: User }> = ({ user }) => {
  const [recentThreads, setRecentThreads] = useState<Thread[]>([]);
  const [recentBatches, setRecentBatches] = useState<Batch[]>([]);
  const [stats, setStats] = useState({ threads: 0, messages: 0, entities: 0 });

  useEffect(() => {
    const threads = JSON.parse(localStorage.getItem(`threads_${user.uid}`) || '[]');
    setRecentThreads(threads.slice(-5).reverse());
    
    const batches = JSON.parse(localStorage.getItem(`batches_${user.uid}`) || '[]');
    setRecentBatches(batches.slice(-3).reverse());

    const totalMessages = threads.reduce((acc: number, t: Thread) => acc + (t.messageCount || 0), 0);
    setStats({
      threads: threads.length,
      messages: totalMessages,
      entities: Math.floor(threads.length * 4.2) // Simulated projection
    });
  }, [user.uid]);

  return (
    <div className="p-8 max-w-6xl mx-auto w-full overflow-y-auto">
      <header className="mb-12">
        <div className="flex items-center space-x-3 mb-2">
          <span className="h-px w-8 bg-[#d4a373]"></span>
          <p className="text-[10px] text-[#d4a373] uppercase font-bold tracking-[0.4em]">Operational Ready</p>
        </div>
        <h1 className="text-4xl font-black italic tracking-tighter text-white">COMMAND OVERVIEW</h1>
      </header>

      {/* Stats Ribbon */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-[#d4a373]">
          <p className="text-[10px] font-bold text-[#9e9e9e] uppercase tracking-widest mb-1">Indexed Threads</p>
          <p className="text-3xl font-black italic text-white mono">{stats.threads.toString().padStart(3, '0')}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-blue-500">
          <p className="text-[10px] font-bold text-[#9e9e9e] uppercase tracking-widest mb-1">Intelligence Nodes</p>
          <p className="text-3xl font-black italic text-white mono">{stats.messages.toString().padStart(4, '0')}</p>
        </div>
        <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-green-500">
          <p className="text-[10px] font-bold text-[#9e9e9e] uppercase tracking-widest mb-1">Active Projects</p>
          <p className="text-3xl font-black italic text-white mono">003</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
        {/* Left Column: Evidence */}
        <section className="lg:col-span-2">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9e9e9e] flex items-center">
              <i className="fa-solid fa-microchip mr-3 text-[#d4a373]"></i>
              Recent Evidence Vault
            </h2>
            <Link to="/threads" className="text-[10px] font-bold text-[#d4a373] hover:underline uppercase tracking-widest">Access All</Link>
          </div>
          <div className="space-y-4">
            {recentThreads.length === 0 ? (
              <div className="p-20 glass-panel rounded-2xl text-center border-dashed border-white/5">
                <i className="fa-solid fa-inbox text-4xl mb-4 text-white/5"></i>
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">No intelligence recorded</p>
              </div>
            ) : (
              recentThreads.map(t => (
                <Link key={t.id} to={`/threads/${t.id}`} className="block glass-panel p-5 rounded-2xl hover:border-[#d4a373] transition-all group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[#d4a373]/5 rounded-full -mr-16 -mt-16 group-hover:bg-[#d4a373]/10 transition-colors"></div>
                  <div className="relative z-10">
                    <h3 className="font-bold text-base mb-1 group-hover:text-[#d4a373] transition-colors">{t.title || 'Untitled Thread'}</h3>
                    <div className="flex items-center text-[10px] text-[#9e9e9e] space-x-4 uppercase font-bold tracking-widest">
                      <span className="text-[#d4a373]/60">{t.sourcePlatform}</span>
                      <span className="opacity-30">|</span>
                      <span>{t.messageCount} Segments</span>
                      <span className="opacity-30">|</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </section>

        {/* Right Column: Ingestion Status */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xs font-bold uppercase tracking-[0.3em] text-[#9e9e9e]">Batch Monitor</h2>
            <Link to="/imports" className="text-[10px] font-bold text-[#d4a373] hover:underline uppercase tracking-widest">Protocol</Link>
          </div>
          <div className="space-y-4">
            {recentBatches.length === 0 ? (
              <div className="p-12 glass-panel rounded-2xl text-center border-dashed border-white/5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">Inactive</p>
              </div>
            ) : (
              recentBatches.map(batch => (
                <Link key={batch.id} to={`/batches/${batch.id}`} className="block glass-panel p-5 rounded-2xl hover:border-[#d4a373] transition-all">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-[10px] font-bold mono text-[#d4a373]">REF_{batch.id.split('-')[1]}</span>
                    <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded tracking-widest ${
                      batch.status === 'complete' ? 'bg-green-900/30 text-green-500' : 'bg-[#d4a373]/20 text-[#d4a373]'
                    }`}>
                      {batch.status}
                    </span>
                  </div>
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-2xl font-black italic text-white mono">{batch.doneFiles}/{batch.totalFiles}</p>
                      <p className="text-[9px] font-bold text-[#9e9e9e] uppercase tracking-widest">Files Processed</p>
                    </div>
                    <i className="fa-solid fa-circle-nodes text-[#d4a373]/20 text-xl"></i>
                  </div>
                </Link>
              ))
            )}
            
            <Link to="/imports" className="block w-full py-4 glass-panel border-dashed border-[#d4a373]/30 rounded-2xl text-center group hover:border-[#d4a373] transition-all">
              <i className="fa-solid fa-plus text-[#d4a373] mb-2 block group-hover:scale-110 transition-transform"></i>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4a373]">New Data Ingestion</span>
            </Link>
          </div>
        </section>
      </div>

      <div className="glass-panel p-8 rounded-3xl flex flex-col md:flex-row items-center space-y-6 md:space-y-0 md:space-x-10 relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-[#d4a373]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="w-20 h-20 bg-[#d4a373] rounded-2xl flex items-center justify-center text-[#121212] shadow-[0_0_40px_rgba(212,163,115,0.3)] shrink-0 transform -rotate-3 group-hover:rotate-0 transition-transform duration-500">
          <i className="fa-solid fa-compass text-3xl"></i>
        </div>
        <div className="flex-1 relative z-10">
          <h3 className="text-2xl font-black italic text-white mb-2 tracking-tighter">AI NAVIGATOR LIVE</h3>
          <p className="text-sm text-[#9e9e9e] mb-4 max-w-2xl leading-relaxed">Cross-thread intelligence retrieval is active. Query the entire vault for patterns, contradictions, or specific technical requirements using grounded RAG logic.</p>
          <Link to="/console" className="inline-block px-8 py-3 bg-[#d4a373] text-[#121212] rounded-xl font-black text-xs uppercase tracking-[0.3em] hover:bg-[#c69363] hover:shadow-[0_0_30px_rgba(212,163,115,0.4)] transition-all">
            Initiate Global Search
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
