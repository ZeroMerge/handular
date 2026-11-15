import React from 'react';
import {
  Squares2X2Icon,
  HomeIcon,
  Bars3BottomLeftIcon,
} from './ui/icons';
import { StudentUser } from '../types';

interface HeaderProps {
  activeTab: 'wizard' | 'orders' | 'profile' | 'offers' | 'confirmed' | 'tracker';
  onSelectTab: (tab: 'wizard' | 'orders' | 'profile') => void;
  currentUser: StudentUser | null;
  onToggleSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onSelectTab,
  currentUser,
  onToggleSidebar,
}) => {
  const defaultAvatar = currentUser
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
        currentUser.fullName
      )}&backgroundColor=10393b&textColor=ffffff`
    : '';

  const avatarUrl = currentUser?.avatarUrl || defaultAvatar;

  return (
    <>
      {/* Top Header - ZERO BORDERS, ZERO SHADOWS */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md px-4 sm:px-6 h-16 flex items-center transition-all">
        <div className="w-full max-w-4xl mx-auto flex items-center justify-between">
          {/* Top-Left: Sidebar Toggle Only (No logo in collapsed navbar) */}
          <div className="flex items-center">
            {onToggleSidebar && (
              <button
                onClick={onToggleSidebar}
                className="p-2 -ml-2 rounded-[8px] hover:bg-[#eceae2] active:bg-[#dbd8cc] text-[#10393b] transition-all cursor-pointer flex items-center justify-center"
                title="Chat History"
                aria-label="Open Chat History"
              >
                <Bars3BottomLeftIcon className="w-5 h-5 text-[#10393b]" />
              </button>
            )}
          </div>

          {/* Desktop Navigation Tabs (Center) - Clean Line Indicator Style */}
          <div className="hidden md:flex items-center gap-8 h-16">
            <button
              onClick={() => onSelectTab('wizard')}
              className={`h-full px-1 text-sm font-normal transition-colors cursor-pointer flex items-center gap-2 relative ${
                activeTab === 'wizard'
                  ? 'text-[#10393b]'
                  : 'text-[#777777] hover:text-[#10393b]'
              }`}
            >
              <HomeIcon className="w-4 h-4" />
              <span>Home</span>
              {activeTab === 'wizard' && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10393b] rounded-full" />
              )}
            </button>

            <button
              onClick={() => onSelectTab('orders')}
              className={`h-full px-1 text-sm font-normal transition-colors cursor-pointer flex items-center gap-2 relative ${
                activeTab === 'orders' || activeTab === 'offers' || activeTab === 'tracker' || activeTab === 'confirmed'
                  ? 'text-[#10393b]'
                  : 'text-[#777777] hover:text-[#10393b]'
              }`}
            >
              <Squares2X2Icon className="w-4 h-4" />
              <span>My Orders</span>
              {(activeTab === 'orders' || activeTab === 'offers' || activeTab === 'tracker' || activeTab === 'confirmed') && (
                <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#10393b] rounded-full" />
              )}
            </button>
          </div>

          {/* Right: Round Profile Picture (Compact and smaller) */}
          <div className="flex items-center gap-2">
            {currentUser && (
              <button
                onClick={() => onSelectTab('profile')}
                className={`relative w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'ring-2 ring-[#30c5ce]'
                    : 'hover:ring-2 hover:ring-[#10393b]/20'
                }`}
                title="Student Profile"
              >
                <img
                  src={avatarUrl}
                  alt={currentUser.fullName}
                  className="w-full h-full object-cover rounded-full"
                />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Fixed Bottom Navigation Bar - TWO TABS ONLY (ZERO BORDERS, ZERO SHADOWS) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md h-16 flex items-center justify-around px-6">
        <button
          onClick={() => onSelectTab('wizard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'wizard' ? 'text-[#10393b]' : 'text-[#888888]'
          }`}
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-normal">Home</span>
        </button>

        <button
          onClick={() => onSelectTab('orders')}
          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${
            activeTab === 'orders' || activeTab === 'offers' || activeTab === 'tracker' || activeTab === 'confirmed'
              ? 'text-[#10393b]'
              : 'text-[#888888]'
          }`}
        >
          <Squares2X2Icon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px] font-normal">My Orders</span>
        </button>
      </nav>
    </>
  );
};
