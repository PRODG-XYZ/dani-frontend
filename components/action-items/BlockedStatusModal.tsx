'use client';

import { useState, useEffect } from 'react';

interface BlockedStatusModalProps {
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  itemDescription: string;
}

export function BlockedStatusModal({ onClose, onSubmit, itemDescription }: BlockedStatusModalProps) {
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      // Remove inline style to let CSS take over
      document.body.style.removeProperty('overflow');
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      setError('Please provide a reason for blocking this task');
      return;
    }

    if (reason.trim().length < 10) {
      setError('Reason must be at least 10 characters');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(reason.trim());
      onClose();
    } catch (err) {
      console.error('Failed to mark as blocked:', err);
      setError('Failed to update status. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-[var(--surface)] rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-[var(--surface)] border-b border-[var(--border)] px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-bold text-[var(--foreground)]">
              Mark as Blocked
            </h2>
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
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {/* Task Description */}
            <div className="p-3 bg-[var(--surface-hover)] rounded-lg border border-[var(--border)]">
              <p className="text-sm text-[var(--foreground-muted)] mb-1 font-medium">Task:</p>
              <p className="text-sm text-[var(--foreground)] font-medium line-clamp-2">{itemDescription}</p>
            </div>

            {/* Reason Field */}
            <div>
              <label className="block text-sm font-bold text-[var(--foreground)] mb-2">
                Why is this task blocked? <span className="text-red-600">*</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                placeholder="e.g., Waiting for approval from John, Missing required data, Dependency on other team..."
                rows={4}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] resize-none"
                disabled={isSubmitting}
              />
              <p className="mt-1 text-xs text-[var(--foreground-muted)] font-medium">
                Min 10 characters - Be specific to help resolve the blocker
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300 font-medium">{error}</p>
              </div>
            )}

            {/* Warning */}
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-400 dark:border-amber-500 rounded-lg">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-black mr-3 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-bold text-black mb-1">
                    This will mark the task as blocked
                  </p>
                  <p className="text-sm text-black font-medium">
                    The task will be flagged for attention. You can unblock it later by changing the status.
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-semibold text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || !reason.trim() || reason.trim().length < 10}
                className="flex-1 px-4 py-2 text-sm font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
              >
                {isSubmitting ? 'Marking as Blocked...' : 'Mark as Blocked'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
