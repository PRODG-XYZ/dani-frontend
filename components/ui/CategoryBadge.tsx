'use client';

interface CategoryBadgeProps {
  category: string | null | undefined;
  confidence?: number | null;
  showConfidence?: boolean;
  size?: 'sm' | 'md';
}

// Category styling configuration
const CATEGORY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  board: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-300', label: 'Board' },
  '1on1': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-300', label: '1:1' },
  standup: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-300', label: 'Standup' },
  client: { bg: 'bg-orange-100 dark:bg-orange-900/30', text: 'text-orange-700 dark:text-orange-300', label: 'Client' },
  internal: { bg: 'bg-slate-100 dark:bg-slate-800', text: 'text-slate-700 dark:text-slate-300', label: 'Internal' },
  external: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-300', label: 'External' },
};

export default function CategoryBadge({
  category,
  confidence,
  showConfidence = true,
  size = 'sm',
}: CategoryBadgeProps) {
  // Don't render if no category
  if (!category || category === 'all') {
    return null;
  }

  const style = CATEGORY_STYLES[category] || {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-600 dark:text-gray-400',
    label: category,
  };

  const isLowConfidence = confidence != null && confidence < 0.7;
  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-sm';

  return (
    <span 
      className={`
        inline-flex items-center gap-1 
        ${sizeClasses} rounded-full font-medium
        ${style.bg} ${style.text}
        transition-opacity
      `}
      title={confidence != null ? `Confidence: ${Math.round(confidence * 100)}%` : undefined}
    >
      {style.label}
      {showConfidence && isLowConfidence && (
        <span className="opacity-60 text-xs">?</span>
      )}
    </span>
  );
}

// Export utility function for getting category style
export function getCategoryStyle(category: string | null | undefined) {
  if (!category) return null;
  return CATEGORY_STYLES[category] || null;
}
