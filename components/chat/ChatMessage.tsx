'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Message } from '@/types';
import { CopyIcon, ThumbsUpIcon, ThumbsDownIcon } from '@/components/ui/Icons';
import ToolResultBlock from '@/components/chat/ToolResultBlock';

// Static Pulsating Sphere for AI (no animation)
const StaticSphere = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas first
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = 20;

    const gradient = ctx.createRadialGradient(
      centerX,
      centerY,
      0,
      centerX,
      centerY,
      radius
    );

    gradient.addColorStop(0, 'rgba(251, 191, 36, 1)');
    gradient.addColorStop(0.3, 'rgba(249, 115, 22, 0.95)');
    gradient.addColorStop(0.5, 'rgba(244, 63, 94, 0.8)');
    gradient.addColorStop(0.7, 'rgba(251, 146, 60, 0.4)');
    gradient.addColorStop(1, 'rgba(253, 186, 116, 0)');

    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();
  }, []);

  return <canvas ref={canvasRef} width={32} height={32} className="rounded-full block" />;
};

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isSelected?: boolean;
  isLastMessage?: boolean;
  onRegenerate?: () => void;
  onSelectMessage?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  userPictureUrl?: string | null;
}

export default function ChatMessage({ message, isLoading, isSelected, isLastMessage, onSelectMessage, onEdit, userPictureUrl }: ChatMessageProps) {
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
    <div className={`flex flex-col pt-3 px-8 animate-fade-in-up ${isLastMessage ? 'pb-8' : 'pb-3'}`}>
      <div className={`max-w-5xl w-full ${isUser ? 'ml-auto' : ''}`}>
        <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
          {/* Avatar/Icon */}
          <div className="flex-shrink-0 mt-1">
            {isUser ? (
              userPictureUrl ? (
                <img
                  src={userPictureUrl}
                  alt="User"
                  className="w-6 h-6 rounded-full object-cover border border-gray-200"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gray-200 border border-gray-200 flex items-center justify-center">
                  <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )
            ) : (
              <div className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0">
                <StaticSphere />
              </div>
            )}
          </div>

          {/* Message Bubble - hide when content_writer with empty content (only show tool result) */}
          <div className="flex-1 min-w-0">
            {!(
              !isUser &&
              message.toolName === 'content_writer' &&
              message.toolResult &&
              (!message.content || !message.content.trim())
            ) && (
            <div
              onClick={(e) => {
                if (!isUser && onSelectMessage && !(e.target as HTMLElement).closest('a')) {
                  onSelectMessage(message.id);
                }
              }}
              className={`
                rounded-2xl px-4 py-3
                ${isUser
                  ? 'bg-white border border-gray-200'
                  : 'bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 border-2 border-orange-300/60 shadow-sm'
                }
                ${!isUser && onSelectMessage ? 'cursor-pointer hover:border-orange-400/80 hover:shadow-md transition-all' : ''}
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
              ) : message.content ? (
                <div className={`prose prose-sm max-w-none break-words ${isUser ? 'text-gray-900' : 'text-gray-800'} text-sm leading-relaxed`}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                </div>
              ) : null}

              {/* Show attachments for user messages */}
              {isUser && message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-gray-200/60">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="inline-flex items-center gap-2 px-2 py-1.5 bg-gray-100 rounded-lg text-xs border border-gray-200"
                    >
                      <svg className="w-3.5 h-3.5 text-gray-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-700 max-w-[200px] truncate">{attachment.name}</span>
                      {attachment.size && (
                        <span className="text-gray-500 text-[11px]">
                          {attachment.size < 1024
                            ? `${attachment.size}B`
                            : attachment.size < 1024 * 1024
                            ? `${(attachment.size / 1024).toFixed(1)}KB`
                            : `${(attachment.size / (1024 * 1024)).toFixed(1)}MB`}
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Sources count tag - assistant messages only */}
              {!isUser && !isLoading && message.sources && message.sources.length > 0 && (
                <div className="mt-3 pt-2 border-t border-orange-300/60">
                  <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-100 text-amber-800 text-xs font-medium">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    {message.sources.length} {message.sources.length === 1 ? 'source' : 'sources'}
                  </span>
                </div>
              )}
            </div>
            )}

        {/* Action Buttons - Only for assistant messages (hide for content_writer with only tool result) */}
        {!isUser && !isLoading && !(
          message.toolName === 'content_writer' &&
          message.toolResult &&
          (!message.content || !message.content.trim())
        ) && (
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
              </div>
            )}

            {/* Tool result (e.g. generated infographic) */}
            {!isUser && message.toolResult && message.toolName && (
              <div className="mt-3">
                <ToolResultBlock
                  toolName={message.toolName as "infographic_generator" | "content_writer"}
                  data={message.toolResult}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
