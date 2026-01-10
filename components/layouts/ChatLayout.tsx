'use client';

import { useState, ReactNode } from 'react';
import Sidebar from '@/components/chat/Sidebar';
import SourcesPanel from '@/components/chat/SourcesPanel';
import ChatHeader from '@/components/chat/ChatHeader';
import { Conversation, Source } from '@/types';
import { CloseIcon, MenuIcon } from '@/components/ui/Icons';
import IconButton from '@/components/ui/IconButton';
import { useAuth } from '@/contexts/AuthContext';

// Document icon for sources toggle
const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

interface ChatLayoutProps {
  children: ReactNode;
  conversations: Conversation[];
  currentConversationId: string;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  onDeleteConversation?: (id: string) => void;
  onLogout?: () => void;
  title: string;
  showHeader?: boolean;
  sources?: Source[];
}

export default function ChatLayout({
  children,
  conversations,
  currentConversationId,
  onSelectConversation,
  onNewConversation,
  onDeleteConversation,
  onLogout,
  title,
  showHeader = true,
  sources = [],
}: ChatLayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSourcesPanelOpen, setIsSourcesPanelOpen] = useState(false);
  const { user } = useAuth();

  // Convert AuthUser to Sidebar's User format
  const sidebarUser = user ? {
    name: user.name || user.email,
    email: user.email,
    avatar: user.picture_url || undefined,
  } : { name: 'User' };

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--background)]">
      {/* Desktop Sidebar */}
      <aside 
        className={`
          hidden lg:flex flex-shrink-0 
          transition-all duration-300 ease-out
          ${isSidebarCollapsed ? 'w-20' : 'w-72 xl:w-80'}
        `}
      >
        <Sidebar
          conversations={conversations}
          currentConversationId={currentConversationId}
          onSelectConversation={onSelectConversation}
          onNewConversation={onNewConversation}
          onDeleteConversation={onDeleteConversation}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          user={sidebarUser}
          onLogout={onLogout}
        />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`
          fixed inset-0 z-40 lg:hidden 
          transition-all duration-300 ease-out
          ${isMobileSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
      >
        {/* Backdrop */}
        <div 
          className={`
            absolute inset-0 bg-black/40 backdrop-blur-sm
            transition-opacity duration-300
            ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}
          `}
          onClick={() => setIsMobileSidebarOpen(false)}
        />
        
        {/* Sidebar Panel */}
        <aside
          className={`
            relative w-72 sm:w-80 h-full
            transform transition-transform duration-300 ease-out
            ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          `}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <div className="absolute top-4 right-4 z-10">
            <IconButton
              icon={<CloseIcon className="w-5 h-5" />}
              ariaLabel="Close sidebar"
              onClick={() => setIsMobileSidebarOpen(false)}
              variant="glass"
            />
          </div>
          
          <Sidebar
            conversations={conversations}
            currentConversationId={currentConversationId}
            onSelectConversation={(id) => {
              onSelectConversation(id);
              setIsMobileSidebarOpen(false);
            }}
            onNewConversation={() => {
              onNewConversation();
              setIsMobileSidebarOpen(false);
            }}
            onDeleteConversation={onDeleteConversation}
            user={sidebarUser}
            onLogout={onLogout}
          />
        </aside>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden relative">
        {showHeader ? (
          <ChatHeader
            title={title}
            onMenuClick={() => setIsMobileSidebarOpen(true)}
            rightActions={
              <IconButton
                icon={<DocumentIcon className="w-5 h-5" />}
                ariaLabel={isSourcesPanelOpen ? "Close sources" : "View sources"}
                onClick={() => setIsSourcesPanelOpen(!isSourcesPanelOpen)}
                variant={isSourcesPanelOpen ? "solid" : "ghost"}
              />
            }
          />
        ) : (
          /* Floating buttons when header is hidden */
          <>
            {/* Mobile Menu Button - left */}
            <div className="absolute top-4 left-4 z-10 lg:hidden">
              <IconButton
                icon={<MenuIcon className="w-5 h-5" />}
                ariaLabel="Open sidebar"
                onClick={() => setIsMobileSidebarOpen(true)}
                variant="glass"
              />
            </div>
            
            {/* Right side icons - always visible */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
              <IconButton
                icon={<DocumentIcon className="w-5 h-5" />}
                ariaLabel={isSourcesPanelOpen ? "Close sources" : "View sources"}
                onClick={() => setIsSourcesPanelOpen(!isSourcesPanelOpen)}
                variant={isSourcesPanelOpen ? "solid" : "glass"}
              />
            </div>
          </>
        )}
        
        {/* Main content area with sources panel */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Chat Content */}
          <div className="flex-1 overflow-hidden relative">
            {/* Decorative gradient orbs */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[var(--primary)]/10 to-purple-500/10 rounded-full blur-3xl -z-10 animate-float" />
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-blue-500/10 to-[var(--primary)]/10 rounded-full blur-3xl -z-10" style={{ animationDelay: '1.5s' }} />
            
            {children}
          </div>
          
          {/* Sources Panel */}
          <SourcesPanel
            isOpen={isSourcesPanelOpen}
            onClose={() => setIsSourcesPanelOpen(false)}
            sources={sources}
          />
        </div>
      </div>
    </div>
  );
}
