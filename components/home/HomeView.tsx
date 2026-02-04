'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  SendIcon,
  SparkleIcon
} from '@/components/ui/Icons';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { uploadDocument, DocumentUploadResponse, ApiError, waitForDocumentReady } from '@/services/api';
import FilePreviewModal from '@/components/chat/FilePreviewModal';
import { useAuth } from '@/contexts/AuthContext';
import Image from 'next/image';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'processing' | 'completed' | 'failed';
  error?: string;
  response?: DocumentUploadResponse;
}

interface HomeViewProps {
  onSendMessage: (
    message: string, 
    documentIds?: string[],
    attachments?: { id: string; name: string; type: 'pdf' | 'docx' | 'txt' | 'other'; size?: number }[]
  ) => void;
}

// Get file type from extension
function getFileType(filename: string): 'pdf' | 'docx' | 'txt' {
  const ext = filename.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'pdf':
      return 'pdf';
    case 'doc':
    case 'docx':
      return 'docx';
    default:
      return 'txt';
  }
}

// Suggestion items
const suggestions = [
  {
    icon: '🎨',
    text: 'A developer portfolio with dark theme, project cards, and contact form.',
  },
  {
    icon: '⏱️',
    text: 'A modern SaaS landing page for a time-tracking app.',
  },
  {
    icon: '🧴',
    text: 'An e-commerce homepage for a skincare brand.',
  },
];

// Category tabs
const categories = [
  { id: 'suggested', label: 'Suggested', icon: '💡' },
  { id: 'wireframe', label: 'Wireframe', icon: '📐' },
  { id: 'apps', label: 'Apps', icon: '📱' },
  { id: 'websites', label: 'Websites', icon: '🌐' },
  { id: 'prototype', label: 'Prototype', icon: '🎯' },
];

