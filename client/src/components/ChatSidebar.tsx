import React, { useEffect } from 'react';
import { XMarkIcon, PlusIcon, TrashIcon } from './ui/icons';
import { ChatSessionSummary } from '../types';

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  chats: ChatSessionSummary[];
  activeChatId: string | null;
  onSelectChat: (chatId: string) => void;
  onNewChat: () => void;
  onDeleteChat: (chatId: string) => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  isOpen,
  onClose,
  chats,
  activeChatId,
  onSelectChat,
  onNewChat,
  onDeleteChat,
}) => {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop: Full on mobile, transparent click-away on desktop */}
      <div
        onClick={onClose}
        className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] md:bg-transparent md:backdrop-blur-none"
        aria-label="Dismiss menu"
      />

      {/* DESKTOP: Dropdown Box anchored below the hamburger within the page grid */}
      <div className="hidden md:flex fixed top-16 left-[max(1rem,calc((100vw-56rem)/2+1rem))] w-80 max-h-[70vh] bg-[#fbfaf7] rounded-[16px] flex-col z-50 overflow-hidden ring-1 ring-black/10 select-none animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-3.5 pb-2 flex items-center justify-between border-b border-[#10393b]/5">
          <span className="text-[10px] font-normal tracking-wider text-[#888888] uppercase">
            Recent Requests
          </span>
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            title="New Request"
            className="p-1 rounded-[6px] hover:bg-[#eceae2] text-[#10393b] transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Chats List: Strictly ONE line per item, no subtitles */}
        <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {chats.length === 0 ? (
            <div className="py-6 text-center text-xs text-[#888888]">
              No past requests
            </div>
          ) : (
            chats.map((c) => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  onClick={() => {
                    onSelectChat(c.id);
                    onClose();
                  }}
                  className={`group flex items-center justify-between px-3 py-2 rounded-[8px] cursor-pointer text-xs font-normal transition-all ${
                    isActive
                      ? 'bg-[#10393b] text-white'
                      : 'hover:bg-[#eceae2] text-[#10393b]'
                  }`}
                >
                  <span className="truncate flex-1 pr-2">{c.title}</span>

                  {!c.isLocked && c.status === 'DRAFT' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteChat(c.id);
                      }}
                      title="Delete draft"
                      className={`opacity-0 group-hover:opacity-100 p-1 rounded-[4px] transition-all ${
                        isActive
                          ? 'hover:bg-white/20 text-white/80'
                          : 'hover:bg-red-50 text-red-500'
                      }`}
                    >
                      <TrashIcon className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Action */}
        <div className="p-2.5 pt-1.5 border-t border-[#10393b]/5">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full h-9 rounded-[8px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-white text-xs font-normal flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <PlusIcon className="w-3.5 h-3.5 shrink-0" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* MOBILE: Slide-Out Drawer from Left with Curved Right Edges */}
      <div className="md:hidden fixed inset-y-0 left-0 max-w-[280px] w-full bg-[#fbfaf7] rounded-tr-[24px] rounded-br-[24px] flex flex-col z-50 animate-in slide-in-from-left duration-200 ease-out select-none overflow-hidden">
        {/* Top Header: Official Handular Logo & Close */}
        <div className="h-16 px-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <img
              src="/handular_icon.png"
              alt="Handular"
              className="w-8 h-8 rounded-[8px] object-contain drop-shadow-none"
            />
            <span className="font-semibold text-base tracking-tight text-[#10393b]">
              Handular
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[8px] hover:bg-[#eceae2] flex items-center justify-center text-[#777777] hover:text-[#10393b] transition-all cursor-pointer"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Chats List Section: Single Line Only */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-normal tracking-wider text-[#999999] uppercase">
            Recent Requests
          </div>

          {chats.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#888888]">
              No chats yet.
            </div>
          ) : (
            chats.map((c) => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  className="border-b border-[#10393b]/5 last:border-b-0 py-0.5"
                >
                  <div
                    onClick={() => {
                      onSelectChat(c.id);
                      onClose();
                    }}
                    className={`group flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer text-xs font-normal transition-all ${
                      isActive
                        ? 'bg-[#10393b] text-white'
                        : 'hover:bg-[#eceae2] text-[#10393b]'
                    }`}
                  >
                    <span className="truncate flex-1 pr-2">{c.title}</span>

                    {!c.isLocked && c.status === 'DRAFT' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id);
                        }}
                        title="Delete draft"
                        className={`p-1 rounded-[4px] transition-all ${
                          isActive
                            ? 'hover:bg-white/20 text-white/80'
                            : 'hover:bg-red-50 text-red-500'
                        }`}
                      >
                        <TrashIcon className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Bottom Dock: + New Request Button */}
        <div className="p-4 bg-[#fbfaf7] shrink-0">
          <button
            onClick={() => {
              onNewChat();
              onClose();
            }}
            className="w-full h-11 px-4 rounded-[10px] bg-[#10393b] hover:bg-[#154b4d] active:bg-[#0c2a2b] text-white text-xs font-normal flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <PlusIcon className="w-4 h-4 shrink-0" />
            <span>New Request</span>
          </button>
        </div>
      </div>
    </>
  );
};
