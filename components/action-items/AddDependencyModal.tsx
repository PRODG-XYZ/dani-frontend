'use client';

import { useState, useEffect } from 'react';
import { listActionItems } from '@/services/api';
import type { ActionItem } from '@/types';

interface AddDependencyModalProps {
  currentItemId: string;
  onClose: () => void;
  onSubmit: (dependsOnId: string) => Promise<void>;
}

export function AddDependencyModal({ currentItemId, onClose, onSubmit }: AddDependencyModalProps) {
  const [availableItems, setAvailableItems] = useState<ActionItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    loadAvailableItems();
  }, [searchQuery]);

  const loadAvailableItems = async () => {
    setLoading(true);
    try {
      const response = await listActionItems({
        search: searchQuery || undefined,
        page: 1,
        page_size: 50,
      });
      // Filter out the current item
      setAvailableItems(response.items.filter(item => item.id !== currentItemId));
    } catch (err) {
      console.error('Failed to load action items:', err);
      setError('Failed to load action items');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedItemId) {
      setError('Please select an action item');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(selectedItemId);
      onClose();
    } catch (err: any) {
      console.error('Failed to add dependency:', err);
      setError(err?.message || 'Failed to add dependency. It may create a circular dependency.');
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full mx-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Add Dependency
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
              Select an action item that this item depends on. The selected item must be completed before this item can be started.
            </p>

            {/* Search */}
            <div>
              <label htmlFor="search" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search Action Items
              </label>
              <input
                type="text"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by task, assignee, or project..."
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
              />
            </div>

            {/* Item List */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Available Action Items
              </label>
              <div className="border border-slate-300 dark:border-slate-600 rounded-lg max-h-96 overflow-y-auto">
                {loading && (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                )}

                {!loading && availableItems.length === 0 && (
                  <div className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    No action items found
                  </div>
                )}

                {!loading && availableItems.length > 0 && (
                  <div className="divide-y divide-slate-200 dark:divide-slate-700">
                    {availableItems.map((item) => (
                      <label
                        key={item.id}
                        className="flex items-start p-4 hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <input
                          type="radio"
                          name="dependency"
                          value={item.id}
                          checked={selectedItemId === item.id}
                          onChange={(e) => setSelectedItemId(e.target.value)}
                          className="mt-1 mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-600"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white line-clamp-2">
                            {item.task_description}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-2 text-xs text-slate-500 dark:text-slate-400">
                            <span>Assigned to: {item.assigned_to}</span>
                            <span>•</span>
                            <span>Status: {item.status.replace('_', ' ')}</span>
                            {item.project_name && (
                              <>
                                <span>•</span>
                                <span>Project: {item.project_name}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Error */}
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
                disabled={isSubmitting || !selectedItemId}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Adding...
                  </span>
                ) : (
                  'Add Dependency'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
