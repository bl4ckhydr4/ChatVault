
import React, { useState } from 'react';
import { User } from '../types';

const Auth: React.FC<{ setUser: (u: User) => void }> = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const mockUser: User = {
      uid: 'u-' + Date.now(),
      email: email || 'agent@vault.com',
      displayName: 'Agent ' + (email?.split('@')[0] || 'Alpha'),
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('vault_user', JSON.stringify(mockUser));
    setUser(mockUser);
  };

  /**
   * REPLICATION LOGIC FOR PROVIDED WALLPAPER:
   * 1. Dark charcoal/black base to match the shadows.
   * 2. Heavy radial gradient positioned at the top-right to mimic the golden light source.
   * 3. Texture overlay using high-resolution dark concrete/stucco to match the wall's grit.
   * 4. Multi-layered gradients to blend the light smoothly into the dark corners.
   */
  const bgStyle: React.CSSProperties = {
    backgroundColor: '#0a0a0a',
    backgroundImage: `
      radial-gradient(circle at 90% 10%, rgba(212, 163, 115, 0.25) 0%, transparent 45%),
      radial-gradient(circle at 85% 15%, rgba(184, 134, 11, 0.15) 0%, transparent 60%),
      linear-gradient(to bottom left, transparent 20%, rgba(0,0,0,0.8) 100%),
      url('https://images.unsplash.com/photo-1533134486753-c833f0ed4866?auto=format&fit=crop&q=80&w=2000')
    `,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  };

  return (
    <div style={bgStyle} className="min-h-screen flex items-center justify-center p-6 bg-[#0a0a0a] relative overflow-hidden">
      {/* Gritty overlay to enhance the wall texture effect */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-30 pointer-events-none"></div>
      
      {/* Sophisticated scanning beam to match the industrial/analyst vibe */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-[#d4a373]/20 shadow-[0_0_20px_#d4a373] animate-[scan_12s_linear_infinite] pointer-events-none"></div>
      
      <div className="w-full max-w-md bg-black/50 backdrop-blur-3xl border border-white/5 rounded-2xl p-8 md:p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#d4a373] rounded-2xl flex items-center justify-center text-[#121212] mx-auto mb-6 shadow-[0_0_40px_rgba(212,163,115,0.2)] transform -rotate-2 hover:rotate-0 transition-all duration-700 cursor-default">
            <i className="fa-solid fa-vault text-4xl"></i>
          </div>
          <h1 className="text-3xl font-bold mb-1 tracking-tight text-white uppercase italic">Vault Access</h1>
          <p className="text-[10px] text-[#d4a373] uppercase font-bold tracking-[0.4em] opacity-80">Intelligence Entry Protocol</p>
        </div>

        <form onSubmit={handleAuth} className="space-y-6">
          <div className="group">
            <label className="block text-[9px] font-bold text-[#9e9e9e] uppercase mb-2 tracking-[0.2em] pl-1 group-focus-within:text-[#d4a373] transition-colors">Credential Identifier</label>
            <div className="relative">
              <i className="fa-solid fa-user-secret absolute left-4 top-1/2 -translate-y-1/2 text-[#d4a373]/20"></i>
              <input 
                type="email" 
                required
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-[#d4a373]/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-white/10 text-white"
                placeholder="REGISTRY_ID"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>
          <div className="group">
            <label className="block text-[9px] font-bold text-[#9e9e9e] uppercase mb-2 tracking-[0.2em] pl-1 group-focus-within:text-[#d4a373] transition-colors">Access Keyphrase</label>
            <div className="relative">
              <i className="fa-solid fa-key absolute left-4 top-1/2 -translate-y-1/2 text-[#d4a373]/20"></i>
              <input 
                type="password" 
                required
                className="w-full bg-white/[0.02] border border-white/10 rounded-xl pl-12 pr-4 py-4 text-sm focus:border-[#d4a373]/40 focus:bg-white/[0.05] outline-none transition-all placeholder:text-white/10 text-white"
                placeholder="ENCRYPTION_PASS"
                value={pass}
                onChange={e => setPass(e.target.value)}
              />
            </div>
          </div>
          <button 
            type="submit"
            className="w-full bg-[#d4a373] text-[#121212] py-4 rounded-xl font-bold text-xs uppercase tracking-[0.3em] hover:bg-[#c69363] hover:shadow-[0_0_30px_rgba(212,163,115,0.4)] transition-all active:scale-[0.98] mt-6"
          >
            Authenticate
          </button>
        </form>

        <div className="mt-12 pt-8 border-t border-white/5 text-center">
          <p className="text-[9px] text-white/20 uppercase font-bold tracking-widest mb-6">Redundant Verification</p>
          <button 
            onClick={handleAuth}
            className="flex items-center justify-center space-x-3 w-full border border-white/5 rounded-xl py-3.5 hover:bg-white/5 transition-all text-white/40 hover:text-white group"
          >
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/smartlock/google.svg" alt="G" className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Connect via External Relay</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes scan {
          0% { top: -10%; opacity: 0; }
          20% { opacity: 0.3; }
          80% { opacity: 0.3; }
          100% { top: 110%; opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default Auth;
