'use client';

import { ReactNode } from 'react';
import { MenuIcon } from '@/components/ui/Icons';
import IconButton from '@/components/ui/IconButton';
import ThemeToggle from '@/components/ui/ThemeToggle';

// Share icon
const ShareIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
  </svg>
);

// Chevron down icon for dropdown
const ChevronDownIcon = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

interface ChatHeaderProps {
  title: string;
  onMenuClick?: () => void;
  rightActions?: ReactNode;
}

export default function ChatHeader({ title, onMenuClick, rightActions }: ChatHeaderProps) {
  return (
    <header 
      className="
        sticky top-0 z-10 
        flex items-center justify-between gap-3 
        px-4 py-3
        bg-[var(--background)]/80 backdrop-blur-xl
        animate-fade-in-down
      "
    >
      {/* Left: Menu button and title */}
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <IconButton
            icon={<MenuIcon className="w-5 h-5" />}
            ariaLabel="Toggle sidebar"
            onClick={onMenuClick}
            variant="ghost"
            className="lg:hidden"
          />
        )}
        
        {/* Title or Model Selector */}
        {title ? (
          <h1 className="text-base font-medium text-[var(--foreground)] truncate">
            {title}
          </h1>
        ) : (
          <button className="
            flex items-center gap-1.5 
            px-3 py-1.5 
            rounded-full
            hover:bg-[var(--surface-hover)]
            transition-all duration-200
            group
          ">
            <span className="text-base font-medium text-[var(--foreground)]">
              DANI
            </span>
            <span className="text-sm text-[var(--foreground-muted)]">
              Pro
            </span>
            <ChevronDownIcon className="w-4 h-4 text-[var(--foreground-muted)] group-hover:text-[var(--foreground)] transition-colors" />
          </button>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <IconButton
          icon={<ShareIcon className="w-5 h-5" />}
          ariaLabel="Share conversation"
          onClick={() => {}}
          variant="ghost"
        />
        {rightActions}
        <ThemeToggle />
      </div>
    </header>
  );
}


