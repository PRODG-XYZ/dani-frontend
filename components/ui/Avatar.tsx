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
  const [imageLoaded, setImageLoaded] = useState(false);

  // Reset error and loaded state when src changes
  useEffect(() => {
    setImageError(false);
    setImageLoaded(false);
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
    
    // Return only the first letter of the first word (first name)
    const firstName = name.trim().split(' ').filter(word => word.length > 0)[0];
    return firstName ? firstName[0].toUpperCase() : '?';
  };

  // Validate src URL - skip invalid or empty URLs
  const isValidSrc = src && src.trim() !== '' && (src.startsWith('http') || src.startsWith('data:') || src.startsWith('/'));

  // Show image only if src is valid and hasn't errored
  const showImage = isValidSrc && !imageError;

  // Fallback initials component
  const InitialsFallback = () => (
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

  // If no valid src or error occurred, show fallback
  if (!showImage) {
    return <InitialsFallback />;
  }

  return (
    <div className={`relative group ${className}`}>
      {/* Show initials while image is loading */}
      {!imageLoaded && (
        <div
          className={`
            ${sizeStyles[size]} 
            rounded-full 
            bg-gradient-to-br from-[var(--primary)] to-purple-500
            flex items-center justify-center 
            text-white font-semibold
            shadow-md
            absolute inset-0
          `}
        >
          {getInitials(fallback || alt)}
        </div>
      )}
      <img
        src={src}
        alt={alt}
        onError={() => setImageError(true)}
        onLoad={() => setImageLoaded(true)}
        referrerPolicy="no-referrer"
        crossOrigin="anonymous"
        className={`
          ${sizeStyles[size]} 
          rounded-full object-cover
          ring-2 ring-transparent
          group-hover:ring-[var(--primary)] group-hover:ring-offset-2
          transition-all duration-300
          ${imageLoaded ? 'opacity-100' : 'opacity-0'}
        `}
      />
      {/* Glow effect on hover */}
      <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-[var(--primary-glow)] blur-md -z-10" />
    </div>
  );
}