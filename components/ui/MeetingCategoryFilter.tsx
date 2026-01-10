'use client';

import { MeetingCategory } from '@/types';

interface CategoryOption {
  value: MeetingCategory;
  label: string;
  icon: string;
  bgColor: string;
  textColor: string;
  hoverBg: string;
}

const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'all', label: 'All Meetings', icon: '📋', bgColor: 'bg-gray-100 dark:bg-gray-800', textColor: 'text-gray-700 dark:text-gray-300', hoverBg: 'hover:bg-gray-200 dark:hover:bg-gray-700' },
  { value: 'board', label: 'Board', icon: '🏛️', bgColor: 'bg-purple-100 dark:bg-purple-900/30', textColor: 'text-purple-700 dark:text-purple-300', hoverBg: 'hover:bg-purple-200 dark:hover:bg-purple-900/50' },
  { value: '1on1', label: '1:1', icon: '👥', bgColor: 'bg-blue-100 dark:bg-blue-900/30', textColor: 'text-blue-700 dark:text-blue-300', hoverBg: 'hover:bg-blue-200 dark:hover:bg-blue-900/50' },
  { value: 'standup', label: 'Standup', icon: '🚀', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-300', hoverBg: 'hover:bg-green-200 dark:hover:bg-green-900/50' },
  { value: 'client', label: 'Client', icon: '🤝', bgColor: 'bg-orange-100 dark:bg-orange-900/30', textColor: 'text-orange-700 dark:text-orange-300', hoverBg: 'hover:bg-orange-200 dark:hover:bg-orange-900/50' },
  { value: 'internal', label: 'Internal', icon: '🏢', bgColor: 'bg-slate-100 dark:bg-slate-800', textColor: 'text-slate-700 dark:text-slate-300', hoverBg: 'hover:bg-slate-200 dark:hover:bg-slate-700' },
  { value: 'external', label: 'External', icon: '🌐', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-300', hoverBg: 'hover:bg-yellow-200 dark:hover:bg-yellow-900/50' },
];

interface MeetingCategoryFilterProps {
  value: MeetingCategory;
  onChange: (category: MeetingCategory) => void;
  compact?: boolean;
  vertical?: boolean;
}

export default function MeetingCategoryFilter({
  value,
  onChange,
  compact = false,
  vertical = false,
}: MeetingCategoryFilterProps) {
  return (
    <div className={vertical ? "flex flex-col gap-1" : "flex flex-wrap items-center gap-1.5"}>
      {CATEGORY_OPTIONS.map((option) => {
        const isSelected = value === option.value;
        
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`
              flex items-center gap-2
              ${vertical 
                ? 'w-full px-3 py-2 rounded-lg text-left' 
                : compact 
                  ? 'px-2 py-1 text-xs rounded-full' 
                  : 'px-3 py-1.5 text-sm rounded-full'
              }
              font-medium
              transition-all duration-200
              ${isSelected
                ? `${option.bgColor} ${option.textColor} ${vertical ? '' : 'ring-2 ring-offset-1 ring-[var(--primary)]'}`
                : `bg-[var(--surface)] text-[var(--foreground-muted)] ${option.hoverBg} hover:text-[var(--foreground)]`
              }
            `}
            title={option.label}
          >
            <span className={compact ? 'text-sm' : 'text-base'}>{option.icon}</span>
            {(!compact || vertical) && <span className={vertical ? 'text-sm' : ''}>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

// Export for use in other components
export { CATEGORY_OPTIONS };
export type { CategoryOption };
