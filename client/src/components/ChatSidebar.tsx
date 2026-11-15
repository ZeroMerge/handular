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

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT':
        return 'Draft';
      case 'OPEN':
      case 'BROADCASTED':
      case 'SOURCING':
        return 'Sourcing';
      case 'OFFERS_READY':
        return 'Offers Ready';
      case 'OFFER_SELECTED':
      case 'CLOSED_WON':
        return 'Reserved';
      default:
        return status;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Translucent Backdrop */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity duration-200"
      />

      {/* Slide-out Sidebar Drawer with Rounded Right Corners (Top Right & Bottom Right) */}
      <div className="absolute inset-y-0 left-0 max-w-[320px] w-full bg-[#fbfaf7] rounded-tr-[24px] rounded-br-[24px] flex flex-col z-10 animate-in slide-in-from-left duration-200 ease-out select-none overflow-hidden">
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

        {/* Chats List Section */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-0.5">
          <div className="px-3 py-1 text-[10px] font-normal tracking-wider text-[#999999] uppercase">
            Recent Requests
          </div>

          {chats.length === 0 ? (
            <div className="px-3 py-8 text-center text-xs text-[#888888]">
              No chats yet. Start a new request below.
            </div>
          ) : (
            chats.map((c) => {
              const isActive = c.id === activeChatId;
              const dateStr = formatDate(c.createdAt || c.updatedAt);
              const statusStr = getStatusLabel(c.status);

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
                    className={`group relative flex items-center justify-between px-3 py-2.5 rounded-[10px] cursor-pointer transition-all ${
                      isActive
                        ? 'bg-[#10393b] text-white'
                        : 'hover:bg-[#eceae2] text-[#10393b]'
                    }`}
                  >
                    <div className="min-w-0 flex-1 pr-2">
                      <p
                        className={`text-xs font-normal truncate ${
                          isActive ? 'text-white' : 'text-[#10393b]'
                        }`}
                      >
                        {c.title}
                      </p>
                      <p
                        className={`text-[10px] font-normal truncate mt-0.5 ${
                          isActive ? 'text-white/70' : 'text-[#888888]'
                        }`}
                      >
                        {dateStr} • {statusStr}
                        {c.trackingCode && ` • #${c.trackingCode}`}
                      </p>
                    </div>

                    {/* Delete Trash Icon: ONLY permitted for unsubmitted drafts */}
                    {!c.isLocked && c.status === 'DRAFT' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteChat(c.id);
                        }}
                        title="Delete draft chat"
                        className={`opacity-0 group-hover:opacity-100 p-1.5 rounded-[6px] transition-all ${
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
    </div>
  );
};
