'use client';

import { AuthUser } from '@/types';

interface BeeBotHeaderProps {
  onNewChat: () => void;
  user: AuthUser | null;
}

export default function BeeBotHeader({ onNewChat, user }: BeeBotHeaderProps) {
  return (
    <header className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-200">
      {/* Left - Model Selector */}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors">
        <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-gray-700">BeeBot 4o</span>
        <svg className="w-3.5 h-3.5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Right - Actions */}
      <div className="flex items-center gap-3">
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
