'use client';

import { useState, ReactNode } from 'react';
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
}

export default function BeeBotLayout({
  children,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
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
}: BeeBotLayoutProps) {
  const [isSourcesOpen, setIsSourcesOpen] = useState(false);

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <BeeBotSidebar
        conversations={conversations}
        currentConversationId={currentConversationId}
        onSelectConversation={onSelectConversation}
        user={user}
        onNavigateToHistory={onNavigateToHistory}
        onNavigateToChat={onNavigateToChat}
        onNavigateToUserManagement={onNavigateToUserManagement}
        onNavigateToLibrary={onNavigateToLibrary}
        onNavigateToInfographics={onNavigateToInfographics}
        isLoadingConversations={isLoadingConversations}
        isLoadingAuth={isLoadingAuth}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header - Only show when not in history, user management, library, or infographics view */}
        {!showHistory && !showUserManagement && !showLibrary && !showInfographics && (
          <BeeBotHeader 
            onNewChat={onNewConversation} 
            user={user}
            onToggleSources={() => setIsSourcesOpen(!isSourcesOpen)}
            isSourcesOpen={isSourcesOpen}
            sourcesCount={sources.length}
            currentConversationId={currentConversationId}
          />
        )}

        {/* Content */}
        {children}
      </div>

      {/* Sources Panel */}
      <SourcesPanel 
        isOpen={isSourcesOpen} 
        onClose={() => setIsSourcesOpen(false)}
        sources={sources}
      />
    </div>
  );
}
