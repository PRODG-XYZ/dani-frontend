'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import ChatLayout from '@/components/layouts/ChatLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Conversation } from '@/types';
import { SendIcon, VoiceIcon } from '@/components/ui/Icons';
import { 
  generateContent, 
  refineContent, 
  getContentTypes,
  GhostwriteResponse,
  ContentType,
  ToneValue,
  DocTypeFilter,
  getConversations,
  GhostwriteSource,
} from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Fallback content types when API fails
const DEFAULT_CONTENT_TYPES: { type: string; label: string; icon: string }[] = [
  { type: 'linkedin_post', label: 'LinkedIn Post', icon: '💼' },
  { type: 'email', label: 'Email', icon: '📧' },
  { type: 'blog_draft', label: 'Blog Post', icon: '📝' },
  { type: 'tweet_thread', label: 'Tweet Thread', icon: '🐦' },
  { type: 'newsletter', label: 'Newsletter', icon: '📰' },
  { type: 'meeting_summary', label: 'Meeting Summary', icon: '📋' },
];

function formatContentTypeLabel(type: string): string {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function iconForType(type: string): string {
  const mapping: Record<string, string> = {
    linkedin_post: '💼',
    email: '📧',
    blog_draft: '📝',
    tweet_thread: '🐦',
    newsletter: '📰',
    meeting_summary: '📋',
  };
  return mapping[type] ?? '📄';
}

const TONE_OPTIONS: { value: ToneValue | ''; label: string }[] = [
  { value: '', label: 'Auto Tone' },
  { value: 'formal', label: 'Formal' },
  { value: 'casual', label: 'Casual' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'inspirational', label: 'Inspirational' },
];

const SOURCE_OPTIONS: { value: DocTypeFilter; label: string }[] = [
  { value: 'all', label: 'All Sources' },
  { value: 'meeting', label: 'Meetings Only' },
  { value: 'document', label: 'Documents Only' },
  { value: 'email', label: 'Emails Only' },
];

export default function GhostwriterPage() {
  const router = useRouter();
  const { signOut, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  
  // Conversations for sidebar
  const [conversations, setConversations] = useState<Conversation[]>([]);
  
  // Content types from API
  const [contentTypes, setContentTypes] = useState<{ type: string; label: string; icon: string }[]>(DEFAULT_CONTENT_TYPES);
  const [contentTypesLoading, setContentTypesLoading] = useState(true);
  
  // Form state
  const [contentType, setContentType] = useState<string>('linkedin_post');
  const [request, setRequest] = useState('');
  const [tone, setTone] = useState<ToneValue | undefined>(undefined);
  const [docType, setDocType] = useState<DocTypeFilter>('all');
  const [isFocused, setIsFocused] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  
  // Generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GhostwriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Refine state
  const [showRefine, setShowRefine] = useState(false);
  const [refineFeedback, setRefineFeedback] = useState('');
  const [isRefining, setIsRefining] = useState(false);
  
  // Copy state
  const [copied, setCopied] = useState(false);

  // Load conversations for sidebar
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const loadConversations = async () => {
      try {
        const response = await getConversations(1, 50);
        const loadedConversations: Conversation[] = response.conversations.map(
          (conv) => ({
            id: conv.id,
            title: conv.title || 'Untitled',
            messages: [],
            createdAt: new Date(conv.created_at),
            updatedAt: new Date(conv.updated_at),
          })
        );
        setConversations(loadedConversations);
      } catch (err) {
        console.error('Failed to load conversations:', err);
      }
    };

    loadConversations();
  }, [isAuthenticated, isAuthLoading]);

  // Load content types from API
  useEffect(() => {
    if (isAuthLoading || !isAuthenticated) return;

    const loadContentTypes = async () => {
      try {
        setContentTypesLoading(true);
        const types: ContentType[] = await getContentTypes();
        if (types.length > 0) {
          setContentTypes(
            types.map((t) => ({
              type: t.type,
              label: formatContentTypeLabel(t.type),
              icon: iconForType(t.type),
            }))
          );
          setContentType((prev) => (types.some((t) => t.type === prev) ? prev : types[0].type));
        }
      } catch (err) {
        console.error('Failed to load content types:', err);
      } finally {
        setContentTypesLoading(false);
      }
    };

    loadContentTypes();
  }, [isAuthenticated, isAuthLoading]);

  const handleSelectConversation = useCallback((id: string) => {
    router.push(`/chat?conversation=${id}`);
  }, [router]);

  const handleNewConversation = useCallback(() => {
    router.push('/chat');
  }, [router]);

  const handleGenerate = async () => {
    if (!request.trim() || request.length < 5) {
      setError('Please describe what you want to write (at least 5 characters)');
      return;
    }

    setIsGenerating(true);
    setError(null);
    setResult(null);

    try {
      const response = await generateContent({
        content_type: contentType,
        request: request.trim(),
        doc_type: docType !== 'all' ? docType : undefined,
        tone: tone,
      });
      setResult(response);
    } catch (err) {
      console.error('Generation failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!result || !refineFeedback.trim()) return;

    setIsRefining(true);
    setError(null);

    try {
      const response = await refineContent({
        content: result.content,
        feedback: refineFeedback.trim(),
        content_type: result.content_type,
      });
      
      const totalMs = response.timing?.total_ms ?? result.timing?.total_ms ?? 0;
      setResult(prev => prev ? {
        ...prev,
        content: response.content,
        word_count: response.word_count,
        timing: { ...prev.timing, total_ms: totalMs },
      } : null);
      
      setShowRefine(false);
      setRefineFeedback('');
    } catch (err) {
      console.error('Refine failed:', err);
      setError(err instanceof Error ? err.message : 'Failed to refine content');
    } finally {
      setIsRefining(false);
    }
  };

  const handleCopy = async () => {
    if (!result) return;
    try {
      await navigator.clipboard.writeText(result.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && request.trim()) {
      e.preventDefault();
      handleGenerate();
    }
  };

  const selectedTypeInfo = contentTypes.find(t => t.type === contentType);

  // Convert ghostwriter sources to chat Source format for sidebar
  const formattedSources = (result?.sources ?? []).map((s: GhostwriteSource) => ({
    title: s.title ?? null,
    date: s.date ? (typeof s.date === 'number' ? new Date(s.date * 1000).toISOString() : String(s.date)) : null,
    transcript_id: s.transcript_id ?? null,
    speakers: [],
    text_preview: '',
    relevance_score: s.relevance_score ?? null,
  }));

  return (
    <ProtectedRoute>
      <ChatLayout
        conversations={conversations}
        currentConversationId="ghostwriter"
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onLogout={signOut}
        title="Ghostwriter"
        showHeader={false}
        sources={formattedSources}
      >
        <div className="flex flex-col items-center justify-center min-h-full h-full px-4 py-8 relative overflow-hidden lg:-ml-20">
          {/* Decorative Background Elements */}
          <div className="absolute inset-0 overflow-hidden -z-10">
            <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[var(--primary)]/20 to-purple-500/20 rounded-full blur-3xl animate-float" />
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" style={{ animationDelay: '1s' }} />
            <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl" style={{ animationDelay: '2s' }} />
          </div>

          {/* Show form when no result, or result view */}
          {!result ? (
            <>
              {/* Logo Area */}
              <div className="mb-10 flex flex-col items-center animate-fade-in-down">
                <div className="relative mb-6">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-500 flex items-center justify-center shadow-2xl shadow-[var(--primary-glow)] animate-float">
                    <span className="text-4xl">✍️</span>
                  </div>
                  <div className="absolute inset-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-purple-500 blur-xl opacity-50 -z-10 animate-pulse-glow" />
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-3">
                  <span className="gradient-text">Ghostwriter</span>
                </h1>
                <p className="text-lg text-[var(--foreground-secondary)] text-center max-w-md">
                  Generate content in your voice
                </p>
              </div>

              {/* Input Area - Chat Style */}
              <div className="w-full max-w-2xl mb-6 animate-fade-in-up relative">
                <div 
                  className={`
                    relative flex flex-col
                    glass-strong rounded-2xl
                    transition-all duration-300
                    ${isFocused 
                      ? 'ring-2 ring-[var(--primary)] shadow-2xl shadow-[var(--primary-glow)]' 
                      : 'shadow-lg hover:shadow-xl'
                    }
                  `}
                >
                  {/* Selected Content Type Chip (if not default) */}
                  {contentType !== 'linkedin_post' || tone || docType !== 'all' ? (
                    <div className="flex flex-wrap gap-2 px-4 pt-3">
                      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] text-sm">
                        {selectedTypeInfo?.icon} {selectedTypeInfo?.label}
                        {tone && <span className="text-xs opacity-70">• {tone}</span>}
                        {docType !== 'all' && <span className="text-xs opacity-70">• {SOURCE_OPTIONS.find(s => s.value === docType)?.label}</span>}
                      </span>
                    </div>
                  ) : null}

                  {/* Input Row */}
                  <div className="flex items-center p-2 pl-4">
                    {/* + Button */}
                    <button 
                      type="button"
                      onClick={() => setShowOptions(!showOptions)}
                      className={`
                        p-2 rounded-xl transition-all duration-200
                        ${showOptions 
                          ? 'text-[var(--primary)] bg-[var(--primary)]/10'
                          : 'text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)]'
                        }
                      `}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </button>

                    {/* Text Input */}
                    <input 
                      type="text"
                      value={request}
                      onChange={(e) => setRequest(e.target.value)}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      placeholder="What do you want to write?"
                      className="
                        flex-1 bg-transparent border-none outline-none 
                        text-[var(--foreground)] placeholder-[var(--foreground-muted)]
                        px-3 py-2 text-base
                      "
                    />

                    {/* Right Buttons */}
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={handleGenerate}
                        disabled={!request.trim() || isGenerating}
                        className={`
                          p-2.5 rounded-xl transition-all duration-300
                          ${request.trim() && !isGenerating
                            ? 'bg-gradient-to-r from-[var(--primary)] to-purple-500 text-white shadow-lg shadow-[var(--primary-glow)] hover:scale-105 hover:shadow-xl'
                            : 'bg-[var(--surface)] text-[var(--foreground-muted)]'
                          }
                        `}
                      >
                        {isGenerating ? (
                          <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        ) : (
                          <SendIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Options Popup */}
                {showOptions && (
                  <>
                    {/* Backdrop */}
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowOptions(false)}
                    />
                    
                    {/* Popup Menu */}
                    <div className="absolute bottom-full left-0 mb-2 w-72 z-50 animate-fade-in">
                      <div className="glass-strong rounded-xl shadow-2xl border border-[var(--border)] overflow-hidden">
                        {/* Content Type */}
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Content Type</p>
                          <div className="grid grid-cols-2 gap-1">
                            {contentTypes.map((type) => (
                              <button
                                key={type.type}
                                onClick={() => {
                                  setContentType(type.type);
                                }}
                                className={`
                                  flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-left
                                  transition-all duration-150
                                  ${contentType === type.type
                                    ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                                    : 'hover:bg-[var(--surface-hover)] text-[var(--foreground-secondary)]'
                                  }
                                `}
                              >
                                <span>{type.icon}</span>
                                <span className="truncate">{type.label}</span>
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Tone */}
                        <div className="p-3 border-b border-[var(--border)]">
                          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Tone</p>
                          <div className="flex flex-wrap gap-1">
                            {TONE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setTone(opt.value as ToneValue || undefined)}
                                className={`
                                  px-3 py-1.5 rounded-lg text-sm
                                  transition-all duration-150
                                  ${(tone || '') === opt.value
                                    ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                                    : 'hover:bg-[var(--surface-hover)] text-[var(--foreground-secondary)]'
                                  }
                                `}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Source Filter */}
                        <div className="p-3">
                          <p className="text-xs font-medium text-[var(--foreground-muted)] mb-2 uppercase tracking-wide">Source Filter</p>
                          <div className="flex flex-wrap gap-1">
                            {SOURCE_OPTIONS.map((opt) => (
                              <button
                                key={opt.value}
                                onClick={() => setDocType(opt.value)}
                                className={`
                                  px-3 py-1.5 rounded-lg text-sm
                                  transition-all duration-150
                                  ${docType === opt.value
                                    ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                                    : 'hover:bg-[var(--surface-hover)] text-[var(--foreground-secondary)]'
                                  }
                                `}
                              >
                                {opt.label}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Done Button */}
                        <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]">
                          <button
                            onClick={() => setShowOptions(false)}
                            className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 transition-opacity"
                          >
                            Done
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Error */}
                {error && (
                  <div className="mt-3 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-sm text-center">
                    {error}
                  </div>
                )}
              </div>

              {/* Suggestions */}
              <div className="w-full max-w-2xl animate-fade-in-up" style={{ animationDelay: '200ms' }}>
                <p className="text-xs text-[var(--foreground-muted)] text-center mb-3">Try something like</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Write a LinkedIn post about our Q4 results",
                    "Summarize yesterday's meeting",
                    "Draft an email to the team about the new feature",
                    "Create a tweet thread about AI trends",
                  ].map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => setRequest(suggestion)}
                      className="
                        px-4 py-2 rounded-xl text-sm
                        glass text-[var(--foreground-secondary)]
                        hover:text-[var(--foreground)] hover:shadow-md hover:-translate-y-0.5
                        transition-all duration-200
                      "
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            /* Result View */
            <div className="w-full max-w-2xl animate-fade-in-up">
              {/* Result Card */}
              <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl overflow-hidden shadow-xl">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{selectedTypeInfo?.icon}</span>
                    <span className="font-medium text-[var(--foreground)]">{selectedTypeInfo?.label}</span>
                    <span className="px-2 py-0.5 text-xs rounded-full bg-[var(--primary)]/10 text-[var(--primary)]">
                      {result.word_count} words
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopy}
                      className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                      title="Copy to clipboard"
                    >
                      {copied ? (
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                    <button
                      onClick={() => setShowRefine(true)}
                      className="px-3 py-1.5 rounded-lg bg-[var(--surface-hover)] text-sm font-medium text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                    >
                      Refine
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="prose prose-sm max-w-none text-[var(--foreground)] whitespace-pre-wrap leading-relaxed">
                    {result.content}
                  </div>
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-[var(--border)] bg-[var(--background)] flex items-center justify-between text-xs text-[var(--foreground-muted)]">
                  <span>Generated in {((result.timing?.total_ms ?? 0) / 1000).toFixed(1)}s</span>
                  <span>{(result.sources?.length ?? 0)} sources used</span>
                </div>
              </div>

              {/* Refine Dialog */}
              {showRefine && (
                <div className="mt-4 bg-[var(--surface)] border border-[var(--border)] rounded-xl p-4 space-y-3">
                  <h4 className="font-medium text-[var(--foreground)]">Refine Content</h4>
                  <input
                    type="text"
                    value={refineFeedback}
                    onChange={(e) => setRefineFeedback(e.target.value)}
                    placeholder="E.g., Make it shorter, add a question, more professional..."
                    className="
                      w-full px-4 py-2.5 rounded-lg
                      bg-[var(--background)] border border-[var(--border)]
                      text-[var(--foreground)] placeholder-[var(--foreground-muted)]
                      focus:outline-none focus:ring-2 focus:ring-[var(--primary)]
                    "
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setShowRefine(false); setRefineFeedback(''); }}
                      className="px-4 py-2 rounded-lg bg-[var(--surface-hover)] text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRefine}
                      disabled={isRefining || !refineFeedback.trim()}
                      className={`
                        px-4 py-2 rounded-lg font-medium transition-all
                        ${isRefining || !refineFeedback.trim()
                          ? 'bg-[var(--surface)] text-[var(--foreground-muted)] cursor-not-allowed'
                          : 'bg-[var(--primary)] text-white hover:opacity-90'
                        }
                      `}
                    >
                      {isRefining ? 'Refining...' : 'Apply'}
                    </button>
                  </div>
                </div>
              )}

              {/* Start Over Button */}
              <div className="mt-6 text-center">
                <button
                  onClick={() => { setResult(null); setRequest(''); }}
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                >
                  ← Generate something new
                </button>
              </div>
            </div>
          )}
        </div>
      </ChatLayout>
    </ProtectedRoute>
  );
}
