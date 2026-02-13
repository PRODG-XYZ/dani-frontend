'use client';

import { AuthUser } from '@/types';
import { downloadConversation } from '@/services/api';
import MicroservicesDropdown from '@/components/ui/MicroservicesDropdown';

interface BeeBotHeaderProps {
  onNewChat: () => void;
  user: AuthUser | null;
  onToggleSources?: () => void;
  isSourcesOpen?: boolean;
  sourcesCount?: number;
  currentConversationId?: string | null;
  onMenuClick?: () => void;
}

export default function BeeBotHeader({
  onNewChat,
  user,
  onToggleSources,
  isSourcesOpen = false,
  sourcesCount = 0,
  currentConversationId,
  onMenuClick,
}: BeeBotHeaderProps) {
  const handleExport = async () => {
    if (!currentConversationId || currentConversationId === 'new') return;
    try {
      await downloadConversation(currentConversationId);
    } catch (error) {
      console.error('Failed to export conversation:', error);
      alert('Failed to export conversation. Please try again.');
    }
  };
  return (
    <header className="glass-strong border-b border-[var(--border)] backdrop-blur-xl sticky top-0 z-40 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 max-w-[100vw]">
        {/* Left - Mobile Menu Button */}
        <div className="flex items-center gap-3">
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden flex items-center justify-center w-9 h-9 md:w-10 md:h-10 text-[var(--foreground)] hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200 hover:scale-110 active:scale-95"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}
        </div>

        {/* Right - Actions */}
        <div className="flex items-center gap-2 md:gap-3 ml-auto">
          {/* Microservices Dropdown */}
          <MicroservicesDropdown />

          {/* Export Button - Only show when viewing a conversation */}
          {currentConversationId && currentConversationId !== 'new' && (
            <button
              onClick={handleExport}
              className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 hover:text-[var(--primary)]"
              title="Export conversation"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </button>
          )}

          {/* Sources Toggle Button - Only show when in a conversation with sources */}
          {onToggleSources && sourcesCount > 0 && (
            <button
              onClick={onToggleSources}
              className={`relative flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl transition-all duration-200 hover:scale-110 active:scale-95 ${
                isSourcesOpen
                  ? 'bg-[var(--primary)] text-white shadow-lg'
                  : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]'
              }`}
              title="View sources"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              {sourcesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[var(--primary)] text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg border-2 border-[var(--surface)]">
                  {sourcesCount}
                </span>
              )}
            </button>
          )}

          {/* New Chat Button */}
          <button
            onClick={onNewChat}
            className="hidden sm:flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-semibold rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-105 active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>New Chat</span>
          </button>

          {/* Mobile New Chat Button */}
          <button
            onClick={onNewChat}
            className="sm:hidden flex items-center justify-center w-9 h-9 bg-black text-white rounded-xl hover:bg-gray-800 transition-all duration-200 hover:scale-110 active:scale-95"
            title="New Chat"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
