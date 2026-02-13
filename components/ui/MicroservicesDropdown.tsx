'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const TaskIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

interface Microservice {
  id: string;
  name: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  badge?: string;
}

const microservices: Microservice[] = [
  {
    id: 'action-items',
    name: 'Action Items',
    description: 'Manage tasks and to-dos',
    href: '/action-items',
    icon: <TaskIcon className="w-5 h-5" />,
  },
];

export default function MicroservicesDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  const handleServiceClick = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div ref={dropdownRef} className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          flex items-center justify-center w-9 h-9 md:w-10 md:h-10
          text-[var(--foreground)]
          bg-[var(--surface)]
          hover:bg-[var(--surface-hover)]
          border border-[var(--border)]
          hover:border-[var(--border-hover)]
          rounded-xl
          transition-all duration-200
          hover:scale-105 active:scale-95
          ${isOpen ? 'bg-[var(--surface-hover)] border-[var(--primary)] shadow-lg' : ''}
        `}
        aria-label="Microservices menu"
        aria-expanded={isOpen}
        title="Microservices"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      </button>

      {/* Dropdown Menu with smooth animation */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-72 sm:w-80 md:w-96 glass-strong rounded-2xl shadow-2xl overflow-hidden z-50 animate-scale-in border border-[var(--border)]">
          <div className="p-3">
            {/* Header */}
            <div className="px-3 py-2.5 border-b border-[var(--border)]">
              <h3 className="text-xs font-semibold text-[var(--foreground-secondary)] uppercase tracking-wider">
                Microservices
              </h3>
            </div>

            {/* Service Items */}
            <div className="py-2 space-y-1">
              {microservices.map((service, index) => (
                <button
                  key={service.id}
                  onClick={() => handleServiceClick(service.href)}
                  className="w-full flex items-start gap-3 px-3 py-3 text-left rounded-xl hover:bg-[var(--surface-hover)] transition-all duration-200 group hover:scale-[1.02] active:scale-[0.98]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="shrink-0 mt-0.5 text-[var(--foreground-secondary)] group-hover:text-[var(--primary)] transition-colors duration-200">
                    {service.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors duration-200 truncate">
                        {service.name}
                      </span>
                      {service.badge && (
                        <span className="shrink-0 px-2 py-0.5 text-xs font-medium text-[var(--primary)] bg-[var(--primary)]/10 rounded-md">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[var(--foreground-secondary)] mt-1 line-clamp-1">
                      {service.description}
                    </p>
                  </div>
                  <svg className="w-4 h-4 text-[var(--foreground-muted)] opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200 shrink-0 mt-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              ))}
            </div>

            {/* Footer hint */}
            <div className="px-3 py-2 mt-1 border-t border-[var(--border)]">
              <p className="text-xs text-[var(--foreground-muted)] text-center">
                Quick access to all services
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
