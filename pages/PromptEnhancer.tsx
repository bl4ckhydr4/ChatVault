
import React, { useState, useEffect } from 'react';
import { User, FiveBoxStructure, PromptConfig, EnhancedPromptResult } from '../types';
import { enhancePrompt, saveToHistory, getHistory } from '../services/promptService';

const PromptEnhancer: React.FC<{ user: User }> = ({ user }) => {
  const [rawInput, setRawInput] = useState('');
  const [enhancedOutput, setEnhancedOutput] = useState('');
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [history, setHistory] = useState<EnhancedPromptResult[]>([]);
  
  const [config, setConfig] = useState<PromptConfig>({
    creativity: 50,
    precision: 80,
    thinkingBudget: 0,
    useFiveBox: false
  });

  const [fiveBox, setFiveBox] = useState<FiveBoxStructure>({
    role: 'Expert Intelligence Analyst',
    task: '',
    context: '',
    outputShape: 'Structured Report',
    criteria: 'Precision, Clarity, Factual Accuracy'
  });

  useEffect(() => {
    setHistory(getHistory(user.uid));
  }, [user.uid]);

  const handleEnhance = async () => {
    if (!rawInput.trim() && (!config.useFiveBox || !fiveBox.task)) return;
    setIsEnhancing(true);
    try {
      const output = await enhancePrompt(rawInput, config, fiveBox);
      setEnhancedOutput(output);
      
      const result: EnhancedPromptResult = {
        id: `epr-${Date.now()}`,
        timestamp: new Date().toISOString(),
        rawInput,
        enhancedOutput: output,
        config,
        fiveBox: config.useFiveBox ? fiveBox : undefined
      };
      
      saveToHistory(user.uid, result);
      setHistory(getHistory(user.uid));
    } catch (err) {
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="flex h-full overflow-hidden">
      {/* Configuration Engine & Input */}
      <div className="flex-1 overflow-y-auto p-8 border-r border-white/5 bg-black/20">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight italic text-white mb-2">Prompt Enhancer</h1>
          <p className="text-[10px] text-[#d4a373] uppercase font-bold tracking-[0.4em] opacity-80">Configuration Engine v3.1</p>
        </header>

        <div className="space-y-8 max-w-4xl">
          {/* Config Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel rounded-2xl p-6">
              <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-4 tracking-widest pl-1">Creativity ({config.creativity}%)</label>
              <input 
                type="range" min="0" max="100" 
                value={config.creativity}
                onChange={e => setConfig({...config, creativity: parseInt(e.target.value)})}
              />
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-4 tracking-widest pl-1">Precision ({config.precision}%)</label>
              <input 
                type="range" min="0" max="100" 
                value={config.precision}
                onChange={e => setConfig({...config, precision: parseInt(e.target.value)})}
              />
            </div>
            <div className="glass-panel rounded-2xl p-6">
              <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-4 tracking-widest pl-1">Thinking Budget ({config.thinkingBudget})</label>
              <input 
                type="range" min="0" max="24576" step="1024"
                value={config.thinkingBudget}
                onChange={e => setConfig({...config, thinkingBudget: parseInt(e.target.value)})}
              />
            </div>
          </div>

          {/* Toggle Five Box */}
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setConfig({...config, useFiveBox: !config.useFiveBox})}
              className={`w-12 h-6 rounded-full transition-colors relative ${config.useFiveBox ? 'bg-[#d4a373]' : 'bg-white/10'}`}
            >
              <div className={`absolute top-1 w-4 h-4 bg-black rounded-full transition-all ${config.useFiveBox ? 'right-1' : 'left-1'}`}></div>
            </button>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#9e9e9e]">Enable Five Box Framework</span>
          </div>

          {config.useFiveBox ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-xl">
                  <label className="text-[9px] font-bold text-[#d4a373] uppercase mb-2 block">Box 1: Persona / Role</label>
                  <input className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/10" placeholder="e.g. Lead Architect" value={fiveBox.role} onChange={e => setFiveBox({...fiveBox, role: e.target.value})} />
                </div>
                <div className="glass-panel p-4 rounded-xl">
                  <label className="text-[9px] font-bold text-[#d4a373] uppercase mb-2 block">Box 2: Task</label>
                  <textarea rows={2} className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/10 resize-none" placeholder="What exactly needs to happen?" value={fiveBox.task} onChange={e => setFiveBox({...fiveBox, task: e.target.value})} />
                </div>
                <div className="glass-panel p-4 rounded-xl">
                  <label className="text-[9px] font-bold text-[#d4a373] uppercase mb-2 block">Box 3: Context</label>
                  <textarea rows={2} className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/10 resize-none" placeholder="Background info, docs, or history..." value={fiveBox.context} onChange={e => setFiveBox({...fiveBox, context: e.target.value})} />
                </div>
              </div>
              <div className="space-y-4">
                <div className="glass-panel p-4 rounded-xl">
                  <label className="text-[9px] font-bold text-[#d4a373] uppercase mb-2 block">Box 4: Output Shape</label>
                  <input className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/10" placeholder="e.g. JSON schema, table, list" value={fiveBox.outputShape} onChange={e => setFiveBox({...fiveBox, outputShape: e.target.value})} />
                </div>
                <div className="glass-panel p-4 rounded-xl h-full">
                  <label className="text-[9px] font-bold text-[#d4a373] uppercase mb-2 block">Box 5: Success Criteria</label>
                  <textarea rows={5} className="w-full bg-transparent border-none outline-none text-sm placeholder:text-white/10 resize-none" placeholder="How do we know it's good?" value={fiveBox.criteria} onChange={e => setFiveBox({...fiveBox, criteria: e.target.value})} />
                </div>
              </div>
            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-1 overflow-hidden">
              <textarea 
                rows={10}
                className="w-full bg-transparent border-none outline-none p-6 text-sm leading-relaxed placeholder:text-white/5"
                placeholder="INPUT RAW OPERATIONAL DATA FOR ENHANCEMENT..."
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
              />
            </div>
          )}

          <button 
            onClick={handleEnhance}
            disabled={isEnhancing}
            className="w-full py-4 bg-[#d4a373] text-black font-bold uppercase tracking-[0.4em] text-xs rounded-xl shadow-[0_0_30px_rgba(212,163,115,0.2)] hover:shadow-[0_0_40px_rgba(212,163,115,0.4)] transition-all disabled:opacity-50"
          >
            {isEnhancing ? 'Synthesizing Optimized Instruction...' : 'Optimize Prompt'}
          </button>
        </div>

        {enhancedOutput && (
          <div className="mt-12 glass-panel rounded-2xl p-8 relative group">
            <div className="absolute top-6 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => copyToClipboard(enhancedOutput)} className="text-[#d4a373] text-xs font-bold uppercase tracking-widest hover:underline">Copy Output</button>
            </div>
            <h3 className="text-[10px] font-bold text-[#d4a373] uppercase tracking-[0.3em] mb-6">Optimized Instruction Payload</h3>
            <div className="text-sm leading-loose whitespace-pre-wrap text-white/90 italic font-light mono border-l border-white/10 pl-6">
              {enhancedOutput}
            </div>
          </div>
        )}
      </div>

      {/* Vault History Sidebar */}
      <div className="w-80 bg-black/40 backdrop-blur-3xl shrink-0 flex flex-col">
        <div className="p-6 border-b border-white/5">
          <h2 className="text-xs font-bold text-[#9e9e9e] uppercase tracking-widest">Vault History</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {history.length === 0 ? (
            <div className="text-center py-20 text-white/20 text-[10px] font-bold uppercase tracking-widest">No Records Found</div>
          ) : (
            history.map(item => (
              <div key={item.id} className="glass-panel p-4 rounded-xl group cursor-pointer hover:border-[#d4a373]/50 transition-colors" onClick={() => {
                setEnhancedOutput(item.enhancedOutput);
                setRawInput(item.rawInput);
                if (item.fiveBox) {
                  setFiveBox(item.fiveBox);
                  setConfig({...item.config, useFiveBox: true});
                } else {
                  setConfig({...item.config, useFiveBox: false});
                }
              }}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[8px] font-bold mono text-[#d4a373]">ID_{item.id.split('-').pop()}</span>
                  <span className="text-[8px] text-white/30">{new Date(item.timestamp).toLocaleDateString()}</span>
                </div>
                <p className="text-[11px] text-white/60 line-clamp-2 italic mb-3">"{item.rawInput || item.fiveBox?.task}"</p>
                <div className="flex items-center space-x-2 text-[8px] font-bold uppercase tracking-widest text-white/20 group-hover:text-[#d4a373] transition-colors">
                  <span>Re-examine Registry</span>
                  <i className="fa-solid fa-chevron-right"></i>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default PromptEnhancer;
