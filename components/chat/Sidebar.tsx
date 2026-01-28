'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Conversation } from '@/types';
import { PlusIcon, ChatIcon, TrashIcon, CloseIcon, MenuIcon, DeepSearchIcon, ImageIcon } from '@/components/ui/Icons';
import IconButton from '@/components/ui/IconButton';
import Button from '@/components/ui/Button';
import Logo from '@/components/ui/Logo';
import UserMenu, { User } from '@/components/ui/UserMenu';

// Chevron icons for collapse toggle
const ChevronLeftIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
  </svg>
);

const ChevronRightIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface SidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  user?: User;
  onEditProfile?: (user: User) => void;
  onLogout?: () => void;
  onHelp?: () => void;
}

export default function Sidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  isCollapsed = false,
  onToggleCollapse,
  user = { name: 'User' },
  onEditProfile,
  onLogout,
  onHelp,
}: SidebarProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (date: Date | string | undefined | null) => {
    if (!date) return '';
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return '';
    
    const now = new Date();
    const diff = now.getTime() - dateObj.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    // Use a consistent date format to avoid hydration mismatch
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div 
      className={`
        flex flex-col h-full 
        bg-[var(--background)]
        border-r border-[var(--border)]
        transition-all duration-300 ease-out
        ${isCollapsed ? 'w-20' : 'w-full'}
      `}
    >
      {/* Header */}
      <div className="flex-shrink-0 p-4 space-y-4">
        {/* Logo and Toggle */}
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Logo size="sm" showText={true} />
          )}
          {isCollapsed && (
            <div className="mx-auto">
              <Logo size="sm" showText={false} />
            </div>
          )}
          {onToggleCollapse && !isCollapsed && (
            <IconButton
              icon={<ChevronLeftIcon className="w-5 h-5" />}
              ariaLabel="Collapse sidebar"
              onClick={onToggleCollapse}
              variant="ghost"
            />
          )}
        </div>
        
        {/* Collapsed state toggle button */}
        {isCollapsed && onToggleCollapse && (
          <IconButton
            icon={<ChevronRightIcon className="w-5 h-5" />}
            ariaLabel="Expand sidebar"
            onClick={onToggleCollapse}
            variant="ghost"
            className="mx-auto"
          />
        )}
        
        {/* Search Bar */}
        {!isCollapsed && (
          <button
            onClick={() => setIsSearchOpen(true)}
            className="
              w-full px-4 py-2.5 
              text-left text-sm text-[var(--foreground-muted)]
              glass rounded-xl
              hover:bg-[var(--surface-hover)]
              transition-all duration-200
              flex items-center gap-2
            "
          >
            <DeepSearchIcon className="w-4 h-4" />
            <span>Search conversations...</span>
          </button>
        )}
        
        {/* New Chat Button */}
        {isCollapsed ? (
          <IconButton
            icon={<PlusIcon className="w-5 h-5" />}
            ariaLabel="New Chat"
            onClick={onNewConversation}
            variant="primary"
            className="w-full"
          />
        ) : (
          <Button
            variant="primary"
            fullWidth
            onClick={onNewConversation}
            className="gap-2 shadow-lg shadow-[var(--primary-glow)]"
          >
            <PlusIcon className="w-5 h-5" />
            New Chat
          </Button>
        )}
      </div>
      
      {/* Search Modal */}
      {isSearchOpen && (
        <div 
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/40 backdrop-blur-sm animate-fade-in" 
          onClick={() => setIsSearchOpen(false)}
        >
          <div 
            className="glass-strong rounded-2xl shadow-2xl w-full max-w-xl mx-4 overflow-hidden animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <DeepSearchIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                autoFocus
                className="flex-1 bg-transparent border-none focus:outline-none text-[var(--foreground)] placeholder-[var(--foreground-muted)] text-lg"
              />
              <IconButton
                icon={<CloseIcon />}
                ariaLabel="Close search"
                onClick={() => setIsSearchOpen(false)}
                variant="ghost"
              />
            </div>
            <div className="max-h-80 overflow-y-auto p-2">
              {conversations
                .filter((conv) =>
                  conv.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="
                      w-full text-left p-3 rounded-xl 
                      hover:bg-[var(--surface-hover)]
                      transition-all duration-200
                    "
                  >
                    <div className="flex items-center gap-3">
                      <ChatIcon className="w-5 h-5 text-[var(--foreground-muted)]" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)]">
                          {formatDate(conversation.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              {searchQuery && conversations.filter((conv) =>
                conv.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-[var(--foreground-muted)] py-8">
                  No conversations found
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {conversations.map((conversation, index) => (
          <div
            key={conversation.id}
            className={`
              group relative rounded-xl 
              transition-all duration-200
              animate-fade-in-up
              ${currentConversationId === conversation.id
                ? 'bg-[var(--surface)] shadow-md border border-[var(--border)]'
                : 'hover:bg-[var(--surface-hover)]'
              }
            `}
            style={{ animationDelay: `${index * 50}ms` }}
            onMouseEnter={() => setHoveredId(conversation.id)}
            onMouseLeave={() => setHoveredId(null)}
          >
            <button
              onClick={() => onSelectConversation(conversation.id)}
              className={`
                w-full text-left focus:outline-none
                ${isCollapsed ? 'p-3 flex justify-center' : 'p-3 pr-10'}
              `}
              title={isCollapsed ? conversation.title : undefined}
            >
              {isCollapsed ? (
                <ChatIcon className="w-5 h-5 flex-shrink-0 text-[var(--foreground-secondary)]" />
              ) : (
                <div className="flex items-start gap-3">
                  <ChatIcon className="w-5 h-5 mt-0.5 flex-shrink-0 text-[var(--foreground-secondary)]" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--foreground)] truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                      {formatDate(conversation.updatedAt)}
                    </p>
                  </div>
                </div>
              )}
            </button>
            
            {/* Delete Button */}
            {hoveredId === conversation.id && onDeleteConversation && !isCollapsed && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2 animate-fade-in">
                <IconButton
                  icon={<TrashIcon className="w-4 h-4" />}
                  size="sm"
                  variant="ghost"
                  ariaLabel="Delete conversation"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteConversation(conversation.id);
                  }}
                  className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer - User Profile */}
      <div className="flex-shrink-0 p-4 border-t border-[var(--glass-border)]">
        <UserMenu
          user={user}
          isCollapsed={isCollapsed}
          onEditProfile={onEditProfile}
          onLogout={onLogout}
          onHelp={onHelp}
        />
      </div>
    </div>
  );
}
