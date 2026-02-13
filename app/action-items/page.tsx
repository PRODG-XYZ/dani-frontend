'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  listActionItems,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  completeActionItem,
  getReviewQueue,
  approveReviewedItem,
  rejectReviewedItem,
} from '@/services/api';
import type {
  ActionItem,
  ActionItemCreate,
  ActionItemUpdate,
  ActionItemFilters,
  ActionItemPriority,
  ActionItemStatus,
} from '@/types';
import { ActionItemCard } from '@/components/action-items/ActionItemCard';
import { ActionItemModal } from '@/components/action-items/ActionItemModal';
import { FilterBar } from '@/components/action-items/FilterBar';
import { ReviewQueuePanel } from '@/components/action-items/ReviewQueuePanel';

export default function ActionItemsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [actionItems, setActionItems] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<ActionItem | null>(null);
  const [showReviewQueue, setShowReviewQueue] = useState(false);
  const [reviewQueueCount, setReviewQueueCount] = useState(0);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Filters
  const [filters, setFilters] = useState<ActionItemFilters>({
    page: 1,
    page_size: 20,
    sort_by: 'created_at',
    sort_order: 'desc',
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, router]);

  // Load action items
  const loadActionItems = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const response = await listActionItems(filters);
      setActionItems(response.items);
      setCurrentPage(response.page);
      setTotalPages(Math.ceil(response.total / response.page_size));
      setHasMore(response.has_more);
    } catch (err) {
      console.error('Failed to load action items:', err);
      setError('Failed to load action items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, filters]);

  // Load review queue count
  const loadReviewQueueCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await getReviewQueue(0.8, 1, 1);
      setReviewQueueCount(response.total);
    } catch (err) {
      console.error('Failed to load review queue count:', err);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadActionItems();
    loadReviewQueueCount();
  }, [loadActionItems, loadReviewQueueCount]);

  const handleCreateItem = async (data: ActionItemCreate) => {
    try {
      await createActionItem({ ...data, is_manual: true });
      setShowModal(false);
      loadActionItems();
      loadReviewQueueCount();
    } catch (err) {
      console.error('Failed to create action item:', err);
      throw err;
    }
  };

  const handleUpdateItem = async (itemId: string, data: ActionItemUpdate) => {
    try {
      await updateActionItem(itemId, data);
      setEditingItem(null);
      loadActionItems();
      loadReviewQueueCount();
    } catch (err) {
      console.error('Failed to update action item:', err);
      throw err;
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this action item?')) return;

    try {
      await deleteActionItem(itemId);
      loadActionItems();
      loadReviewQueueCount();
    } catch (err) {
      console.error('Failed to delete action item:', err);
      alert('Failed to delete action item. Please try again.');
    }
  };

  const handleCompleteItem = async (itemId: string) => {
    try {
      await completeActionItem(itemId);
      loadActionItems();
    } catch (err) {
      console.error('Failed to complete action item:', err);
      alert('Failed to complete action item. Please try again.');
    }
  };

  const handleFilterChange = (newFilters: Partial<ActionItemFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: 1, // Reset to first page when filters change
    }));
  };

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const handleEditItem = (item: ActionItem) => {
    setEditingItem(item);
  };

  const handleReviewQueueUpdated = () => {
    loadActionItems();
    loadReviewQueueCount();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[var(--background)]/80 backdrop-blur-xl border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-2 sm:gap-4">
            {/* Left: Back button + Title */}
            <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
              <button
                onClick={() => router.push('/chat')}
                className="flex-shrink-0 text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                aria-label="Back to chat"
              >
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
              </button>
              <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-[var(--foreground)] truncate">
                Action Items
              </h1>
            </div>

            {/* Right: Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {/* Review Queue - Hidden on mobile if no items */}
              {reviewQueueCount > 0 && (
                <button
                  onClick={() => setShowReviewQueue(true)}
                  className="relative px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition-colors shadow-sm"
                  title={`Review Queue (${reviewQueueCount})`}
                >
                  <span className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    <span className="hidden sm:inline">Review Queue ({reviewQueueCount})</span>
                    <span className="sm:hidden">({reviewQueueCount})</span>
                  </span>
                </button>
              )}

              {/* New Action Item button */}
              <button
                onClick={() => {
                  setEditingItem(null);
                  setShowModal(true);
                }}
                className="px-2 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-white bg-[var(--primary)] rounded-lg hover:bg-[var(--primary-hover)] transition-colors flex items-center shadow-sm"
                title="New Action Item"
              >
                <svg className="w-4 h-4 sm:w-5 sm:h-5 sm:mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">New Action Item</span>
                <span className="sm:hidden">New</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <FilterBar filters={filters} onFilterChange={handleFilterChange} />

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-600 dark:text-red-400 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 dark:text-red-300">{error}</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
          </div>
        )}

        {/* Empty State */}
        {!loading && actionItems.length === 0 && (
          <div className="text-center py-12 px-4">
            <div className="max-w-sm mx-auto">
              <svg className="mx-auto h-12 w-12 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <h3 className="mt-4 text-base font-semibold text-[var(--foreground)]">No action items</h3>
              <p className="mt-2 text-sm text-[var(--foreground-muted)]">
                Get started by creating a new action item to track your tasks and goals.
              </p>
              <div className="mt-6">
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center px-4 py-2 shadow-sm text-sm font-medium rounded-lg text-white bg-[var(--primary)] hover:bg-[var(--primary-hover)] transition-colors"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  New Action Item
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Items Grid */}
        {!loading && actionItems.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {actionItems.map((item) => (
                <ActionItemCard
                  key={item.id}
                  item={item}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                  onComplete={handleCompleteItem}
                  onUpdate={handleUpdateItem}
                />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-8 flex items-center justify-center space-x-3">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium text-[var(--foreground-muted)]">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={!hasMore}
                  className="px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface)] border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      {showModal && (
        <ActionItemModal
          onClose={() => setShowModal(false)}
          onSubmit={handleCreateItem}
        />
      )}

      {editingItem && (
        <ActionItemModal
          item={editingItem}
          onClose={() => setEditingItem(null)}
          onSubmit={(data) => handleUpdateItem(editingItem.id, data)}
        />
      )}

      {showReviewQueue && (
        <ReviewQueuePanel
          onClose={() => setShowReviewQueue(false)}
          onUpdate={handleReviewQueueUpdated}
        />
      )}
    </div>
  );
}
