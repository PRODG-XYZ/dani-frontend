'use client';

import { useEffect } from 'react';

interface InfographicLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  alt?: string;
}

export default function InfographicLightbox({
  isOpen,
  onClose,
  imageSrc,
  alt = 'Infographic',
}: InfographicLightboxProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm cursor-zoom-out"
      onClick={onClose}
    >
      <img
        src={imageSrc}
        alt={alt}
        className="max-w-full max-h-[90vh] w-auto h-auto object-contain cursor-default"
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
}
