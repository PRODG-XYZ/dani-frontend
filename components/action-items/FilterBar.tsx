'use client';

import { useState } from 'react';
import type { ActionItemFilters, ActionItemPriority, ActionItemStatus } from '@/types';

interface FilterBarProps {
  filters: ActionItemFilters;
  onFilterChange: (filters: Partial<ActionItemFilters>) => void;
}

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleClearFilters = () => {
    onFilterChange({
      assigned_to: undefined,
      status: undefined,
      priority: undefined,
      project_name: undefined,
      meeting_id: undefined,
      needs_review: undefined,
      due_date_before: undefined,
      due_date_after: undefined,
      search: undefined,
    });
    setIsExpanded(false);
  };

  const hasActiveFilters = !!(
    filters.assigned_to ||
    filters.status ||
    filters.priority ||
    filters.project_name ||
    filters.meeting_id ||
    filters.needs_review !== undefined ||
    filters.due_date_before ||
    filters.due_date_after ||
    filters.search
  );

  return (
    <div className="mb-6 bg-[var(--surface)] rounded-xl border border-[var(--border)] shadow-sm">
      {/* Search and Toggle */}
      <div className="p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-5 w-5 text-[var(--foreground-muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={filters.search || ''}
              onChange={(e) => onFilterChange({ search: e.target.value || undefined })}
              placeholder="Search tasks, assignees, or quotes..."
              className="w-full pl-10 pr-4 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
            />
          </div>

          {/* Filter Toggle */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-[var(--foreground)] bg-[var(--surface-hover)] rounded-lg hover:bg-[var(--border)] transition-colors whitespace-nowrap"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-[var(--primary)] text-white rounded-full">
                {Object.keys(filters).filter((k) => {
                  const key = k as keyof ActionItemFilters;
                  return filters[key] !== undefined && key !== 'page' && key !== 'page_size' && key !== 'sort_by' && key !== 'sort_order';
                }).length}
              </span>
            )}
          </button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors whitespace-nowrap"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-[var(--border)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => onFilterChange({ status: (e.target.value as ActionItemStatus) || undefined })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              >
                <option value="">All Statuses</option>
                <option value="not_started">Not Started</option>
                <option value="in_progress">In Progress</option>
                <option value="blocked">Blocked</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => onFilterChange({ priority: (e.target.value as ActionItemPriority) || undefined })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              >
                <option value="">All Priorities</option>
                <option value="critical">Critical</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>

            {/* Assignee */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Assigned To
              </label>
              <input
                type="text"
                value={filters.assigned_to || ''}
                onChange={(e) => onFilterChange({ assigned_to: e.target.value || undefined })}
                placeholder="Filter by assignee"
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-colors"
              />
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Project
              </label>
              <input
                type="text"
                value={filters.project_name || ''}
                onChange={(e) => onFilterChange({ project_name: e.target.value || undefined })}
                placeholder="Filter by project"
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] transition-colors"
              />
            </div>

            {/* Due Date After */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Due After
              </label>
              <input
                type="date"
                value={filters.due_date_after || ''}
                onChange={(e) => onFilterChange({ due_date_after: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              />
            </div>

            {/* Due Date Before */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Due Before
              </label>
              <input
                type="date"
                value={filters.due_date_before || ''}
                onChange={(e) => onFilterChange({ due_date_before: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              />
            </div>

            {/* Needs Review */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Review Status
              </label>
              <select
                value={filters.needs_review === undefined ? '' : filters.needs_review ? 'true' : 'false'}
                onChange={(e) => onFilterChange({ needs_review: e.target.value === '' ? undefined : e.target.value === 'true' })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              >
                <option value="">All Items</option>
                <option value="true">Needs Review</option>
                <option value="false">Reviewed</option>
              </select>
            </div>

            {/* Sort By */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Sort By
              </label>
              <select
                value={filters.sort_by || 'created_at'}
                onChange={(e) => onFilterChange({ sort_by: e.target.value as ActionItemFilters['sort_by'] })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="status">Status</option>
                <option value="updated_at">Last Updated</option>
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                Sort Order
              </label>
              <select
                value={filters.sort_order || 'desc'}
                onChange={(e) => onFilterChange({ sort_order: e.target.value as 'asc' | 'desc' })}
                className="w-full px-3 py-2 border border-[var(--border)] rounded-lg focus:ring-2 focus:ring-[var(--primary)] focus:border-[var(--primary)] bg-[var(--background)] text-[var(--foreground)] transition-colors"
              >
                <option value="desc">Descending</option>
                <option value="asc">Ascending</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
