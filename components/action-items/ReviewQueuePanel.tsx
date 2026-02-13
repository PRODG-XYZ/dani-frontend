'use client';

import { useState, useEffect } from 'react';
import { getReviewQueue, approveReviewedItem, rejectReviewedItem } from '@/services/api';
import type { ActionItem } from '@/types';

interface ReviewQueuePanelProps {
  onClose: () => void;
  onUpdate: () => void;
}

export function ReviewQueuePanel({ onClose, onUpdate }: ReviewQueuePanelProps) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    // Prevent body scroll when panel is open
    document.body.style.overflow = 'hidden';
    return () => {
      // Remove inline style to let CSS take over
      document.body.style.removeProperty('overflow');
    };
  }, []);

  useEffect(() => {
    loadReviewQueue();
  }, [currentPage]);

  const loadReviewQueue = async () => {
    setLoading(true);
    try {
      const response = await getReviewQueue(0.8, currentPage, 10);
      setItems(response.items);
      setHasMore(response.has_more);
    } catch (err) {
      console.error('Failed to load review queue:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (item: ActionItem) => {
    setProcessing(item.id);
    try {
      await approveReviewedItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      onUpdate();
    } catch (err) {
      console.error('Failed to approve item:', err);
      alert('Failed to approve item. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const handleReject = async (item: ActionItem) => {
    setProcessing(item.id);
    try {
      await rejectReviewedItem(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      onUpdate();
    } catch (err) {
      console.error('Failed to reject item:', err);
      alert('Failed to reject item. Please try again.');
    } finally {
      setProcessing(null);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.7) return 'text-yellow-600 dark:text-yellow-400';
    if (score >= 0.5) return 'text-orange-600 dark:text-orange-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getPriorityColor = (priority: string) => {
    const colors = {
      critical: 'bg-red-600 text-white border-red-700 dark:border-red-500',
      high: 'bg-orange-600 text-white border-orange-700 dark:border-orange-500',
      medium: 'bg-yellow-500 text-white border-yellow-600 dark:border-yellow-500',
      low: 'bg-green-600 text-white border-green-700 dark:border-green-500',
    };
    return colors[priority as keyof typeof colors] || 'bg-slate-200 dark:bg-slate-700 text-[var(--foreground)]';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="flex items-center justify-center min-h-screen p-4 sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Panel */}
        <div className="relative bg-[var(--surface)] rounded-lg shadow-xl max-w-4xl w-full mx-auto max-h-[90vh] overflow-hidden flex flex-col">
          {/* Header */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800 px-6 py-4 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center">
              <svg className="w-6 h-6 text-amber-600 dark:text-amber-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <h2 className="text-xl font-bold text-[var(--foreground)]">
                  Review Queue
                </h2>
                <p className="text-sm text-[var(--foreground)] mt-1 font-medium">
                  Low-confidence AI-extracted action items need your review
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto flex-1 p-6">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              </div>
            )}

            {!loading && items.length === 0 && (
              <div className="text-center py-12">
                <svg className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-[var(--foreground)]">All caught up!</h3>
                <p className="mt-1 text-sm text-[var(--foreground-muted)]">
                  There are no items that need review.
                </p>
              </div>
            )}

            {!loading && items.length > 0 && (
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="bg-slate-50 bg-[var(--background)] rounded-lg border border-[var(--border)] p-4 sm:p-6"
                  >
                    {/* Item Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--foreground)] mb-2">
                          {item.task_description}
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                          <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold border shadow-sm ${getPriorityColor(item.priority)}`}>
                            {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                          </span>
                          {item.confidence_score !== null && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${getConfidenceColor(item.confidence_score)}`}>
                              {Math.round(item.confidence_score * 100)}% Confidence
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Item Details */}
                    <div className="space-y-3 mb-4">
                      {/* Assignee */}
                      <div className="flex items-center text-sm">
                        <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="text-[var(--foreground)] font-medium">
                          Assigned to: <strong className="font-semibold">{item.assigned_to}</strong>
                        </span>
                      </div>

                      {/* Due Date */}
                      {item.due_date && (
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[var(--foreground)] font-medium">
                            Due: {new Date(item.due_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      )}

                      {/* Meeting */}
                      {item.meeting_title && (
                        <div className="flex items-center text-sm">
                          <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                          <span className="text-[var(--foreground)] font-medium">
                            From: <strong className="font-semibold">{item.meeting_title}</strong>
                            {item.meeting_date && (
                              <span className="ml-1">
                                ({new Date(item.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })})
                              </span>
                            )}
                          </span>
                        </div>
                      )}

                      {/* Source Quote */}
                      {item.source_quote && (
                        <div className="mt-3 p-3 bg-[var(--surface)] rounded-lg border border-[var(--border)]">
                          <p className="text-sm text-[var(--foreground-muted)] mb-1 font-medium">
                            Source Quote:
                          </p>
                          <p className="text-sm text-[var(--foreground)] italic">
                            "{item.source_quote}"
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-[var(--border)]">
                      <button
                        onClick={() => handleApprove(item)}
                        disabled={processing === item.id}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {processing === item.id ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Approve
                          </>
                        )}
                      </button>
                      <button
                        onClick={() => handleReject(item)}
                        disabled={processing === item.id}
                        className="flex-1 px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
                      >
                        {processing === item.id ? (
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        ) : (
                          <>
                            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                            Reject
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Pagination */}
                {(currentPage > 1 || hasMore) && (
                  <div className="flex items-center justify-center space-x-2 pt-4">
                    <button
                      onClick={() => setCurrentPage((p) => p - 1)}
                      disabled={currentPage === 1}
                      className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Previous
                    </button>
                    <span className="px-4 py-2 text-sm text-[var(--foreground)]">
                      Page {currentPage}
                    </span>
                    <button
                      onClick={() => setCurrentPage((p) => p + 1)}
                      disabled={!hasMore}
                      className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Next
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
