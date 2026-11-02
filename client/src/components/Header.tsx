import React, { useState } from 'react';
import { Search, HelpCircle, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  onSearchToken: (token: string) => void;
  onGoHome: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSearchToken, onGoHome }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (tokenInput.trim()) {
      onSearchToken(tokenInput.trim().toUpperCase());
      setShowSearchModal(false);
      setTokenInput('');
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-neutral-200/80 px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onGoHome}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div className="w-8 h-8 rounded-xl bg-[#0051c3] text-white flex items-center justify-center font-bold text-lg shadow-none transition-transform group-hover:scale-105">
              H
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-neutral-900">
                handular
              </span>
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/70">
                Campus Sourcing
              </span>
            </div>
          </button>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => setShowSearchModal(true)}
            className="flex items-center gap-2 h-9 px-3 rounded-xl border border-neutral-200/80 text-xs sm:text-sm text-neutral-500 hover:text-neutral-800 hover:bg-neutral-50 transition-colors"
          >
            <Search className="w-3.5 h-3.5 stroke-[1.75px]" />
            <span className="hidden sm:inline">Track request by token</span>
            <span className="sm:hidden">Track</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-neutral-100 rounded border border-neutral-200/60 text-neutral-500">
              REQ
            </kbd>
          </button>

          <div className="h-4 w-px bg-neutral-200/80 mx-1" />

          <button
            title="Campus Sourcing Verification"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <ShieldCheck className="w-4 h-4 stroke-[1.75px] text-[#0051c3]" />
          </button>

          <button
            title="Help & FAQ"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-neutral-500 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <HelpCircle className="w-4 h-4 stroke-[1.75px]" />
          </button>
        </div>
      </header>

      {/* Track Token Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-neutral-200/80 w-full max-w-md p-6 relative">
            <h3 className="text-lg font-semibold text-neutral-900 mb-1">
              Track Your Device Request
            </h3>
            <p className="text-xs text-neutral-500 mb-4">
              Enter your request code (e.g. <span className="font-mono text-neutral-700">REQ-8492</span> or <span className="font-mono text-neutral-700">REQ-GZTE</span>) to view curated offers.
            </p>
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 stroke-[1.75px]" />
                <input
                  type="text"
                  autoFocus
                  placeholder="REQ-XXXX"
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  className="w-full h-11 pl-10 pr-4 rounded-xl border border-neutral-200/80 text-sm focus:outline-none focus:border-[#0051c3] focus:ring-1 focus:ring-[#0051c3] uppercase tracking-wider font-mono"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="h-10 px-4 rounded-xl text-sm font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-5 rounded-xl text-sm font-medium bg-[#0051c3] text-white hover:bg-[#0043a8] transition-colors"
                >
                  Track Offers
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
