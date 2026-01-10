'use client';

import { useState } from 'react';
import { Message, ConfidenceData, MessageTimings } from '@/types';
import Avatar from '@/components/ui/Avatar';
import { CopyIcon, RefreshIcon, ThumbsUpIcon, ThumbsDownIcon, SparkleIcon } from '@/components/ui/Icons';

// Document icon for sources indicator
const DocumentIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

// Clock icon for timing
const ClockIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// Warning icon for disclaimer
const WarningIcon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

// Confidence badge component
const ConfidenceBadge = ({ confidence }: { confidence: ConfidenceData }) => {
  const getConfidenceConfig = (level: string) => {
    switch (level) {
      case 'high':
        return { icon: '🟢', color: 'text-green-500', bg: 'bg-green-500/10', label: 'High' };
      case 'medium':
        return { icon: '🟡', color: 'text-yellow-500', bg: 'bg-yellow-500/10', label: 'Medium' };
      case 'low':
        return { icon: '🔴', color: 'text-red-500', bg: 'bg-red-500/10', label: 'Low' };
      default:
        return { icon: '⚪', color: 'text-gray-400', bg: 'bg-gray-500/10', label: 'Unknown' };
    }
  };

  const config = getConfidenceConfig(confidence.level);

  return (
    <div 
      className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs ${config.bg} ${config.color}`}
      title={`Score: ${(confidence.avg_score * 100).toFixed(0)}% (${confidence.chunk_count} chunks)`}
    >
      <span>{config.icon}</span>
      <span className="font-medium">{config.label}</span>
    </div>
  );
};

// Timing breakdown component
const TimingBreakdown = ({ timings }: { timings: MessageTimings }) => {
  const [expanded, setExpanded] = useState(false);
  
  const formatMs = (ms?: number) => {
    if (ms === undefined || ms === null) return '-';
    if (ms < 1000) return `${Math.round(ms)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  return (
    <div className="relative">
      <button
        onClick={(e) => { e.stopPropagation(); setExpanded(!expanded); }}
        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
        title="View timing breakdown"
      >
        <ClockIcon className="w-3.5 h-3.5" />
        <span>{formatMs(timings.total_ms)}</span>
      </button>
      
      {expanded && (
        <div className="absolute bottom-full left-0 mb-2 p-3 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)] shadow-lg z-10 min-w-[160px]">
          <div className="text-xs font-medium text-[var(--foreground)] mb-2">Response Timing</div>
          <div className="space-y-1 text-xs text-[var(--foreground-muted)]">
            {timings.retrieval_ms !== undefined && (
              <div className="flex justify-between gap-4">
                <span>Retrieval:</span>
                <span className="font-mono">{formatMs(timings.retrieval_ms)}</span>
              </div>
            )}
            {timings.prompt_build_ms !== undefined && (
              <div className="flex justify-between gap-4">
                <span>Prompt:</span>
                <span className="font-mono">{formatMs(timings.prompt_build_ms)}</span>
              </div>
            )}
            {timings.generation_ms !== undefined && (
              <div className="flex justify-between gap-4">
                <span>Generation:</span>
                <span className="font-mono">{formatMs(timings.generation_ms)}</span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-1 border-t border-[var(--glass-border)] font-medium text-[var(--foreground)]">
              <span>Total:</span>
              <span className="font-mono">{formatMs(timings.total_ms)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface ChatMessageProps {
  message: Message;
  isLoading?: boolean;
  isSelected?: boolean;
  onRegenerate?: () => void;
  onSelectMessage?: (messageId: string) => void;
}

export default function ChatMessage({ message, isLoading, isSelected, onRegenerate, onSelectMessage }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const hasSources = !isUser && message.sources && message.sources.length > 0;
  const hasConfidence = !isUser && message.confidence;
  const hasTimings = !isUser && message.timings;
  const hasDisclaimer = !isUser && message.disclaimer;

  const handleClick = () => {
    if (hasSources && onSelectMessage) {
      console.log('[ChatMessage] Message clicked, sources:', message.sources?.length);
      onSelectMessage(message.id);
    }
  };
  
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type: 'up' | 'down') => {
    setFeedback(feedback === type ? null : type);
  };

  return (
    <div className="flex justify-center py-4 px-4 animate-fade-in-up">
      <div
        onClick={handleClick}
        className={`
          w-full max-w-3xl rounded-2xl
          transition-all duration-300
          ${isUser 
            ? 'bg-gradient-to-r from-[var(--primary)] to-purple-500 text-white shadow-lg shadow-[var(--primary-glow)]' 
            : 'glass border border-[var(--glass-border)]'
          }
          ${hasSources ? 'cursor-pointer hover:border-[var(--primary)]/50' : ''}
          ${isSelected ? 'ring-2 ring-[var(--primary)] border-[var(--primary)]' : ''}
        `}
      >
        <div className="flex gap-4 p-5">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {isUser ? (
              <Avatar alt="User" fallback="You" size="md" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center text-white shadow-md">
                <SparkleIcon className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Message Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-sm font-semibold ${isUser ? 'text-white/90' : 'text-[var(--foreground)]'}`}>
                {isUser ? 'You' : 'DANI'}
              </span>
              <span className={`text-xs ${isUser ? 'text-white/60' : 'text-[var(--foreground-muted)]'}`}>
                {formatTime(message.timestamp)}
              </span>
              {/* Confidence badge */}
              {hasConfidence && message.confidence && (
                <ConfidenceBadge confidence={message.confidence} />
              )}
            </div>

            <div className="prose prose-sm max-w-none">
              {isLoading ? (
                <div className="flex items-center gap-3 text-[var(--foreground-secondary)]">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[var(--primary)] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-sm">Thinking...</span>
                </div>
              ) : (
                <div className={`whitespace-pre-wrap break-words ${isUser ? 'text-white/95' : 'text-[var(--foreground)]'}`}>
                  {message.content}
                </div>
              )}
              
              {/* Low confidence disclaimer */}
              {hasDisclaimer && message.disclaimer && (
                <div className="mt-3 flex items-start gap-2 p-2.5 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                  <WarningIcon className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    {message.disclaimer}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons - Only for assistant messages */}
        {!isUser && !isLoading && (
          <div className="flex items-center gap-1 px-5 pb-4 pt-0">
            {/* Sources indicator */}
            {hasSources && (
              <div 
                className={`
                  flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs
                  ${isSelected 
                    ? 'bg-[var(--primary)]/20 text-[var(--primary)]' 
                    : 'bg-[var(--surface-hover)] text-[var(--foreground-muted)]'
                  }
                `}
              >
                <DocumentIcon className="w-3.5 h-3.5" />
                <span>{message.sources?.length} sources</span>
              </div>
            )}

            {/* Timing breakdown */}
            {hasTimings && message.timings && (
              <TimingBreakdown timings={message.timings} />
            )}

            <div className="flex-1" />

            <button
              onClick={handleCopy}
              className="
                p-2 rounded-lg
                text-[var(--foreground-muted)] 
                hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]
                transition-all duration-200
                flex items-center gap-1.5
              "
              title="Copy"
            >
              <CopyIcon className="w-4 h-4" />
              {copied && <span className="text-xs text-[var(--primary)]">Copied!</span>}
            </button>
            
            {onRegenerate && (
              <button
                onClick={onRegenerate}
                className="
                  p-2 rounded-lg
                  text-[var(--foreground-muted)] 
                  hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]
                  transition-all duration-200
                "
                title="Regenerate"
              >
                <RefreshIcon className="w-4 h-4" />
              </button>
            )}
            
            <div className="flex-1" />
            
            <button
              onClick={() => handleFeedback('up')}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${feedback === 'up'
                  ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
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
                  ? 'text-red-500 bg-red-500/10'
                  : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                }
              `}
              title="Bad response"
            >
              <ThumbsDownIcon className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
