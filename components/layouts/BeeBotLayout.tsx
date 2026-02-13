'use client';

import { useState, useEffect, ReactNode } from 'react';
import BeeBotSidebar from '@/components/chat/BeeBotSidebar';
import BeeBotHeader from '@/components/chat/BeeBotHeader';
import SourcesPanel from '@/components/chat/SourcesPanel';
import { Conversation, AuthUser, Source } from '@/types';

interface BeeBotLayoutProps {
  children: ReactNode;
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  user: AuthUser | null;
  sources?: Source[];
  showHistory?: boolean;
  showUserManagement?: boolean;
  showLibrary?: boolean;
  showInfographics?: boolean;
  onNavigateToHistory?: () => void;
  onNavigateToChat?: () => void;
  onNavigateToUserManagement?: () => void;
  onNavigateToLibrary?: () => void;
  onNavigateToInfographics?: () => void;
  isLoadingConversations?: boolean;
  isLoadingAuth?: boolean;
  /** When this increments, the Sources panel will auto-open (e.g. when user clicks a message with sources) */
  openSourcesTrigger?: number;
}

export default function BeeBotLayout({
  children,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  user,
  sources = [],
  showHistory = false,
  showUserManagement = false,
  showLibrary = false,
  showInfographics = false,
  onNavigateToHistory,
  onNavigateToChat,
  onNavigateToUserManagement,
  onNavigateToLibrary,
  onNavigateToInfographics,
  isLoadingConversations = false,
  isLoadingAuth = false,
  openSourcesTrigger = 0,
}: BeeBotLayoutProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  useEffect(() => {
    if (openSourcesTrigger > 0) {
      setIsSourcesOpen(true);
    }
  }, [openSourcesTrigger]);

  // Close Sources panel when switching to new chat (no sources)
  useEffect(() => {
    if (currentConversationId === 'new' || sources.length === 0) {
      setIsSourcesOpen(false);
    }
  }, [currentConversationId, sources.length]);

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-[var(--background)] via-[var(--background)] to-[var(--background-secondary)]">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex shrink-0">
        <BeeBotSidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onDeleteConversation={onDeleteConversation}
          user={user}
          onNavigateToHistory={onNavigateToHistory}
          onNavigateToChat={onNavigateToChat}
          onNavigateToUserManagement={onNavigateToUserManagement}
          onNavigateToLibrary={onNavigateToLibrary}
          onNavigateToInfographics={onNavigateToInfographics}
          isLoadingConversations={isLoadingConversations}
          isLoadingAuth={isLoadingAuth}
        />
      </aside>

      {/* Mobile Sidebar Overlay - Full Screen */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Full Screen Sidebar - No backdrop, sidebar covers everything */}
          <aside className="relative w-full h-full shadow-2xl transform transition-transform duration-300 ease-in-out animate-slide-in-left">
            {/* Close Button */}
            <div className="absolute top-4 right-4 z-10">
              <button
                onClick={() => setIsMobileSidebarOpen(false)}
                className="p-2 rounded-xl bg-[var(--surface)] hover:bg-[var(--surface-hover)] border border-[var(--border)] transition-all"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5 text-[var(--foreground)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <BeeBotSidebar
              conversations={conversations}
              currentConversationId={currentConversationId}
              onSelectConversation={(id) => {
                onSelectConversation(id);
                setIsMobileSidebarOpen(false);
              }}
              onDeleteConversation={onDeleteConversation}
              user={user}
              onNavigateToHistory={() => {
                onNavigateToHistory?.();
                setIsMobileSidebarOpen(false);
              }}
              onNavigateToChat={() => {
                onNavigateToChat?.();
                setIsMobileSidebarOpen(false);
              }}
              onNavigateToUserManagement={() => {
                onNavigateToUserManagement?.();
                setIsMobileSidebarOpen(false);
              }}
              onNavigateToLibrary={() => {
                onNavigateToLibrary?.();
                setIsMobileSidebarOpen(false);
              }}
              onNavigateToInfographics={() => {
                onNavigateToInfographics?.();
                setIsMobileSidebarOpen(false);
              }}
              isLoadingConversations={isLoadingConversations}
              isLoadingAuth={isLoadingAuth}
            />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-w-0">
        {/* Header - Only show when not in history, user management, library, or infographics view */}
        {!showHistory && !showUserManagement && !showLibrary && !showInfographics && (
          <BeeBotHeader
            onNewChat={onNewConversation}
            user={user}
            onToggleSources={() => setIsSourcesOpen(!isSourcesOpen)}
            isSourcesOpen={isSourcesOpen}
            sourcesCount={sources.length}
            currentConversationId={currentConversationId}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
          />
        )}

        {/* Content Area with decorative gradient orbs */}
        <div className="flex-1 flex overflow-hidden relative">
          <div className="flex-1 overflow-hidden relative">
            {/* Decorative gradient orbs - animated background */}
            <div className="absolute top-0 right-0 w-72 md:w-96 h-72 md:h-96 bg-gradient-to-br from-[var(--primary)]/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-float pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-64 md:w-80 h-64 md:h-80 bg-gradient-to-tr from-blue-500/10 to-[var(--primary)]/10 rounded-full blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '1.5s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-56 md:w-72 h-56 md:h-72 bg-gradient-to-br from-purple-500/5 to-pink-500/5 rounded-full blur-3xl -z-10 animate-float pointer-events-none" style={{ animationDelay: '3s' }} />
            {children}
          </div>

          {/* Sources Panel */}
          <SourcesPanel
            isOpen={isSourcesOpen}
            onClose={() => setIsSourcesOpen(false)}
            sources={sources}
          />
        </div>
      </div>
    </div>
  );
}
