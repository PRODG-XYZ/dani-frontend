'use client';

import { useState, useEffect } from 'react';

interface AvatarProps {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
  className?: string;
}

export default function Avatar({ src, alt, size = 'md', fallback, className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setImageError(false);
  }, [src]);

  const sizeStyles = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-24 h-24 text-2xl',
  };
  
  const getInitials = (name: string) => {
    // Handle empty string or email-like strings
    if (!name || name.trim() === '') return '?';
    
    // If it looks like an email, use first letter of local part
    if (name.includes('@')) {
      return name[0].toUpperCase();
    }
    
    return name
      .trim()
      .split(' ')
      .filter(word => word.length > 0)
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show image only if src exists and hasn't errored
  if (src && !imageError) {
    return (
      <div className={`relative group ${className}`}>
        <img
          src={src}
          alt={alt}
          onError={() => setImageError(true)}
          className={`
            ${sizeStyles[size]} 
            rounded-full object-cover
            ring-2 ring-transparent
            group-hover:ring-[var(--primary)] group-hover:ring-offset-2
            transition-all duration-300
          `}
        />
        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--primary-glow)] blur-md -z-10" />
      </div>
    );
  }
  
  // Fallback to initials
  return (
    <div className={`relative group ${className}`}>
      <div
        className={`
          ${sizeStyles[size]} 
          rounded-full 
          bg-gradient-to-br from-[var(--primary)] to-purple-500
          flex items-center justify-center 
          text-white font-semibold
          ring-2 ring-transparent
          group-hover:ring-[var(--primary)] group-hover:ring-offset-2
          transition-all duration-300
          shadow-md
        `}
      >
        {getInitials(fallback || alt)}
      </div>
      {/* Subtle glow on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--primary-glow)] blur-lg -z-10" />
    </div>
  );
}

