import { ButtonHTMLAttributes, forwardRef } from 'react';

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'ghost' | 'solid' | 'glass' | 'primary';
  ariaLabel: string;
}

const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ icon, size = 'md', variant = 'ghost', ariaLabel, className = '', ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      active:scale-95
    `;
    
    const variantStyles = {
      ghost: `
        bg-transparent text-[var(--foreground-secondary)]
        hover:bg-[var(--surface)] hover:text-[var(--foreground)]
      `,
      solid: `
        bg-[var(--surface)] text-[var(--foreground)]
        border border-[var(--border)]
        hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]
        hover:shadow-md
      `,
      glass: `
        glass
        text-[var(--foreground-secondary)]
        hover:text-[var(--foreground)]
        hover:shadow-md
      `,
      primary: `
        bg-[var(--primary)] text-white
        hover:bg-[var(--primary-hover)]
        hover:shadow-lg hover:shadow-[var(--primary-glow)]
      `,
    };
    
    const sizeStyles = {
      sm: 'p-1.5 text-sm',
      md: 'p-2.5 text-base',
      lg: 'p-3 text-lg',
    };
    
    return (
      <button
        ref={ref}
        aria-label={ariaLabel}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {icon}
      </button>
    );
  }
);

IconButton.displayName = 'IconButton';

export default IconButton;
