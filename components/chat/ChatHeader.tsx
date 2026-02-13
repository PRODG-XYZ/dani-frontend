'use client';

import { ReactNode } from 'react';
import ThemeToggle from '@/components/ui/ThemeToggle';
import MicroservicesDropdown from '@/components/ui/MicroservicesDropdown';

interface ChatHeaderProps {
  title: string;
  onMenuClick?: () => void;
  onNewConversation?: () => void;
  rightActions?: ReactNode;
}

export default function ChatHeader({
  title,
  onMenuClick,
  onNewConversation,
  rightActions
}: ChatHeaderProps) {
  return (
    <header className="w-full border-b border-[var(--border)] bg-[var(--surface)] glass-strong backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6 lg:px-8 max-w-[100vw]">
        {/* Left: Title and Menu */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile menu icon */}
          {onMenuClick && (
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 hover:bg-[var(--surface-hover)] rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
              aria-label="Open menu"
            >
              <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <h1 className="text-base md:text-lg font-semibold text-[var(--foreground)] truncate">
            {title || 'Chat'}
          </h1>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
          {/* New Chat Button */}
          {onNewConversation && (
            <button
              onClick={onNewConversation}
              className="flex items-center gap-2 px-3 md:px-4 py-2 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] hover:shadow-lg text-white text-sm font-medium rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 hover-glow"
              aria-label="New Chat"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">New Chat</span>
            </button>
          )}

          {/* Microservices Dropdown */}
          <MicroservicesDropdown />

          {/* Additional Actions (like sources button) */}
          {rightActions}

          {/* Theme Toggle */}
          <div className="hidden sm:block">
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}
