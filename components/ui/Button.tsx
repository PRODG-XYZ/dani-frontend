import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'glass';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', fullWidth = false, className = '', children, ...props }, ref) => {
    const baseStyles = `
      inline-flex items-center justify-center font-medium rounded-xl
      transition-all duration-300 ease-out
      focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      active:scale-[0.98]
    `;
    
    const variantStyles = {
      primary: `
        bg-[var(--primary)] text-white
        hover:bg-[var(--primary-hover)] hover:shadow-lg hover:shadow-[var(--primary-glow)]
        hover:-translate-y-0.5
      `,
      secondary: `
        bg-[var(--surface)] text-[var(--foreground)]
        border border-[var(--border)]
        hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]
        hover:shadow-md hover:-translate-y-0.5
      `,
      ghost: `
        bg-transparent text-[var(--foreground-secondary)]
        hover:bg-[var(--surface)] hover:text-[var(--foreground)]
      `,
      danger: `
        bg-red-500 text-white
        hover:bg-red-600 hover:shadow-lg hover:shadow-red-500/30
        hover:-translate-y-0.5
      `,
      glass: `
        glass
        text-[var(--foreground)]
        hover:bg-[var(--glass-bg-strong)]
        hover:-translate-y-0.5 hover:shadow-lg
      `,
    };
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm gap-1.5',
      md: 'px-4 py-2.5 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
    };
    
    const widthStyle = fullWidth ? 'w-full' : '';
    
    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${widthStyle} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
