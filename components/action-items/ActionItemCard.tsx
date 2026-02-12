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
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-200 dark:border-red-800',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200 dark:border-orange-800',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-200 dark:border-green-800',
};

const statusColors = {
  not_started: 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300',
  in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  blocked: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
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
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          {/* Quick Complete Checkbox */}
          {item.status !== 'completed' && item.status !== 'cancelled' && (
            <div className="pt-1 shrink-0">
              <button
                onClick={handleQuickComplete}
                disabled={isUpdating}
                className="w-5 h-5 rounded border-2 border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-center transition-colors disabled:opacity-50"
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
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Needs Review
                </span>
              )}
              {!item.is_manual && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                  AI Extracted
                </span>
              )}
            </div>
            <h3
              className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white mb-2 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400 transition-colors line-clamp-2"
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
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                aria-label="Action menu"
                aria-expanded={showMenu}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                </svg>
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 z-10">
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onEdit(item);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-t-lg transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      router.push(`/action-items/${item.id}`);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                      className="w-full text-left px-4 py-2 text-sm text-green-700 dark:text-green-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
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
                      className="w-full text-left px-4 py-2 text-sm text-orange-700 dark:text-orange-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      Mark as Blocked
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onDelete(item.id);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-b-lg transition-colors"
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
            <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <span className="text-slate-600 dark:text-slate-400 truncate">
              {item.assigned_to}
              {item.assigned_to_email && (
                <span className="text-slate-500 dark:text-slate-500 ml-1">
                  ({item.assigned_to_email})
                </span>
              )}
            </span>
          </div>

          {/* Due Date */}
          <div className="flex items-center text-sm">
            <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className={`${isOverdue ? 'text-red-600 dark:text-red-400 font-medium' : 'text-slate-600 dark:text-slate-400'}`}>
              {formatDate(item.due_date)}
            </span>
          </div>

          {/* Project */}
          {item.project_name && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
              </svg>
              <span className="text-slate-600 dark:text-slate-400 truncate">{item.project_name}</span>
            </div>
          )}

          {/* Meeting Info */}
          {item.meeting_title && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              <span className="text-slate-600 dark:text-slate-400 truncate">{item.meeting_title}</span>
            </div>
          )}

          {/* Confidence Score */}
          {item.confidence_score !== null && (
            <div className="flex items-center text-sm">
              <svg className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-slate-600 dark:text-slate-400">
                Confidence: {Math.round(item.confidence_score * 100)}%
              </span>
            </div>
          )}

          {/* Notes */}
          {item.notes && (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
              <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
                {item.notes}
              </p>
            </div>
          )}
        </div>

        {/* Quick Status Buttons */}
        {item.status !== 'completed' && item.status !== 'cancelled' && item.status !== 'blocked' && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="flex flex-wrap gap-2">
              {item.status === 'not_started' && (
                <button
                  onClick={() => handleStatusChange('in_progress')}
                  disabled={isUpdating}
                  className="flex-1 min-w-[140px] px-3 py-2 text-sm font-medium text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors disabled:opacity-50"
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
                  className="flex-1 min-w-[140px] px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
                >
                  Complete
                </button>
              )}
              <button
                onClick={() => handleStatusChange('cancelled')}
                disabled={isUpdating}
                className="px-3 py-2 text-sm font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Blocked State with Unblock Button */}
        {item.status === 'blocked' && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
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
              className="w-full px-3 py-2 text-sm font-medium text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors disabled:opacity-50"
            >
              Unblock Task
            </button>
          </div>
        )}

        {/* Completed/Cancelled State */}
        {(item.status === 'completed' || item.status === 'cancelled') && (
          <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">
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
