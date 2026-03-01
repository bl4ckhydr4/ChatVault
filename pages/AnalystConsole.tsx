
import React, { useState, useEffect, useRef } from 'react';
// Fixed: Removed non-existent ConsoleSession import from types
import { User, ConsoleMessage, Thread, Message } from '../types';
import { queryAnalyst } from '../services/geminiService';

const AnalystConsole: React.FC<{ user: User }> = ({ user }) => {
  const [messages, setMessages] = useState<ConsoleMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Load existing messages for this session (simulated)
    const saved = localStorage.getItem(`console_messages_${user.uid}`);
    if (saved) setMessages(JSON.parse(saved));
  }, [user.uid]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    localStorage.setItem(`console_messages_${user.uid}`, JSON.stringify(messages));
  }, [messages, user.uid]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ConsoleMessage = {
      id: `cm-${Date.now()}`,
      role: 'user',
      createdAt: new Date().toISOString(),
      contentText: input
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      // Simple Keyword Search for context (RAG Simulation)
      const threads: Thread[] = JSON.parse(localStorage.getItem(`threads_${user.uid}`) || '[]');
      const contextPool: any[] = [];
      const searchTerms = userMsg.contentText.toLowerCase().split(' ').filter(t => t.length > 3);

      for (const t of threads) {
        const msgs: Message[] = JSON.parse(localStorage.getItem(`messages_${t.id}`) || '[]');
        for (const m of msgs) {
          if (searchTerms.some(term => m.contentText.toLowerCase().includes(term))) {
            contextPool.push({
              threadId: t.id,
              threadTitle: t.title || 'Untitled',
              index: m.index,
              content: m.contentText
            });
          }
        }
      }

      // Limit context to top 15 results
      const results = await queryAnalyst(userMsg.contentText, contextPool.slice(0, 15));
      
      const assistantMsg: ConsoleMessage = {
        id: `cm-${Date.now()}-ai`,
        role: 'assistant',
        createdAt: new Date().toISOString(),
        contentText: results.contentText || "I couldn't find relevant data in the vault.",
        citations: results.citations
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex h-full flex-col bg-[#121212] overflow-hidden">
      <header className="p-6 bg-[#1a1a1a] border-b border-[#2d2d2d] shrink-0">
        <h1 className="text-lg font-bold flex items-center">
          <i className="fa-solid fa-user-secret text-[#d4a373] mr-3"></i>
          Analyst Console
        </h1>
        <p className="text-[10px] text-[#9e9e9e] uppercase font-bold tracking-widest">Live retrieval briefing // Verified Citations Enabled</p>
      </header>

      <div className="flex-1 overflow-y-auto p-8 space-y-8">
        {messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
            <i className="fa-solid fa-terminal text-4xl mb-6 text-[#d4a373]"></i>
            <h2 className="text-xl font-bold mb-2">Operational Ready</h2>
            <p className="max-w-md text-sm">Ask questions grounded in your vault records. The analyst will cite specific messages as evidence.</p>
          </div>
        )}

        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-2xl ${m.role === 'user' ? 'bg-[#242424]' : 'bg-[#1a1a1a] border border-[#2d2d2d]'} p-6 rounded-lg`}>
              <div className="text-[9px] font-bold uppercase tracking-widest text-[#9e9e9e] mb-2 flex items-center justify-between">
                <span>{m.role === 'user' ? 'AGENT_QUERY' : 'ANALYST_REPLY'}</span>
                <span>{new Date(m.createdAt).toLocaleTimeString()}</span>
              </div>
              <div className="text-sm leading-relaxed whitespace-pre-wrap">{m.contentText}</div>
              
              {m.citations && m.citations.length > 0 && (
                <div className="mt-6 pt-4 border-t border-[#2d2d2d]">
                  <h4 className="text-[9px] font-bold text-[#d4a373] uppercase tracking-widest mb-3">Supporting Evidence</h4>
                  <div className="space-y-2">
                    {m.citations.map((c, ci) => (
                      <div key={ci} className="p-3 bg-[#121212] rounded border border-[#2d2d2d] text-[11px]">
                        <div className="flex justify-between font-bold mb-1">
                          <span className="text-[#9e9e9e] truncate">{c.threadTitle}</span>
                          <span className="text-[#d4a373] ml-2">MSG_{c.messageIndex}</span>
                        </div>
                        <p className="italic text-[#9e9e9e] line-clamp-2">"{c.excerpt}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-[#1a1a1a] border border-[#2d2d2d] p-6 rounded-lg animate-pulse">
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#9e9e9e]">Analyst Searching Vault...</span>
            </div>
          </div>
        )}
        <div ref={scrollRef}></div>
      </div>

      <div className="p-6 bg-[#1a1a1a] border-t border-[#2d2d2d]">
        <form onSubmit={handleSend} className="max-w-3xl mx-auto relative">
          <input 
            type="text"
            className="w-full bg-[#242424] border border-[#2d2d2d] rounded-lg pl-6 pr-16 py-3 text-sm focus:border-[#d4a373] outline-none transition-all"
            placeholder="Type your operational query here..."
            value={input}
            onChange={e => setInput(e.target.value)}
          />
          <button 
            type="submit"
            className="absolute right-2 top-2 p-2 text-[#d4a373] hover:text-[#e0e0e0] transition-colors"
          >
            <i className="fa-solid fa-paper-plane"></i>
          </button>
        </form>
        <p className="text-center text-[9px] text-[#9e9e9e] uppercase font-bold tracking-widest mt-4">Security clearance verified: Global Access Enabled</p>
      </div>
    </div>
  );
};

export default AnalystConsole;
