'use client';

import { useState } from 'react';
import { Message } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { CopyIcon, RefreshIcon, ThumbsUpIcon, ThumbsDownIcon } from '@/components/ui/Icons';

// Lightning bolt icon for AI messages
const LightningIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

// Paper airplane icon
const PaperPlaneIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isSelected?: boolean;
  onRegenerate?: () => void;
  onSelectMessage?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export default function ChatMessage({ message, isLoading, isSelected, onRegenerate, onSelectMessage, onEdit }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <div className="flex flex-col py-3 px-8 animate-fade-in-up">
      <div className="max-w-3xl w-full">
        <div className="flex items-start gap-3">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              <Avatar alt="User" fallback="You" size="sm" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#FF8C00] to-[#FF6B35] flex items-center justify-center">
                <LightningIcon className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>

          {/* Message Bubble */}
          <div className="flex-1 min-w-0">
            <div
              className={`
                rounded-2xl px-4 py-3
                ${isUser 
                  ? 'bg-white border border-gray-200' 
                  : 'bg-gradient-to-br from-orange-50 to-orange-100/50 border border-orange-200/50'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center gap-2 text-gray-500">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              ) : (
                <div className={`whitespace-pre-wrap break-words text-sm leading-relaxed ${isUser ? 'text-gray-900' : 'text-gray-800'}`}>
                  {message.content}
                </div>
              )}
            </div>

            {/* Action Buttons - Only for assistant messages */}
            {!isUser && !isLoading && (
              <div className="flex items-center gap-2 mt-2 px-1">
                {/* Thumbs Up/Down */}
                <button
                  onClick={() => handleFeedback('up')}
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${feedback === 'up'
                      ? 'text-[#FF8C00] bg-orange-100'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  title="Good response"
                >
                  <ThumbsUpIcon className="w-4 h-4" />
                </button>
                
                <button
                  onClick={() => handleFeedback('down')}
                  className={`
                    p-1.5 rounded-lg transition-colors
                    ${feedback === 'down'
                      ? 'text-red-500 bg-red-50'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                    }
                  `}
                  title="Bad response"
                >
                  <ThumbsDownIcon className="w-4 h-4" />
                </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Copy"
                >
                  <CopyIcon className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>

                {/* Add to Editor Button */}
                <button
                  className="px-3 py-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors flex items-center gap-1.5"
                  title="Add to Editor"
                >
                  <PaperPlaneIcon className="w-3.5 h-3.5" />
                  Add to Editor
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
