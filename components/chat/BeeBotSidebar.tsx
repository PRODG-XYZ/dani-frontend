'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Conversation, AuthUser } from '@/types';
import BeeBotUserMenu from './BeeBotUserMenu';
import ConversationsSkeleton from './ConversationsSkeleton';
import DeleteConfirmModal from '@/components/ui/DeleteConfirmModal';

interface BeeBotSidebarProps {
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
  user: AuthUser | null;
  onNavigateToHistory?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToLibrary?: () => void;
  onNavigateToInfographics?: () => void;
  isLoadingConversations?: boolean;
  isLoadingAuth?: boolean;
}

export default function BeeBotSidebar({
  conversations,
  currentConversationId,
  onSelectConversation,
  onDeleteConversation,
  user,
  onNavigateToHistory,
  onNavigateToChat,
  onNavigateToUserManagement,
  onNavigateToLibrary,
  onNavigateToInfographics,
  isLoadingConversations = false,
  isLoadingAuth = false,
}: BeeBotSidebarProps) {
  const router = useRouter();
  const [activeNav, setActiveNav] = useState('home');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Get most recent 10 conversations, sorted by updatedAt
  const recentConversations = [...conversations]
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
    .slice(0, 10);

  // Keyboard shortcut for search (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Static sphere component (no animation)
  const StaticSphere = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const radius = 12;

      // Create radial gradient
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        0,
        centerX,
        centerY,
        radius
      );

      // Orange gradient (static)
      gradient.addColorStop(0, 'rgba(255, 140, 0, 1)');
      gradient.addColorStop(0.3, 'rgba(255, 100, 80, 0.9)');
      gradient.addColorStop(0.5, 'rgba(255, 120, 150, 0.6)');
      gradient.addColorStop(0.7, 'rgba(255, 180, 200, 0.3)');
      gradient.addColorStop(1, 'rgba(255, 200, 200, 0)');

      // Draw the sphere
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();
    }, []);

    return <canvas ref={canvasRef} width={28} height={28} className="rounded-full" />;
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-60 lg:w-64'} h-screen glass flex flex-col border-r border-[var(--border)] transition-all duration-300 ease-in-out backdrop-blur-xl`}>
      {/* Header */}
      <div className="p-3 md:p-4 space-y-3 md:space-y-4 shrink-0">
        {/* Logo and Collapse Button */}
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <StaticSphere />
            </div>
            {!isCollapsed && <span className="text-base font-bold text-[var(--foreground)] tracking-tight">DANI</span>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center justify-center p-1.5 rounded-lg hover:bg-[var(--surface-hover)] transition-all duration-200 hover:scale-110 active:scale-95 ${isCollapsed ? 'pr-2' : ''}`}
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            <svg className={`w-4 h-4 text-[var(--foreground-muted)] transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="relative mb-2 animate-fade-in">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full relative text-left"
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-full pl-9 pr-12 py-2.5 text-sm glass rounded-xl text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)] hover:shadow-md transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]">
                Search
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="text-xs text-[var(--foreground-muted)] font-mono px-1.5 py-0.5 rounded bg-[var(--surface)] border border-[var(--border)]">⌘K</kbd>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-2 mb-2 space-y-1">
        <button
          onClick={() => {
            setActiveNav('home');
            if (onNavigateToChat) {
              onNavigateToChat();
            } else {
              router.push('/chat');
            }
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeNav === 'home'
              ? 'bg-[var(--primary)] text-white shadow-lg hover:shadow-xl'
              : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]'
          }`}
          title={isCollapsed ? 'Home' : undefined}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>
          {!isCollapsed && <span>Home</span>}
        </button>
        <button
          onClick={() => {
            setActiveNav('library');
            onNavigateToLibrary?.();
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeNav === 'library'
              ? 'bg-[var(--primary)] text-white shadow-lg hover:shadow-xl'
              : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]'
          }`}
          title={isCollapsed ? 'Library' : undefined}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          {!isCollapsed && <span>Library</span>}
        </button>
        <button
          onClick={() => {
            setActiveNav('infographics');
            onNavigateToInfographics?.();
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeNav === 'infographics'
              ? 'bg-[var(--primary)] text-white shadow-lg hover:shadow-xl'
              : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]'
          }`}
          title={isCollapsed ? 'Infographics' : undefined}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {!isCollapsed && <span>Infographics</span>}
        </button>
        <button
          onClick={() => {
            setActiveNav('history');
            if (onNavigateToHistory) {
              onNavigateToHistory();
            }
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
            activeNav === 'history'
              ? 'bg-[var(--primary)] text-white shadow-lg hover:shadow-xl'
              : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:text-[var(--primary)]'
          }`}
          title={isCollapsed ? 'History' : undefined}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {!isCollapsed && <span>History</span>}
        </button>
      </div>

      {/* Conversations */}
      {!isCollapsed && (
        <div className="flex-1 overflow-y-auto px-2 scrollbar-thin">
          <div className="mb-4">
            <div className="px-3 py-2 text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">Recent Queries</div>
            {isLoadingConversations ? (
              <ConversationsSkeleton />
            ) : recentConversations.length > 0 ? (
              <div className="space-y-1">
                {recentConversations.map((conv, index) => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-1 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 animate-fade-in-up hover:scale-[1.02] active:scale-[0.98] ${
                      currentConversationId === conv.id
                        ? 'bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/30 shadow-md'
                        : 'text-[var(--foreground-secondary)] hover:bg-[var(--surface-hover)] hover:shadow-sm'
                    }`}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex-1 text-left min-w-0 truncate font-medium"
                    >
                      {conv.title}
                    </button>
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(conv.id);
                        }}
                        className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-50 dark:hover:bg-red-900/20 text-[var(--foreground-muted)] hover:text-red-500 transition-all hover:scale-110 active:scale-90 shrink-0"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      )}

      {/* User Profile */}
      <div className="p-3 border-t border-[var(--border)] glass-strong backdrop-blur-sm relative shrink-0">
        {isLoadingAuth ? (
          // Skeleton loader for user profile
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2`}>
            <div className="w-8 h-8 rounded-full glass animate-pulse shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3 glass rounded animate-pulse w-24" />
                <div className="h-2 glass rounded animate-pulse w-32" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              onClick={() => {
                if (isCollapsed) {
                  setIsCollapsed(false);
                }
                setIsUserMenuOpen(!isUserMenuOpen);
              }}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-xl hover:bg-[var(--surface-hover)] cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-[0.98]`}
              title={isCollapsed ? user?.name || 'User' : undefined}
            >
              {/* User Avatar - Profile Picture or First Name Initial */}
              {user?.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover shrink-0 border-2 border-[var(--primary)]/20 shadow-md"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold shrink-0 shadow-md">
                  {(() => {
                    if (user?.name?.trim()) {
                      const firstName = user.name.trim().split(/\s+/)[0];
                      if (firstName) return firstName.charAt(0).toUpperCase();
                    }
                    if (user?.email?.trim()) {
                      return user.email.charAt(0).toUpperCase();
                    }
                    return 'U';
                  })()}
                </div>
              )}
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-[var(--foreground)] truncate">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)] truncate">
                      {user?.email || ''}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-[var(--foreground-muted)] shrink-0 transition-transform group-hover:rotate-90" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </>
              )}
            </div>

            {/* User Menu Popup */}
            {isUserMenuOpen && (
              <BeeBotUserMenu
                user={user}
                onClose={() => setIsUserMenuOpen(false)}
                onOpenUserManagement={() => {
                  setIsUserMenuOpen(false);
                  onNavigateToUserManagement?.();
                }}
              />
            )}
          </>
        )}
      </div>

      {/* Search Modal */}
      {isSearchOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center pt-20 md:pt-24 px-4 bg-black/50 backdrop-blur-md animate-fade-in"
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div
            className="w-full max-w-xl glass-strong rounded-2xl shadow-2xl border border-[var(--border)] overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input area */}
            <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
              <div className="shrink-0 w-10 h-10 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center">
                <svg className="w-5 h-5 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                autoFocus
                className="flex-1 bg-transparent border-none focus:outline-none text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] text-base font-medium"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-[var(--surface-hover)] rounded-xl text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-all hover:scale-110 active:scale-90"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Results */}
            <div className="max-h-80 overflow-y-auto p-2 scrollbar-thin">
              {conversations
                .filter((conv) =>
                  conv.title.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((conversation, index) => (
                  <button
                    key={conversation.id}
                    onClick={() => {
                      onSelectConversation(conversation.id);
                      setIsSearchOpen(false);
                      setSearchQuery('');
                    }}
                    className="w-full text-left p-3 rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98] animate-fade-in-up"
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className="shrink-0 w-9 h-9 rounded-lg glass group-hover:bg-[var(--primary)]/10 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 text-[var(--foreground-secondary)] group-hover:text-[var(--primary)] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition-colors">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-[var(--foreground-muted)] mt-0.5">
                          {new Date(conversation.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-[var(--foreground-muted)] shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              {searchQuery && conversations.filter((conv) =>
                conv.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl glass flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-[var(--foreground-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-[var(--foreground-secondary)]">No conversations found</p>
                  <p className="text-xs text-[var(--foreground-muted)] mt-1">Try a different search term</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <DeleteConfirmModal
        isOpen={!!deleteConfirmId}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={() => {
          if (deleteConfirmId && onDeleteConversation) {
            onDeleteConversation(deleteConfirmId);
            setDeleteConfirmId(null);
          }
        }}
        title="Delete conversation"
        message="Are you sure you want to delete this chat? This action cannot be undone."
      />
    </div>
  );
}
