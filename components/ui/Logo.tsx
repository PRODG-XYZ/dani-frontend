// DANI Logo Component - Used consistently across all pages
export default function Logo({ 
  size = 'md',
  showText = true,
  className = ''
}: { 
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  const iconSizeClasses = {
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-7 h-7',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Logo Icon - Consistent with auth page */}
      <div className={`
        ${sizeClasses[size]} 
        rounded-xl 
        bg-gradient-to-br from-[var(--primary)] to-purple-500 
        flex items-center justify-center 
        shadow-lg shadow-[var(--primary-glow)]
      `}>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className={`${iconSizeClasses[size]} text-white`}
        >
          <path
            d="M12 2L2 7L12 12L22 7L12 2Z"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 17L12 22L22 17"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M2 12L12 17L22 12"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className={`${textSizeClasses[size]} font-bold gradient-text`}>
          DANI
        </span>
      )}
    </div>
  );
}
