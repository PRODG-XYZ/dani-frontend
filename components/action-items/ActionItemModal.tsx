'use client';

import { useState, useEffect } from 'react';
import type { ActionItem, ActionItemCreate, ActionItemPriority, ActionItemStatus } from '@/types';

interface ActionItemModalProps {
  item?: ActionItem | null;
  onClose: () => void;
  onSubmit: (data: ActionItemCreate) => Promise<void>;
}

// Task templates for common action items
const TASK_TEMPLATES = [
  { value: '', label: 'No template - Start from scratch', description: '', priority: 'medium' as ActionItemPriority },
  { value: 'meeting', label: 'Schedule a meeting', description: 'Schedule a meeting with [person/team] to discuss [topic]', priority: 'medium' as ActionItemPriority },
  { value: 'followup', label: 'Send follow-up email', description: 'Send follow-up email to [person] regarding [topic/decision]', priority: 'high' as ActionItemPriority },
  { value: 'review', label: 'Review document/proposal', description: 'Review and provide feedback on [document name] by [date]', priority: 'high' as ActionItemPriority },
  { value: 'research', label: 'Research and report', description: 'Research [topic] and prepare summary/report with findings', priority: 'medium' as ActionItemPriority },
  { value: 'call', label: 'Make a phone call', description: 'Call [person/company] to discuss [topic/issue]', priority: 'high' as ActionItemPriority },
  { value: 'update', label: 'Update documentation', description: 'Update [document/system documentation] with [changes/new information]', priority: 'low' as ActionItemPriority },
  { value: 'prepare', label: 'Prepare presentation', description: 'Prepare presentation for [meeting/event] covering [topics]', priority: 'high' as ActionItemPriority },
];

export function ActionItemModal({ item, onClose, onSubmit }: ActionItemModalProps) {
  const [formData, setFormData] = useState<ActionItemCreate>({
    task_description: item?.task_description || '',
    assigned_to: item?.assigned_to || '',
    assigned_to_email: item?.assigned_to_email || '',
    due_date: item?.due_date || '',
    priority: item?.priority || 'medium',
    status: item?.status || 'not_started',
    project_name: item?.project_name || '',
    notes: item?.notes || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedTemplate, setSelectedTemplate] = useState('');

  const handleTemplateChange = (templateValue: string) => {
    setSelectedTemplate(templateValue);
    const template = TASK_TEMPLATES.find(t => t.value === templateValue);
    if (template && template.description) {
      setFormData(prev => ({
        ...prev,
        task_description: template.description,
        priority: template.priority,
      }));
    }
  };

  useEffect(() => {
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
    return () => {
      // Remove inline style to let CSS take over
      document.body.style.removeProperty('overflow');
    };
  }, []);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.task_description.trim()) {
      newErrors.task_description = 'Task description is required';
    } else if (formData.task_description.length < 5) {
      newErrors.task_description = 'Task description must be at least 5 characters';
    } else if (formData.task_description.length > 2000) {
      newErrors.task_description = 'Task description must not exceed 2000 characters';
    }

    if (!formData.assigned_to.trim()) {
      newErrors.assigned_to = 'Assignee is required';
    }

    if (formData.assigned_to_email && !formData.assigned_to_email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.assigned_to_email = 'Invalid email format';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err) {
      console.error('Failed to submit:', err);
      setErrors({ submit: 'Failed to save action item. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof ActionItemCreate, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
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
              {item ? 'Edit Action Item' : 'New Action Item'}
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
            {/* Template Selector - Only show for new items */}
            {!item && (
              <div>
                <label htmlFor="template" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Start with a template (optional)
                </label>
                <select
                  id="template"
                  value={selectedTemplate}
                  onChange={(e) => handleTemplateChange(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                >
                  {TASK_TEMPLATES.map((template) => (
                    <option key={template.value} value={template.value}>
                      {template.label}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Choose a template to quickly fill in common task types
                </p>
              </div>
            )}

            {/* Task Description */}
            <div>
              <label htmlFor="task_description" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Task Description *
              </label>
              <textarea
                id="task_description"
                rows={4}
                value={formData.task_description}
                onChange={(e) => handleChange('task_description', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors ${
                  errors.task_description
                    ? 'border-red-500 dark:border-red-500'
                    : 'border-slate-300 dark:border-slate-600'
                }`}
                placeholder="Describe the action item..."
              />
              {errors.task_description && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.task_description}</p>
              )}
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {formData.task_description.length}/2000 characters
              </p>
            </div>

            {/* Assignee */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="assigned_to" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assigned To *
                </label>
                <input
                  type="text"
                  id="assigned_to"
                  value={formData.assigned_to}
                  onChange={(e) => handleChange('assigned_to', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors ${
                    errors.assigned_to
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="Name"
                />
                {errors.assigned_to && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assigned_to}</p>
                )}
              </div>

              <div>
                <label htmlFor="assigned_to_email" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Assignee Email
                </label>
                <input
                  type="email"
                  id="assigned_to_email"
                  value={formData.assigned_to_email || ''}
                  onChange={(e) => handleChange('assigned_to_email', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors ${
                    errors.assigned_to_email
                      ? 'border-red-500 dark:border-red-500'
                      : 'border-slate-300 dark:border-slate-600'
                  }`}
                  placeholder="email@example.com"
                />
                {errors.assigned_to_email && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.assigned_to_email}</p>
                )}
              </div>
            </div>

            {/* Due Date & Priority */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Due Date
                </label>
                <input
                  type="date"
                  id="due_date"
                  value={formData.due_date || ''}
                  onChange={(e) => handleChange('due_date', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Priority
                </label>
                <select
                  id="priority"
                  value={formData.priority}
                  onChange={(e) => handleChange('priority', e.target.value as ActionItemPriority)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>

            {/* Status & Project */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Status
                </label>
                <select
                  id="status"
                  value={formData.status}
                  onChange={(e) => handleChange('status', e.target.value as ActionItemStatus)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <label htmlFor="project_name" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  Project
                </label>
                <input
                  type="text"
                  id="project_name"
                  value={formData.project_name || ''}
                  onChange={(e) => handleChange('project_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                  placeholder="Project name"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Notes
              </label>
              <textarea
                id="notes"
                rows={3}
                value={formData.notes || ''}
                onChange={(e) => handleChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-slate-900 dark:text-white transition-colors"
                placeholder="Additional notes or context..."
              />
            </div>

            {/* Submit Error */}
            {errors.submit && (
              <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-300">{errors.submit}</p>
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
                    Saving...
                  </span>
                ) : (
                  <span>{item ? 'Update Action Item' : 'Create Action Item'}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
