
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { User, Thread, Message, Analysis } from '../types';

const ThreadView: React.FC<{ user: User }> = ({ user }) => {
  const { threadId } = useParams<{ threadId: string }>();
  const [thread, setThread] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [activeTab, setActiveTab] = useState<'TRANSCRIPT' | 'INTEL'>('TRANSCRIPT');

  useEffect(() => {
    const threads = JSON.parse(localStorage.getItem(`threads_${user.uid}`) || '[]');
    const t = threads.find((t: Thread) => t.id === threadId);
    if (t) {
      setThread(t);
      setMessages(JSON.parse(localStorage.getItem(`messages_${threadId}`) || '[]'));
      setAnalysis(JSON.parse(localStorage.getItem(`analysis_${threadId}`) || 'null'));
    }
  }, [threadId, user.uid]);

  if (!thread) return <div className="p-8">Record not found.</div>;

  return (
    <div className="flex h-full overflow-hidden">
      {/* Primary Transcript Area */}
      <div className="flex-1 flex flex-col bg-[#121212] overflow-hidden border-r border-[#2d2d2d]">
        <div className="p-6 bg-[#1a1a1a] border-b border-[#2d2d2d] flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Link to="/threads" className="text-[#9e9e9e] hover:text-[#d4a373] transition-colors">
              <i className="fa-solid fa-chevron-left"></i>
            </Link>
            <div>
              <h1 className="text-lg font-bold truncate max-w-md">{thread.title}</h1>
              <p className="text-[10px] text-[#9e9e9e] uppercase font-bold tracking-widest">{thread.sourcePlatform} // {new Date(thread.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          <div className="flex bg-[#242424] p-1 rounded">
            <button 
              onClick={() => setActiveTab('TRANSCRIPT')}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'TRANSCRIPT' ? 'bg-[#d4a373] text-[#121212]' : 'text-[#9e9e9e] hover:text-[#e0e0e0]'}`}
            >
              Transcript
            </button>
            <button 
              onClick={() => setActiveTab('INTEL')}
              className={`px-3 py-1 text-[10px] font-bold uppercase rounded ${activeTab === 'INTEL' ? 'bg-[#d4a373] text-[#121212]' : 'text-[#9e9e9e] hover:text-[#e0e0e0]'}`}
            >
              Intel
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-12">
          {messages.map((m, i) => (
            <div key={i} className="group relative">
              <div className="flex items-center space-x-3 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest ${m.role === 'user' ? 'text-[#d4a373]' : 'text-[#9e9e9e]'}`}>
                  {m.role === 'user' ? 'AGENT' : 'ASSISTANT'}
                </span>
                <span className="text-[10px] text-[#2d2d2d] mono">[{i.toString().padStart(3, '0')}]</span>
              </div>
              <div className="text-sm leading-relaxed text-[#e0e0e0] max-w-3xl whitespace-pre-wrap pl-4 border-l border-[#2d2d2d] group-hover:border-[#d4a373] transition-colors">
                {m.contentText}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Analysis Panel (Hidden/Visible based on screen or tab) */}
      <div className={`w-96 bg-[#1a1a1a] flex flex-col shrink-0 ${activeTab === 'INTEL' ? 'block' : 'hidden lg:block'}`}>
        <div className="p-6 border-b border-[#2d2d2d]">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[#9e9e9e]">Intelligence Report</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {analysis ? (
            <>
              <div>
                <h3 className="text-[10px] font-bold text-[#d4a373] uppercase tracking-widest mb-2">Executive Summary</h3>
                <p className="text-sm font-medium leading-relaxed">{analysis.summaryShort}</p>
              </div>
              
              <div className="pt-8 border-t border-[#2d2d2d]">
                <h3 className="text-[10px] font-bold text-[#d4a373] uppercase tracking-widest mb-3">Extracted Items</h3>
                <div className="space-y-4">
                  {analysis.items.map((item, idx) => (
                    <div key={idx} className="p-4 bg-[#242424] rounded border border-[#2d2d2d]">
                      <div className="flex justify-between mb-2">
                        <span className="text-[9px] font-bold text-[#9e9e9e] uppercase tracking-widest px-1.5 py-0.5 border border-[#2d2d2d] rounded bg-[#1a1a1a]">
                          {item.itemType}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          item.priority === 'high' ? 'bg-red-900/30 text-red-500' : 'bg-[#1a1a1a] text-[#9e9e9e]'
                        }`}>
                          {item.priority}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold mb-1">{item.title}</h4>
                      <p className="text-[11px] text-[#9e9e9e] line-clamp-3 mb-2">{item.body}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-8 border-t border-[#2d2d2d]">
                <h3 className="text-[10px] font-bold text-[#d4a373] uppercase tracking-widest mb-3">Primary Entities</h3>
                <div className="flex flex-wrap gap-2">
                  {analysis.entities.map((e, idx) => (
                    <span key={idx} className="px-2 py-1 bg-[#242424] border border-[#2d2d2d] rounded text-[10px] font-medium text-[#e0e0e0]">
                      {e.canonicalName}
                    </span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-20 text-[#9e9e9e]">
              <i className="fa-solid fa-magnifying-glass animate-pulse block text-2xl mb-4"></i>
              <p className="text-xs font-bold uppercase tracking-widest">Awaiting Analysis...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadView;
