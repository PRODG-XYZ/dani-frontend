'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  getActionItem,
  updateActionItem,
  deleteActionItem,
  completeActionItem,
  listDependencies,
  addDependency,
  removeDependency,
  submitFeedback,
  getFeedbackHistory,
} from '@/services/api';
import type {
  ActionItemDetail,
  ActionItemUpdate,
  FeedbackCreate,
  ActionItemFeedback,
  DependencyResponse,
} from '@/types';
import { ActionItemModal } from '@/components/action-items/ActionItemModal';
import { AddDependencyModal } from '@/components/action-items/AddDependencyModal';
import { FeedbackModal } from '@/components/action-items/FeedbackModal';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function ActionItemDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const itemId = resolvedParams.id;
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [item, setItem] = useState<ActionItemDetail | null>(null);
  const [dependencies, setDependencies] = useState<DependencyResponse[]>([]);
  const [feedbacks, setFeedbacks] = useState<ActionItemFeedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDependencyModal, setShowDependencyModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load action item details
  useEffect(() => {
    if (isAuthenticated && itemId) {
      loadItemDetails();
    }
  }, [isAuthenticated, itemId]);

  const loadItemDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      const [itemData, depsData, feedbackData] = await Promise.all([
        getActionItem(itemId),
        listDependencies(itemId),
        getFeedbackHistory(itemId),
      ]);

      setItem(itemData);
      setDependencies(depsData);
      setFeedbacks(feedbackData);
    } catch (err) {
      console.error('Failed to load action item:', err);
      setError('Failed to load action item details. It may have been deleted or you may not have permission to view it.');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (data: ActionItemUpdate) => {
    try {
      await updateActionItem(itemId, data);
      setShowEditModal(false);
      loadItemDetails();
    } catch (err) {
      console.error('Failed to update action item:', err);
      throw err;
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this action item?')) return;

    try {
      await deleteActionItem(itemId);
      router.push('/action-items');
    } catch (err) {
      console.error('Failed to delete action item:', err);
      alert('Failed to delete action item. Please try again.');
    }
  };

  const handleComplete = async () => {
    // Show confirmation for critical priority items
    if (item && item.priority === 'critical') {
      if (!confirm(`Are you sure you want to mark this critical task as complete?\n\n"${item.task_description}"`)) {
        return;
      }
    }

    try {
      await completeActionItem(itemId);
      loadItemDetails();
    } catch (err) {
      console.error('Failed to complete action item:', err);
      alert('Failed to complete action item. Please try again.');
    }
  };

  const handleAddDependency = async (dependsOnId: string) => {
    try {
      await addDependency(itemId, { depends_on_id: dependsOnId });
      setShowDependencyModal(false);
      loadItemDetails();
    } catch (err) {
      console.error('Failed to add dependency:', err);
      throw err;
    }
  };

  const handleRemoveDependency = async (dependencyId: string) => {
    if (!confirm('Are you sure you want to remove this dependency?')) return;

    try {
      await removeDependency(itemId, dependencyId);
      loadItemDetails();
    } catch (err) {
      console.error('Failed to remove dependency:', err);
      alert('Failed to remove dependency. Please try again.');
    }
  };

  const handleSubmitFeedback = async (data: FeedbackCreate) => {
    try {
      await submitFeedback(itemId, data);
      setShowFeedbackModal(false);
      loadItemDetails();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      throw err;
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-[var(--surface)] rounded-xl shadow-lg p-8 text-center border border-[var(--border)]">
          <svg className="mx-auto h-12 w-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-[var(--foreground)]">
            Error Loading Action Item
          </h2>
          <p className="mt-2 text-sm text-[var(--foreground-muted)]">
            {error}
          </p>
          <button
            onClick={() => router.push('/action-items')}
            className="mt-6 px-4 py-2 text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors"
          >
            Back to Action Items
          </button>
        </div>
      </div>
    );
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

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-2 sm:gap-4">
            {/* Left: Back button + Title */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <button
                onClick={() => router.push('/action-items')}
                className="shrink-0 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Back to action items"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)] truncate">
                Action Item Details
              </h1>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 shrink-0">
              {/* Complete button - hidden on very small screens */}
              {item.status !== 'completed' && item.status !== 'cancelled' && (
                <button
                  onClick={handleComplete}
                  className="hidden md:flex items-center px-3 py-2 text-sm font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  title="Mark Complete"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="hidden sm:inline">Mark Complete</span>
                </button>
              )}

              {/* Edit button */}
              <button
                onClick={() => setShowEditModal(true)}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
                title="Edit"
              >
                <span className="hidden sm:inline">Edit</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>

              {/* Delete button */}
              <button
                onClick={handleDelete}
                className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-medium text-white bg-red-600 dark:bg-red-700 rounded-lg hover:bg-red-700 dark:hover:bg-red-800 transition-colors"
                title="Delete"
              >
                <span className="hidden sm:inline">Delete</span>
                <svg className="w-4 h-4 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Task Card */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-6">
              {/* Badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm border ${priorityColors[item.priority]}`}>
                  {item.priority.charAt(0).toUpperCase() + item.priority.slice(1)} Priority
                </span>
                <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm ${statusColors[item.status]}`}>
                  {item.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                {item.needs_review && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-amber-600 text-white border border-amber-700 shadow-sm">
                    Needs Review
                  </span>
                )}
                {!item.is_manual && (
                  <span className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold bg-purple-600 text-white border border-purple-700 shadow-sm">
                    AI Extracted
                  </span>
                )}
              </div>

              {/* Description */}
              <h2 className="text-2xl font-bold text-[var(--foreground)] mb-6">
                {item.task_description}
              </h2>

              {/* Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">Assigned To</p>
                  <p className="text-base font-medium text-[var(--foreground)]">
                    {item.assigned_to}
                    {item.assigned_to_email && (
                      <span className="block text-sm font-normal text-[var(--foreground-muted)]">{item.assigned_to_email}</span>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">Due Date</p>
                  <p className="text-base font-medium text-[var(--foreground)]">
                    {item.due_date ? new Date(item.due_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'No due date'}
                  </p>
                </div>
                {item.project_name && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">Project</p>
                    <p className="text-base font-medium text-[var(--foreground)]">{item.project_name}</p>
                  </div>
                )}
                {item.confidence_score !== null && (
                  <div>
                    <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">Confidence Score</p>
                    <p className="text-base font-medium text-[var(--foreground)]">
                      {Math.round(item.confidence_score * 100)}%
                    </p>
                  </div>
                )}
                {item.completed_at && (
                  <div className="sm:col-span-2">
                    <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-1">Completed At</p>
                    <p className="text-base font-medium text-[var(--foreground)]">
                      {new Date(item.completed_at).toLocaleString('en-US', {
                        month: 'long',
                        day: 'numeric',
                        year: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                )}
              </div>

              {/* Notes */}
              {item.notes && (
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-2">Notes</p>
                  <p className="text-base text-[var(--foreground)] whitespace-pre-wrap">{item.notes}</p>
                </div>
              )}

              {/* Meeting Context */}
              {(item.meeting_title || item.source_quote) && (
                <div className="mt-6 pt-6 border-t border-[var(--border)]">
                  <p className="text-sm font-semibold text-[var(--foreground-muted)] mb-3">Meeting Context</p>
                  {item.meeting_title && (
                    <p className="text-base text-[var(--foreground)] mb-2">
                      <strong>Meeting:</strong> {item.meeting_title}
                      {item.meeting_date && (
                        <span className="text-[var(--foreground-muted)] ml-2">
                          ({new Date(item.meeting_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })})
                        </span>
                      )}
                    </p>
                  )}
                  {item.source_quote && (
                    <div className="mt-3 p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                      <p className="text-sm text-[var(--foreground)] italic font-medium">"{item.source_quote}"</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Dependencies */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--foreground)]">Dependencies</h3>
                <button
                  onClick={() => setShowDependencyModal(true)}
                  className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Add Dependency
                </button>
              </div>
              {dependencies.length === 0 ? (
                <p className="text-sm text-[var(--foreground-muted)]">No dependencies</p>
              ) : (
                <div className="space-y-3">
                  {dependencies.map((dep) => (
                    <div key={dep.id} className="flex items-center justify-between p-3 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-[var(--foreground)]">{dep.depends_on.task_description}</p>
                        <p className="text-xs text-[var(--foreground-muted)] mt-1 font-medium">
                          Assigned to: {dep.depends_on.assigned_to} • Status: {dep.depends_on.status.replace('_', ' ')}
                        </p>
                      </div>
                      <button
                        onClick={() => handleRemoveDependency(dep.id)}
                        className="ml-3 p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        aria-label="Remove dependency"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Feedback */}
            <div className="bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-[var(--foreground)]">Feedback History</h3>
                <button
                  onClick={() => setShowFeedbackModal(true)}
                  className="px-3 py-1.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                >
                  Add Feedback
                </button>
              </div>
              {feedbacks.length === 0 ? (
                <p className="text-sm text-[var(--foreground-muted)]">No feedback yet</p>
              ) : (
                <div className="space-y-3">
                  {feedbacks.map((feedback) => (
                    <div key={feedback.id} className="p-4 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-bold shadow-sm ${
                          feedback.feedback_type === 'accurate'
                            ? 'bg-green-600 text-white border border-green-700'
                            : 'bg-red-600 text-white border border-red-700'
                        }`}>
                          {feedback.feedback_type === 'accurate' ? 'Accurate' : 'Incorrect'}
                        </span>
                        <span className="text-xs text-[var(--foreground-muted)]">
                          {new Date(feedback.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      {feedback.error_category && (
                        <p className="text-sm font-semibold text-[var(--foreground)] mb-1">
                          Error: {feedback.error_category.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </p>
                      )}
                      {feedback.comment && (
                        <p className="text-sm text-[var(--foreground-muted)]">{feedback.comment}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Metadata */}
            <div className="bg-[var(--surface)] rounded-lg border border-[var(--border)] shadow-sm p-6">
              <h3 className="text-lg font-bold text-[var(--foreground)] mb-4">Metadata</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-[var(--foreground-muted)] mb-1 font-medium">Created</p>
                  <p className="text-[var(--foreground)] font-semibold">
                    {new Date(item.created_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)] mb-1 font-medium">Last Updated</p>
                  <p className="text-[var(--foreground)] font-semibold">
                    {new Date(item.updated_at).toLocaleString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-[var(--foreground-muted)] mb-1 font-medium">Type</p>
                  <p className="text-[var(--foreground)] font-semibold">
                    {item.is_manual ? 'Manually Created' : 'AI Extracted'}
                  </p>
                </div>
                {item.meeting_id && (
                  <div>
                    <p className="text-[var(--foreground-muted)] mb-1 font-medium">Meeting ID</p>
                    <p className="text-[var(--foreground)] font-mono text-xs font-semibold">{item.meeting_id}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      {showEditModal && item && (
        <ActionItemModal
          item={item}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdate}
        />
      )}

      {showDependencyModal && (
        <AddDependencyModal
          currentItemId={itemId}
          onClose={() => setShowDependencyModal(false)}
          onSubmit={handleAddDependency}
        />
      )}

      {showFeedbackModal && (
        <FeedbackModal
          onClose={() => setShowFeedbackModal(false)}
          onSubmit={handleSubmitFeedback}
        />
      )}
    </div>
  );
}
