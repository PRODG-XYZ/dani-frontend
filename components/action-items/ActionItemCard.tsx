'use client';

import { useState, useEffect, useRef } from 'react';
import type { ActionItem, ActionItemUpdate, ActionItemStatus } from '@/types';
import { useRouter } from 'next/navigation';
import { BlockedStatusModal } from './BlockedStatusModal';

interface ActionItemCardProps {
  item: ActionItem;
  onEdit: (item: ActionItem) => void;
  onDelete: (itemId: string) => void;
  onComplete: (itemId: string) => void;
  onUpdate: (itemId: string, data: ActionItemUpdate) => Promise<void>;
}

const priorityColors = {
  critical: 'bg-red-600 text-white dark:bg-red-600 dark:text-white border-red-700 dark:border-red-500 font-bold shadow-sm',
  high: 'bg-orange-600 text-white dark:bg-orange-600 dark:text-white border-orange-700 dark:border-orange-500 font-bold shadow-sm',
  medium: 'bg-yellow-500 text-white dark:bg-yellow-600 dark:text-white border-yellow-600 dark:border-yellow-500 font-bold shadow-sm',
  low: 'bg-green-600 text-white dark:bg-green-600 dark:text-white border-green-700 dark:border-green-500 font-bold shadow-sm',
};

const statusColors = {
  not_started: 'bg-gray-600 text-white dark:bg-gray-600 dark:text-white font-bold shadow-sm',
  in_progress: 'bg-blue-600 text-white dark:bg-blue-600 dark:text-white font-bold shadow-sm',
  completed: 'bg-green-600 text-white dark:bg-green-600 dark:text-white font-bold shadow-sm',
  cancelled: 'bg-red-600 text-white dark:bg-red-600 dark:text-white font-bold shadow-sm',
  blocked: 'bg-orange-600 text-white dark:bg-orange-600 dark:text-white font-bold shadow-sm',
};

