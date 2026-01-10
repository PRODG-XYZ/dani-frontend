'use client';

import { useState, useEffect } from 'react';
import { DocumentDownloadUrlResponse, getDocumentDownloadUrl } from '@/services/api';

interface FilePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  filename: string;
  fileType: 'pdf' | 'docx' | 'txt';
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  documentId,
  filename,
  fileType,
}: FilePreviewModalProps) {
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && documentId) {
      loadDownloadUrl();
    }
  }, [isOpen, documentId]);

  const loadDownloadUrl = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getDocumentDownloadUrl(documentId);
      setDownloadUrl(response.download_url);
    } catch (err) {
      console.error('Failed to get download URL:', err);
      setError('Failed to load document preview');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleDownload = () => {
    if (downloadUrl) {
      window.open(downloadUrl, '_blank');
    }
  };

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center"
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
      
      {/* Modal */}
      <div 
        className="
          relative w-full h-full max-w-5xl max-h-[95vh] m-4
          bg-[var(--surface)] border border-[var(--border)]
          rounded-2xl shadow-2xl overflow-hidden
          flex flex-col
          animate-fade-in-up
        "
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--border)] bg-[var(--background)]">
          <div className="flex items-center gap-3 min-w-0">
            {/* File Icon */}
            <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
            </div>
            <h2 className="font-semibold text-[var(--foreground)] truncate">
              {filename}
            </h2>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Download Button */}
            {downloadUrl && (
              <button
                onClick={handleDownload}
                className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
                title="Download"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>
            )}
            
            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden bg-gray-900">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <svg className="w-16 h-16 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <p className="text-red-400">{error}</p>
              <button
                onClick={loadDownloadUrl}
                className="mt-4 px-4 py-2 rounded-lg bg-[var(--primary)] text-white hover:opacity-90 transition-opacity"
              >
                Retry
              </button>
            </div>
          ) : downloadUrl && fileType === 'pdf' ? (
            // PDF Viewer using iframe
            <iframe
              src={`${downloadUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full"
              title={filename}
            />
          ) : downloadUrl ? (
            // For non-PDF files, show download prompt
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <div className="w-24 h-24 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6">
                <svg className="w-12 h-12 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-[var(--foreground)] mb-2">
                {filename}
              </h3>
              <p className="text-[var(--foreground-muted)] mb-6">
                {fileType.toUpperCase()} files cannot be previewed directly
              </p>
              <button
                onClick={handleDownload}
                className="px-6 py-3 rounded-xl bg-gradient-to-r from-[var(--primary)] to-purple-500 text-white font-medium hover:scale-105 transition-transform"
              >
                Download File
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
