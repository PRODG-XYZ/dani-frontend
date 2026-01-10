'use client';

import { useTheme } from '@/contexts/ThemeProvider';
import { SunIcon, MoonIcon } from './Icons';

interface ThemeToggleProps {
  className?: string;
}

export default function ThemeToggle({ className = '' }: ThemeToggleProps) {
  const { theme, toggleTheme, mounted } = useTheme();

  // Render a placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <div 
        className={`
          p-2.5 rounded-xl
          glass
          w-10 h-10
          ${className}
        `}
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative p-2.5 rounded-xl
        glass hover-lift
        text-[var(--foreground-secondary)] hover:text-[var(--foreground)]
        transition-all duration-300
        group
        ${className}
      `}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${theme === 'light' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 rotate-90 scale-75'
            }
          `}
        >
          <SunIcon className="w-5 h-5" />
        </span>
        
        {/* Moon Icon */}
        <span
          className={`
            absolute inset-0 flex items-center justify-center
            transition-all duration-300
            ${theme === 'dark' 
              ? 'opacity-100 rotate-0 scale-100' 
              : 'opacity-0 -rotate-90 scale-75'
            }
          `}
        >
          <MoonIcon className="w-5 h-5" />
        </span>
      </div>
      
      {/* Hover glow effect */}
      <div 
        className={`
          absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
          transition-opacity duration-300
          ${theme === 'light' 
            ? 'bg-gradient-to-r from-yellow-200/20 to-orange-200/20' 
            : 'bg-gradient-to-r from-blue-400/20 to-purple-400/20'
          }
        `}
      />
    </button>
  );
}