export default function HomeView({ onSendMessage }: HomeViewProps) {
  const { user } = useAuth();
  const [inputValue, setInputValue] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  const [previewFile, setPreviewFile] = useState<{
    documentId: string;
    filename: string;
    fileType: 'pdf' | 'docx' | 'txt';
  } | null>(null);
  const [activeCategory, setActiveCategory] = useState('suggested');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea based on content
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const maxHeight = 120;
      textarea.style.height = `${Math.min(textarea.scrollHeight, maxHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue]);

  const isUploading = uploadingFiles.some(f => f.status === 'uploading');

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey && inputValue.trim() && !isUploading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    if (inputValue.trim() && !isUploading) {
      const uploadedFiles = uploadingFiles
        .filter(f => (f.status === 'completed' || f.status === 'processing') && f.response?.id);
      
      const documentIds = uploadedFiles.map(f => f.response!.id);
      
      const attachments = uploadedFiles.map(f => ({
        id: f.response!.id,
        name: f.file.name,
        type: getFileType(f.file.name) as 'pdf' | 'docx' | 'txt' | 'other',
        size: f.file.size
      }));

      onSendMessage(
        inputValue.trim(), 
        documentIds.length > 0 ? documentIds : undefined,
        attachments.length > 0 ? attachments : undefined
      );
      setInputValue('');
      setUploadingFiles([]);
    }
  };

  const handleSuggestionClick = (text: string) => {
    setInputValue(text);
    textareaRef.current?.focus();
  };

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    for (const file of Array.from(files)) {
      const fileId = `upload-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      setUploadingFiles(prev => [...prev, {
        id: fileId,
        file,
        progress: 0,
        status: 'uploading',
      }]);

      try {
        const response = await uploadDocument(
          file,
          undefined,
          undefined,
          (progress) => {
            setUploadingFiles(prev => prev.map(f => 
              f.id === fileId ? { ...f, progress } : f
            ));
          }
        );

        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'processing', progress: 100, response } : f
        ));

        const finalDoc = await waitForDocumentReady(response.id);
        
        if (finalDoc.status === 'completed') {
          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { ...f, status: 'completed' } : f
          ));
        } else {
          setUploadingFiles(prev => prev.map(f => 
            f.id === fileId ? { 
              ...f, 
              status: 'failed', 
              error: finalDoc.error_message || 'Processing failed' 
            } : f
          ));
        }

      } catch (error) {
        console.error('File upload failed:', error);
        const errorMessage = error instanceof ApiError ? error.message : 'Upload failed';
        setUploadingFiles(prev => prev.map(f => 
          f.id === fileId ? { ...f, status: 'failed', error: errorMessage } : f
        ));
      }
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeUpload = (e: React.MouseEvent, fileId: string) => {
    e.stopPropagation();
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const openPreview = (upload: UploadingFile) => {
    if (upload.status === 'completed' && upload.response) {
      setPreviewFile({
        documentId: upload.response.id,
        filename: upload.response.filename,
        fileType: getFileType(upload.response.filename),
      });
    }
  };

  return (
    <>
      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          isOpen={true}
          onClose={() => setPreviewFile(null)}
          documentId={previewFile.documentId}
          filename={previewFile.filename}
          fileType={previewFile.fileType}
        />
      )}

      <div className="flex flex-col items-center justify-center min-h-full h-full px-4 py-8 relative overflow-hidden">
        {/* Theme Toggle - Top Right */}
        <div className="absolute top-4 right-4 lg:hidden">
          <ThemeToggle />
        </div>

        {/* Decorative Background */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-gradient-to-r from-[var(--primary)]/10 to-purple-500/10 rounded-full blur-3xl" />
        </div>

        {/* Main Content Container */}
        <div className="w-full max-w-3xl space-y-6 animate-fade-in-up">
          
          {/* Hero Card with Robot */}
          <div className="landing-card relative overflow-visible">
            <div className="flex items-center justify-between gap-8">
              <h1 className="text-3xl md:text-4xl font-bold text-[var(--foreground)] tracking-tight">
                Turn your ideas into interfaces
              </h1>
              
              {/* Robot Character */}
              <div className="hidden md:block flex-shrink-0 robot-character">
                <Image 
                  src="/robot.png" 
                  alt="Robot Assistant" 
                  width={180}
                  height={180}
                  className="object-contain"
                  priority
                />
              </div>
            </div>
          </div>

          {/* Input Card */}
          <div className="landing-card">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileChange}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.md,.markdown,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,text/plain,text/markdown"
            />

            {/* File Upload Cards */}
            {uploadingFiles.length > 0 && (
              <div className="mb-4 flex flex-wrap gap-2">
                {uploadingFiles.map((upload) => (
                  <div 
                    key={upload.id}
                    onClick={() => openPreview(upload)}
                    className={`
                      relative flex items-center gap-3 pl-3 pr-8 py-2.5 rounded-xl
                      bg-[var(--surface)] border border-[var(--border)]
                      ${upload.status === 'completed' ? 'cursor-pointer hover:border-[var(--primary)]/50' : ''}
                      ${upload.status === 'failed' ? 'border-red-500/50' : ''}
                      transition-all duration-200
                    `}
                  >
                    <div className={`
                      w-10 h-12 rounded-lg flex items-center justify-center flex-shrink-0
                      ${upload.status === 'failed' ? 'bg-red-500/20' : 'bg-red-500'}
                    `}>
                      <svg 
                        className={`w-6 h-6 ${upload.status === 'failed' ? 'text-red-500' : 'text-white'}`} 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                      </svg>
                    </div>
                    
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-[var(--foreground)] truncate max-w-[200px]">
                        {upload.file.name}
                      </p>
                      <p className="text-xs text-[var(--foreground-muted)] uppercase mt-0.5">
                        {upload.status === 'uploading' 
                          ? `Uploading ${upload.progress}%` 
                          : upload.status === 'processing'
                          ? 'Processing...'
                          : upload.status === 'failed'
                          ? upload.error
                          : getFileType(upload.file.name).toUpperCase()
                        }
                      </p>
                      
                      {upload.status === 'uploading' && (
                        <div className="mt-1.5 w-32 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[var(--primary)] transition-all duration-300"
                            style={{ width: `${upload.progress}%` }}
                          />
                        </div>
                      )}
                      
                      {upload.status === 'processing' && (
                        <div className="mt-1.5 w-32 h-1 rounded-full bg-[var(--border)] overflow-hidden">
                          <div 
                            className="h-full rounded-full bg-[var(--primary)] animate-pulse"
                            style={{ width: '100%' }}
                          />
                        </div>
                      )}
                    </div>
                    
                    <button
                      onClick={(e) => removeUpload(e, upload.id)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-[var(--surface-hover)] text-[var(--foreground-muted)] hover:text-[var(--foreground)] hover:bg-[var(--border)] transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Input Area */}
            <textarea 
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="What do you want to design?"
              rows={1}
              className="
                w-full bg-transparent border-none outline-none 
                text-[var(--foreground)] placeholder-[var(--foreground-muted)]
                text-base md:text-lg
                resize-none
                overflow-y-auto
                max-h-[120px]
                leading-7
                mb-4
              "
            />

            {/* Input Controls */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2 flex-wrap">
                {/* Attachment Button */}
                <button 
                  type="button"
                  onClick={handleFileClick}
                  disabled={isUploading}
                  className="input-control-btn"
                  title="Upload documents"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                  </svg>
                </button>

                {/* Design Style Dropdown */}
                <button className="input-control-btn">
                  <span className="text-sm">Design Style</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Ideas Button */}
                <button className="input-control-btn input-control-btn-primary">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <span className="text-sm">Ideas</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                {/* Framer AI Selector */}
                <button className="input-control-btn">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                  </svg>
                  <span className="text-sm">Framer AI</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Voice Input */}
                <button 
                  className="input-control-btn-icon"
                  title="Voice input"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`category-tab ${activeCategory === category.id ? 'category-tab-active' : ''}`}
              >
                <span>{category.icon}</span>
                <span>{category.label}</span>
              </button>
            ))}
          </div>

          {/* Suggestion Cards */}
          <div className="space-y-3">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion.text)}
                className="suggestion-card group"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <span className="text-2xl flex-shrink-0">{suggestion.icon}</span>
                  <p className="text-sm md:text-base text-[var(--foreground-secondary)] text-left group-hover:text-[var(--foreground)] transition-colors">
                    {suggestion.text}
                  </p>
                </div>
                
                {/* Hover Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="suggestion-card-hover-icon opacity-0 group-hover:opacity-100">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  </div>
                  <div className="suggestion-card-arrow">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </button>
            ))}
          </div>

        </div>
      </div>
    </>
  );
}
