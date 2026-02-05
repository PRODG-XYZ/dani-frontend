'use client';

import { AuthUser } from '@/types';
import { downloadConversation } from '@/services/api';

interface BeeBotHeaderProps {
  onNewChat: () => void;
  user: AuthUser | null;
  onToggleSources?: () => void;
  isSourcesOpen?: boolean;
  sourcesCount?: number;
  currentConversationId?: string | null;
}

export default function BeeBotHeader({ 
  onNewChat, 
  user,
  onToggleSources,
  isSourcesOpen = false,
  sourcesCount = 0,
  currentConversationId,
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
    <header className="flex items-center justify-end px-8 py-3 bg-white border-b border-gray-200">
      {/* Right - Actions */}
      <div className="flex items-center gap-3">
        {/* Export Button - Only show when viewing a conversation */}
        {currentConversationId && currentConversationId !== 'new' && (
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
            title="Export conversation"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
          </button>
        )}
        {/* Sources Toggle Button */}
        {onToggleSources && (
          <button
            onClick={onToggleSources}
            className={`relative flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              isSourcesOpen 
                ? 'bg-orange-100 text-orange-700' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            title="View sources"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sourcesCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
                {sourcesCount}
              </span>
            )}
          </button>
        )}
        {/* New Chat Button */}
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-4 py-2 bg-black text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>

        {/* User Avatar */}
        {user?.picture_url ? (
          <img 
            src={user.picture_url} 
            alt={user.name || 'User'} 
            className="w-9 h-9 rounded-full object-cover cursor-pointer"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-400 flex items-center justify-center text-white text-sm font-semibold cursor-pointer">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
        )}
      </div>
    </header>
  );
}