export function ActionItemCard({ item, onEdit, onDelete, onComplete, onUpdate }: ActionItemCardProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showBlockedModal, setShowBlockedModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [showMenu]);

  const handleStatusChange = async (newStatus: ActionItemStatus) => {
    setIsUpdating(true);
    try {
      await onUpdate(item.id, { status: newStatus });
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No due date';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return `Overdue by ${Math.abs(diffDays)} day${Math.abs(diffDays) !== 1 ? 's' : ''}`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else if (diffDays === 1) {
      return 'Due tomorrow';
    } else if (diffDays <= 7) {
      return `Due in ${diffDays} days`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  const isOverdue = item.due_date && new Date(item.due_date) < new Date() && item.status !== 'completed';

  const handleQuickComplete = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Show confirmation for critical priority items
    if (item.priority === 'critical') {
      if (!confirm(`Are you sure you want to mark this critical task as complete?\n\n"${item.task_description}"`)) {
        return;
      }
    }

    await onComplete(item.id);
  };

  const handleBlockedSubmit = async (reason: string) => {
    try {
      await onUpdate(item.id, {
        status: 'blocked',
        notes: `BLOCKED: ${reason}${item.notes ? `\n\nPrevious notes: ${item.notes}` : ''}`
      });
    } catch (err) {
      console.error('Failed to mark as blocked:', err);
      throw err;
    }
  };

  return (
    <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm hover:shadow-lg transition-all duration-200 hover:border-[var(--primary)]/20">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Quick Complete Checkbox */}
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <div className="pt-1 shrink-0">
              <button
                onClick={handleQuickComplete}
                disabled={isUpdating}
                className="w-5 h-5 rounded border-2 border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--primary)]/10 flex items-center justify-center transition-colors disabled:opacity-50"
                aria-label="Mark as complete"
                title="Quick complete"
              />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${priorityColors[item.priority]}`}>
                {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)}
              </span>
              <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${statusColors[item.status]}`}>
                {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </span>
              {item.needs_review && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-amber-600 text-white border border-amber-700 shadow-sm">
                  Needs Review
                </span>
              )}
              {!item.is_manual && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-purple-600 text-white border border-purple-700 shadow-sm">
                  AI Extracted
                </span>
              )}
            </div>
            <h3
              className="text-base sm:text-lg font-semibold text-[var(--foreground)] mb-2 cursor-pointer hover:text-[var(--primary)] transition-colors line-clamp-2"
              onClick={() => router.push(`/action-items/${item.id}`)}
            >
              {item.task_description}
            </h3>
          </div>

          {/* Actions Dropdown */}
          <div className="ml-3 shrink-0">
            <div className="relative" ref={menuRef}>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(!showMenu);
                }}
                className="p-2 text-[var(--foreground-muted)] hover:text-[var(--foreground)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                aria-label="Action menu"
                aria-expanded={showMenu}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-[var(--surface)] rounded-xl shadow-lg border border-[var(--border)] z-10 overflow-hidden">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(item);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/action-items/${item.id}`);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-[var(--foreground)] hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    View Details
                  </button>
                  {item.status !== 'completed' && item.status !== 'cancelled' && (
                    <button
                      onClick={async () => {
                        setShowMenu(false);
                        if (item.priority === 'critical') {
                          if (!confirm(`Are you sure you want to mark this critical task as complete?\n\n"${item.task_description}"`)) {
                            return;
                          }
                        }
                        await onComplete(item.id);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-green-600 dark:text-green-400 hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  {item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'blocked' && (
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowBlockedModal(true);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm text-orange-600 dark:text-orange-400 hover:bg-[var(--surface-hover)] transition-colors"
                    >
                      Mark as Blocked
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(item.id);
                    }}
                    className="w-full text-left px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-[var(--surface-hover)] transition-colors"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="space-y-3">
          {/* Assignee */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-[var(--foreground)] font-medium truncate">
              {item.assigned_to}
              {item.assigned_to_email && (
                <span className="text-[var(--foreground-muted)] font-normal ml-1">
                  ({item.assigned_to_email})
                </span>
              )}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`font-medium ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-[var(--foreground)]'}`}>
              {formatDate(item.due_date)}
            </span>
          </div>

          {/* Project */}
          {item.project_name && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-[var(--foreground)] font-medium truncate">{item.project_name}</span>
            </div>
          )}

          {/* Meeting Info */}
          {item.meeting_title && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-[var(--foreground)] font-medium truncate">{item.meeting_title}</span>
            </div>
          )}

          {/* Confidence Score */}
          {item.confidence_score !== null && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-[var(--foreground-muted)] mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-[var(--foreground)] font-medium">
                Confidence: {Math.round(item.confidence_score * 100)}%
              </span>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="pt-2 border-t border-[var(--border)]">
              <p className="text-sm text-[var(--foreground)] font-normal line-clamp-2">
                {item.notes}
              </p>
            </div>
          )}
        </div>

        {/* Quick Status Buttons */}
        {item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'blocked' && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex flex-wrap gap-2">
              {item.status === 'not_started' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="flex-1 min-w-[140px] px-3 py-2 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  Start Working
                </button>
              )}
              {item.status === 'in_progress' && (
                <button
                  onClick={async () => {
                    if (item.priority === 'critical') {
                      if (!confirm(`Are you sure you want to mark this critical task as complete?\n\n"${item.task_description}"`)) {
                        return;
                      }
                    }
                    await onComplete(item.id);
                  }}
                  disabled={isUpdating}
                  className="flex-1 min-w-[140px] px-3 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
                className="px-3 py-2 text-sm font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Blocked State with Unblock Button */}
        {item.status === 'blocked' && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="flex items-start gap-2 mb-3">
              <svg className="w-5 h-5 text-orange-600 dark:text-orange-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-orange-800 dark:text-orange-300 mb-1">Task is blocked</p>
                {item.notes && item.notes.startsWith('BLOCKED:') && (
                  <p className="text-xs text-orange-700 dark:text-orange-400">
                    {item.notes.split('\n')[0].replace('BLOCKED: ', '')}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => handleStatusChange('not_started')}
              disabled={isUpdating}
              className="w-full px-3 py-2 text-sm font-bold text-white bg-green-600 hover:bg-green-700 rounded-lg transition-colors disabled:opacity-50 shadow-sm"
            >
              Unblock Task
            </button>
          </div>
        )}

        {/* Completed/Cancelled State */}
        {(item.status === 'completed' || item.status === 'cancelled') && (
          <div className="mt-4 pt-4 border-t border-[var(--border)]">
            <div className="text-sm text-[var(--foreground-muted)]">
              {item.status === 'completed' && item.completed_at && (
                <span>
                  Completed {new Date(item.completed_at).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                    hour: 'numeric',
                    minute: '2-digit',
                  })}
                </span>
              )}
              {item.status === 'cancelled' && (
                <span className="text-red-600 dark:text-red-400">Cancelled</span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Blocked Status Modal */}
      {showBlockedModal && (
        <BlockedStatusModal
          onClose={() => setShowBlockedModal(false)}
          onSubmit={handleBlockedSubmit}
          itemDescription={item.task_description}
        />
      )}
    </div>
  );
}
