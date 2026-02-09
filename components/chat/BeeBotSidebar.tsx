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
    <div className={`${isCollapsed ? 'w-16' : 'w-60'} h-screen bg-[#FAFAFA] flex flex-col border-r border-gray-200 transition-all duration-300`}>
      {/* Header */}
      <div className="p-4">
        {/* Logo and Collapse Button */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md flex items-center justify-center overflow-hidden">
              <StaticSphere />
            </div>
            {!isCollapsed && <span className="text-base font-bold text-gray-900">DANI</span>}
          </div>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className={`flex items-center justify-center p-1.5 rounded-lg hover:bg-gray-100 transition-colors ${isCollapsed ? 'pr-2' : ''}`}
          >
            <svg className={`w-4 h-4 text-gray-400 transition-transform ${isCollapsed ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </div>

        {/* Search */}
        {!isCollapsed && (
          <div className="relative mb-4">
            <button
              onClick={() => setIsSearchOpen(true)}
              className="w-full relative text-left"
            >
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div className="w-full pl-9 pr-12 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-400">
                Search
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <kbd className="text-xs text-gray-400 font-mono">⌘K</kbd>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="px-2 mb-2">
        <button
          onClick={() => {
            setActiveNav('home');
            if (onNavigateToChat) {
              onNavigateToChat();
            } else {
              router.push('/chat');
            }
          }}
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors ${
            activeNav === 'home' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
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
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeNav === 'library' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
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
                  className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm transition-colors ${
                    activeNav === 'infographics' ? 'bg-gray-200 text-gray-700' : 'text-gray-500 hover:bg-gray-100'
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
          className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'gap-3'} px-3 py-2 rounded-lg text-sm text-gray-500 hover:bg-gray-100 transition-colors ${
            activeNav === 'history' ? 'bg-gray-200 text-gray-700' : ''
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
        <div className="flex-1 overflow-y-auto px-2">
          <div className="mb-4">
            <div className="px-3 py-1 text-xs font-medium text-gray-400 uppercase">Recent Queries</div>
            {isLoadingConversations ? (
              <ConversationsSkeleton />
            ) : recentConversations.length > 0 ? (
              <div className="space-y-0.5">
                {recentConversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`group flex items-center gap-1 px-3 py-2 rounded-lg text-sm text-gray-600 hover:bg-gray-100 transition-colors ${
                      currentConversationId === conv.id ? 'bg-gray-200' : ''
                    }`}
                  >
                    <button
                      onClick={() => onSelectConversation(conv.id)}
                      className="flex-1 text-left min-w-0 truncate"
                    >
                      {conv.title}
                    </button>
                    {onDeleteConversation && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteConfirmId(conv.id);
                        }}
                        className="p-1 rounded opacity-0 group-hover:opacity-100 hover:bg-gray-200 text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
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
      <div className="p-3 border-t border-gray-200 relative">
        {isLoadingAuth ? (
          // Skeleton loader for user profile
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2`}>
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse flex-shrink-0" />
            {!isCollapsed && (
              <div className="flex-1 min-w-0 space-y-2">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                <div className="h-2 bg-gray-200 rounded animate-pulse w-32" />
              </div>
            )}
          </div>
        ) : (
          <>
            <div
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-2'} px-2 py-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors`}
              title={isCollapsed ? user?.name || 'User' : undefined}
            >
              {/* User Avatar - Profile Picture or First Name Initial */}
              {user?.picture_url ? (
                <img
                  src={user.picture_url}
                  alt={user.name || 'User'}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0 border border-gray-200"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
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
                    <div className="text-sm font-medium text-gray-700 truncate">
                      {user?.name || 'User'}
                    </div>
                    <div className="text-xs text-gray-400 truncate">
                      {user?.email || ''}
                    </div>
                  </div>
                  <svg className="w-4 h-4 text-gray-400 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
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
          className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4 bg-black/50 backdrop-blur-md animate-fade-in" 
          onClick={() => {
            setIsSearchOpen(false);
            setSearchQuery('');
          }}
        >
          <div 
            className="w-full max-w-xl bg-white rounded-2xl shadow-2xl ring-1 ring-black/5 overflow-hidden animate-scale-in" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search input area */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-gray-50 to-white border-b border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search conversations..."
                autoFocus
                className="flex-1 bg-transparent border-none focus:outline-none text-gray-900 placeholder:text-gray-400 text-base font-medium"
              />
              <button
                onClick={() => {
                  setIsSearchOpen(false);
                  setSearchQuery('');
                }}
                className="p-2 hover:bg-gray-200 rounded-xl text-gray-500 hover:text-gray-700 transition-colors"
                title="Close"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            {/* Results */}
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
                    className="w-full text-left p-3 rounded-xl hover:bg-orange-50/80 transition-colors group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-gray-100 group-hover:bg-orange-100 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4 text-gray-500 group-hover:text-orange-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate group-hover:text-[#FF8C00] transition-colors">
                          {conversation.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {new Date(conversation.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <svg className="w-4 h-4 text-gray-300 group-hover:text-orange-400 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </button>
                ))}
              {searchQuery && conversations.filter((conv) =>
                conv.title.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mb-3">
                    <svg className="w-7 h-7 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-600">No conversations found</p>
                  <p className="text-xs text-gray-400 mt-1">Try a different search term</p>
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
