
import React from 'react';
import { User } from '../types';

const Settings: React.FC<{ user: User }> = ({ user }) => {
  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-y-auto">
      <header className="mb-12">
        <h1 className="text-3xl font-bold mb-2">Account Configuration</h1>
        <p className="text-[#9e9e9e]">Manage your agent credentials and system preferences.</p>
      </header>

      <section className="bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#d4a373] mb-6">Agent Profile</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-1">Display Designation</label>
            <p className="text-sm font-semibold p-2 bg-[#242424] rounded border border-[#2d2d2d]">{user.displayName || 'Unnamed Agent'}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-1">Registry Email</label>
            <p className="text-sm font-semibold p-2 bg-[#242424] rounded border border-[#2d2d2d]">{user.email}</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-1">Clearance Level</label>
            <p className="text-sm font-semibold p-2 bg-[#242424] rounded border border-[#2d2d2d]">Lead Analyst (L3)</p>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-[#9e9e9e] uppercase mb-1">Vault Membership</label>
            <p className="text-sm font-semibold p-2 bg-[#242424] rounded border border-[#2d2d2d]">Since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>
      </section>

      <section className="mt-8 bg-[#1a1a1a] border border-[#2d2d2d] rounded-lg p-8">
        <h2 className="text-xs font-bold uppercase tracking-widest text-[#d4a373] mb-4">Security Notice</h2>
        <p className="text-xs text-[#9e9e9e] leading-relaxed">
          All data within Chat Vault is stored locally in your browser's persistent storage for this MVP. Clearing your browser cache or storage will result in permanent loss of all vault records and intelligence reports. Ensure periodic exports if critical data is stored.
        </p>
      </section>
    </div>
  );
};

export default Settings;
