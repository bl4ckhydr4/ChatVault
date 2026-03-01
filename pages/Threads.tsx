
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, Thread } from '../types';

const Threads: React.FC<{ user: User }> = ({ user }) => {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setThreads(JSON.parse(localStorage.getItem(`threads_${user.uid}`) || '[]'));
  }, [user.uid]);

  const filtered = threads.filter(t => 
    t.title?.toLowerCase().includes(search.toLowerCase()) || 
    t.sourcePlatform?.toLowerCase().includes(search.toLowerCase())
  ).reverse();

  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <header className="mb-12 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold mb-2">Evidence Vault</h1>
          <p className="text-[#9e9e9e]">Browse and search immutably stored transcripts.</p>
        </div>
        <div className="relative w-64">
          <i className="fa-solid fa-search absolute left-3 top-3 text-[#9e9e9e] text-xs"></i>
          <input 
            type="text" 
            placeholder="FILTER BY TITLE..."
            className="w-full bg-[#1a1a1a] border border-[#2d2d2d] rounded px-8 py-2 text-xs font-bold uppercase tracking-widest outline-none focus:border-[#d4a373] transition-colors"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4">
        {filtered.length === 0 ? (
          <div className="p-20 border border-dashed border-[#2d2d2d] rounded-lg text-center text-[#9e9e9e]">
            No records match your query.
          </div>
        ) : (
          filtered.map(t => (
            <Link key={t.id} to={`/threads/${t.id}`} className="group p-5 bg-[#1a1a1a] border border-[#2d2d2d] rounded hover:border-[#d4a373] transition-all flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-[#242424] rounded flex items-center justify-center text-[#d4a373] group-hover:bg-[#d4a373] group-hover:text-[#121212] transition-colors">
                  <i className="fa-solid fa-file-lines"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm mb-1">{t.title || 'Untitled Thread'}</h3>
                  <div className="flex items-center text-[10px] text-[#9e9e9e] space-x-3 uppercase font-bold tracking-widest">
                    <span>{t.sourcePlatform}</span>
                    <span>•</span>
                    <span>{t.messageCount} Messages</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-[#9e9e9e] uppercase font-bold tracking-widest">{new Date(t.createdAt).toLocaleDateString()}</p>
                <p className="text-[10px] text-[#d4a373] font-bold mt-1 opacity-0 group-hover:opacity-100 transition-opacity">ACCESS_RECORDS &rarr;</p>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Threads;
