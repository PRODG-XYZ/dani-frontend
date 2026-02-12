'use client';

import { useState, useEffect } from 'react';
import type { FeedbackCreate, FeedbackType, ErrorCategory } from '@/types';

interface FeedbackModalProps {
  onClose: () => void;
  onSubmit: (data: FeedbackCreate) => Promise<void>;
}

export function FeedbackModal({ onClose, onSubmit }: FeedbackModalProps) {
  const [formData, setFormData] = useState<FeedbackCreate>({
    feedback_type: 'accurate',
    error_category: null,
    comment: '',
  });

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

    if (formData.feedback_type === 'incorrect' && !formData.error_category) {
      setError('Please select an error category for incorrect feedback');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Failed to submit feedback:', err);
      setError('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFeedbackTypeChange = (type: FeedbackType) => {
    setFormData({
      ...formData,
      feedback_type: type,
      error_category: type === 'accurate' ? null : formData.error_category,
    });
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 sm:p-0">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal */}
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-lg w-full mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Submit Feedback
            </h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Provide feedback on the accuracy of this action item extraction.
            </p>

            {/* Feedback Type */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                Feedback Type *
              </label>
              <div className="space-y-2">
                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input
                    type="radio"
                    name="feedback_type"
                    value="accurate"
                    checked={formData.feedback_type === 'accurate'}
                    onChange={(e) => handleFeedbackTypeChange(e.target.value as FeedbackType)}
                    className="mt-1 mr-3 h-4 w-4 text-green-600 focus:ring-green-500 border-slate-300 dark:border-slate-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">Accurate</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This action item was correctly extracted and all details are accurate.
                    </p>
                  </div>
                </label>

                <label className="flex items-start p-4 border-2 rounded-lg cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-700">
                  <input
                    type="radio"
                    name="feedback_type"
                    value="incorrect"
                    checked={formData.feedback_type === 'incorrect'}
                    onChange={(e) => handleFeedbackTypeChange(e.target.value as FeedbackType)}
                    className="mt-1 mr-3 h-4 w-4 text-red-600 focus:ring-red-500 border-slate-300 dark:border-slate-600"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-slate-900 dark:text-white">Incorrect</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      This action item has errors or was incorrectly extracted.
                    </p>
                  </div>
                </label>
              </div>
            </div>

            {/* Error Category (shown only when feedback type is incorrect) */}
            {formData.feedback_type === 'incorrect' && (
              <div>
                <label htmlFor="error_category" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Error Category *
                </label>
                <select
                  id="error_category"
                  value={formData.error_category || ''}
                  onChange={(e) => setFormData({ ...formData, error_category: (e.target.value as ErrorCategory) || null })}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                >
                  <option value="">Select an error category</option>
                  <option value="wrong_owner">Wrong Owner - Assigned to incorrect person</option>
                  <option value="wrong_date">Wrong Date - Incorrect due date</option>
                  <option value="wrong_task">Wrong Task - Task description is incorrect</option>
                  <option value="hallucination">Hallucination - Not a real action item</option>
                </select>
              </div>
            )}

            {/* Comment */}
            <div>
              <label htmlFor="comment" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Comment {formData.feedback_type === 'incorrect' ? '(Optional)' : ''}
              </label>
              <textarea
                id="comment"
                rows={4}
                value={formData.comment || ''}
                onChange={(e) => setFormData({ ...formData, comment: e.target.value || null })}
                placeholder="Add any additional details or context..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </span>
                ) : (
                  'Submit Feedback'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
