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

    gradient.addColorStop(0, 'rgba(255, 140, 0, 1)');
    gradient.addColorStop(0.3, 'rgba(255, 100, 80, 0.9)');
    gradient.addColorStop(0.5, 'rgba(255, 120, 150, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 180, 200, 0.3)');
    gradient.addColorStop(1, 'rgba(255, 200, 200, 0)');

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
  onRegenerate?: () => void;
  onSelectMessage?: (messageId: string) => void;
  onEdit?: (messageId: string, newContent: string) => void;
  userPictureUrl?: string | null;
}

export default function ChatMessage({ message, isLoading, isSelected, onSelectMessage, onEdit, userPictureUrl }: ChatMessageProps) {
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
    <div className="flex flex-col py-4 px-6 animate-fade-in-up group hover:bg-gray-50/30 transition-colors duration-200">
      <div className="max-w-4xl w-full mx-auto">
        <div className="flex items-start gap-4">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0 mt-0.5">
            {isUser ? (
              userPictureUrl ? (
                <img
                  src={userPictureUrl}
                  alt="User"
                  className="w-8 h-8 rounded-full object-cover border-2 border-gray-200 shadow-sm ring-2 ring-white"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 border-2 border-gray-200 flex items-center justify-center shadow-sm ring-2 ring-white">
                  <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
              )
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md border border-orange-200/50 ring-2 ring-white">
                <StaticSphere />
              </div>
            )}
          </div>

          {/* Message Bubble - Only show if there's content, attachments, or loading */}
          <div className="flex-1 min-w-0">
            {(isLoading || message.content || (isUser && message.attachments && message.attachments.length > 0)) && (
            <div
                      className={`
                rounded-2xl px-5 py-4 transition-all duration-200
                        ${isUser
                  ? 'bg-white border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300'
                  : 'bg-gradient-to-br from-white via-orange-50/30 to-amber-50/20 border border-orange-100/50 shadow-sm hover:shadow-md'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center gap-3 text-gray-600">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 animate-bounce shadow-sm" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 animate-bounce shadow-sm" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 animate-bounce shadow-sm" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm font-medium">Thinking...</span>
                </div>
              ) : message.content ? (
                  <div className={`prose prose-sm max-w-none break-words ${isUser ? 'text-gray-900' : 'text-gray-800'}`}>
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                  </div>
                ) : null
              }

              {/* Show attachments for user messages */}
              {isUser && message.attachments && message.attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-gray-200/60">
                  {message.attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-br from-gray-50 to-gray-100/50 border border-gray-200 rounded-lg text-xs shadow-sm hover:shadow-md hover:border-gray-300 transition-all"
                    >
                      {/* File icon based on type */}
                      <svg className="w-4 h-4 text-orange-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>

                      {/* File name */}
                      <span className="text-gray-700 font-medium max-w-[200px] truncate">
                        {attachment.name}
                      </span>

                      {/* File size if available */}
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
            </div>
            )}

        {/* Action Buttons - Only for assistant messages */}
        {!isUser && !isLoading && (
              <div className="flex items-center gap-1.5 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {/* Thumbs Up/Down */}
            <button
              onClick={() => handleFeedback('up')}
              className={`
                    p-2 rounded-lg transition-all duration-200
                ${feedback === 'up'
                      ? 'text-[#FF8C00] bg-orange-100 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }
              `}
              title="Good response"
            >
              <ThumbsUpIcon className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleFeedback('down')}
              className={`
                    p-2 rounded-lg transition-all duration-200
                ${feedback === 'down'
                      ? 'text-red-500 bg-red-50 shadow-sm'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 hover:shadow-sm'
                }
              `}
              title="Bad response"
            >
              <ThumbsDownIcon className="w-4 h-4" />
            </button>

                {/* Copy Button */}
                <button
                  onClick={handleCopy}
                  className="px-3 py-2 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-all duration-200 flex items-center gap-1.5 hover:shadow-sm"
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
