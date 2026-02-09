'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  listDocuments,
  deleteDocument,
  updateDocument,
  getDocumentDownloadUrl,
  uploadDocument,
  waitForDocumentReady,
  DocumentResponse,
  DocumentStatus,
  DocumentType,
  ApiError,
} from '@/services/api';
import FilePreviewModal from '@/components/chat/FilePreviewModal';

export default function LibraryView() {
  const [documents, setDocuments] = useState<DocumentResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'all'>('all');
  const [fileTypeFilter, setFileTypeFilter] = useState<DocumentType | 'all'>('all');
  const [skip, setSkip] = useState(0);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const limit = 20;

  // Edit state
  const [editingDocId, setEditingDocId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');

  // Preview state
  const [previewDoc, setPreviewDoc] = useState<{ id: string; filename: string; fileType: 'pdf' | 'docx' | 'txt' } | null>(null);

  // Upload state
  const [uploadingFiles, setUploadingFiles] = useState<{ id: string; file: File; progress: number; status: 'uploading' | 'processing' | 'completed' | 'failed'; error?: string }[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchDocuments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await listDocuments(
        skip,
        limit,
        statusFilter !== 'all' ? statusFilter : undefined,
        fileTypeFilter !== 'all' ? fileTypeFilter : undefined,
        searchQuery || undefined
      );
      setDocuments(response.documents);
      setTotal(response.total);
      setHasMore(response.has_more);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [skip, statusFilter, fileTypeFilter, searchQuery]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const handleDelete = async (documentId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    try {
      await deleteDocument(documentId);
      await fetchDocuments();
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
    }
  };

  const startEditing = (doc: DocumentResponse) => {
    setEditingDocId(doc.id);
    setEditTitle(doc.title || '');
    setEditDescription(doc.description || '');
  };

  const cancelEdit = () => {
    setEditingDocId(null);
    setEditTitle('');
    setEditDescription('');
  };

  const saveEdit = async () => {
    if (!editingDocId) return;
    try {
      await updateDocument(editingDocId, {
        title: editTitle || undefined,
        description: editDescription || undefined,
      });
      setEditingDocId(null);
      await fetchDocuments();
    } catch (err) {
      setError('Failed to update document');
      console.error(err);
    }
  };

  const handleDownload = async (doc: DocumentResponse) => {
    try {
      const response = await getDocumentDownloadUrl(doc.id, 3600, false);
      window.open(response.download_url, '_blank');
    } catch (err) {
      console.error('Failed to download document:', err);
      alert('Failed to download document. Please try again.');
    }
  };

  const getPreviewFileType = (doc: DocumentResponse): 'pdf' | 'docx' | 'txt' => {
    const t = doc.file_type;
    return t === 'pdf' || t === 'docx' || t === 'txt' ? t : 'txt';
  };

  const handleFiles = useCallback((files: FileList | File[]) => {
    Array.from(files).forEach(async (file) => {
      const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      setUploadingFiles(prev => [...prev, { id, file, progress: 0, status: 'uploading' }]);

      try {
        const response = await uploadDocument(file, undefined, undefined, (progress) => {
          setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
        });
        setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'processing', progress: 100 } : f));

        const finalDoc = await waitForDocumentReady(response.id);
        if (finalDoc.status === 'completed') {
          setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'completed' } : f));
        } else {
          setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'failed', error: finalDoc.error_message || 'Processing failed' } : f));
        }
        fetchDocuments();
      } catch (err) {
        const msg = err instanceof ApiError ? err.message : 'Upload failed';
        setUploadingFiles(prev => prev.map(f => f.id === id ? { ...f, status: 'failed', error: msg } : f));
      }
    });
  }, [fetchDocuments]);

  const removeUpload = (fileId: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: DocumentStatus) => {
    const styles: Record<DocumentStatus, string> = {
      completed: 'bg-green-100 text-green-700 border-green-200',
      processing: 'bg-blue-100 text-blue-700 border-blue-200',
      failed: 'bg-red-100 text-red-700 border-red-200',
      pending: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    return styles[status] || styles.pending;
  };

  const getFileTypeIcon = (fileType: DocumentType) => {
    switch (fileType) {
      case 'pdf':
        return (
          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      case 'docx':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
            <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-white">
      {/* Header */}
      <div className="px-8 py-6 border-b border-gray-200">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Library</h1>
          </div>

          {/* Search Bar */}
          <div className="relative mb-4">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setSkip(0); // Reset pagination on search
              }}
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-0 focus:border-gray-300 transition-all"
              style={{ outline: 'none', boxShadow: 'none' }}
            />
          </div>

          {/* Filters */}
          <div className="flex items-center gap-3 mb-4">
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as DocumentStatus | 'all');
                setSkip(0);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="pending">Pending</option>
              <option value="failed">Failed</option>
            </select>
            <select
              value={fileTypeFilter}
              onChange={(e) => {
                setFileTypeFilter(e.target.value as DocumentType | 'all');
                setSkip(0);
              }}
              className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-300"
            >
              <option value="all">All Types</option>
              <option value="pdf">PDF</option>
              <option value="docx">DOCX</option>
              <option value="txt">TXT</option>
            </select>
          </div>

          {/* Document Count */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-600">
              {total} {total === 1 ? 'document' : 'documents'}
            </p>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              Upload Documents
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            accept=".pdf,.doc,.docx,.txt,.md"
            onChange={(e) => {
              if (e.target.files?.length) {
                handleFiles(e.target.files);
                e.target.value = '';
              }
            }}
          />

          {/* Upload Zone - drag and drop */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={(e) => { e.preventDefault(); setIsDragging(false); }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);
              if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 cursor-pointer transition-all mb-4 ${
              isDragging ? 'border-[#FF8C00] bg-orange-50' : 'border-gray-200 hover:border-[#FF8C00]/50 hover:bg-gray-50'
            }`}
          >
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Drop files here or click to upload • PDF, DOCX, TXT
              </p>
            </div>
          </div>

          {/* Upload Progress */}
          {uploadingFiles.length > 0 && (
            <div className="space-y-2 mb-4">
              {uploadingFiles.map((upload) => (
                <div key={upload.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{upload.file.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {upload.status === 'uploading' && (
                        <>
                          <div className="flex-1 max-w-[120px] h-1.5 bg-gray-200 rounded-full overflow-hidden">
                            <div className="h-full bg-[#FF8C00] transition-all" style={{ width: `${upload.progress}%` }} />
                          </div>
                          <span className="text-xs text-gray-500">{upload.progress}%</span>
                        </>
                      )}
                      {upload.status === 'processing' && <span className="text-xs text-blue-500">Processing...</span>}
                      {upload.status === 'completed' && <span className="text-xs text-green-600">✓ Done</span>}
                      {upload.status === 'failed' && <span className="text-xs text-red-500">{upload.error}</span>}
                    </div>
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeUpload(upload.id); }}
                    className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-500"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-8 py-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gray-200 border-t-gray-600 rounded-full animate-spin mx-auto mb-4" />
              <p className="text-gray-600 text-sm">Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">
                {searchQuery || statusFilter !== 'all' || fileTypeFilter !== 'all'
                  ? 'No documents found matching your filters'
                  : 'No documents yet'}
              </p>
            </div>
          ) : (
            <>
              <div className="space-y-0">
                {documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center gap-3 px-4 py-4 rounded-lg hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                  >
                    <div className="flex-shrink-0">
                      {getFileTypeIcon(doc.file_type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {editingDocId === doc.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            placeholder="Title"
                            className="w-full px-2 py-1 rounded bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-400"
                            autoFocus
                          />
                          <input
                            type="text"
                            value={editDescription}
                            onChange={(e) => setEditDescription(e.target.value)}
                            placeholder="Description (optional)"
                            className="w-full px-2 py-1 rounded bg-white border border-gray-300 text-sm text-gray-900 focus:outline-none focus:ring-0 focus:border-gray-400"
                          />
                        </div>
                      ) : (
                        <>
                          <h3
                            className="text-sm font-semibold text-gray-900 truncate mb-1 group-hover:text-[#FF8C00] transition-colors cursor-pointer"
                            onClick={() => setPreviewDoc({ id: doc.id, filename: doc.filename, fileType: getPreviewFileType(doc) })}
                          >
                            {doc.title || doc.filename}
                          </h3>
                          {doc.description && (
                            <p className="text-xs text-gray-500 truncate mb-1">{doc.description}</p>
                          )}
                          <div className="flex items-center gap-3 text-xs text-gray-400">
                            <span>{formatFileSize(doc.file_size)}</span>
                            <span>•</span>
                            <span>{formatDate(doc.created_at)}</span>
                            <span>•</span>
                            <span className={`px-2 py-0.5 rounded-full border text-xs ${getStatusBadge(doc.status)}`}>
                              {doc.status}
                            </span>
                          </div>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {editingDocId === doc.id ? (
                        <>
                          <button
                            onClick={saveEdit}
                            className="px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="px-3 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => setPreviewDoc({ id: doc.id, filename: doc.filename, fileType: getPreviewFileType(doc) })}
                            className="p-2 text-gray-400 hover:text-[#FF8C00] hover:bg-gray-100 rounded-lg transition-colors"
                            title="View"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDownload(doc)}
                            className="p-2 text-gray-400 hover:text-[#FF8C00] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Download"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                            </svg>
                          </button>
                          <button
                            onClick={() => startEditing(doc)}
                            className="p-2 text-gray-400 hover:text-[#FF8C00] hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(doc.id)}
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              {(hasMore || skip > 0) && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => setSkip(Math.max(0, skip - limit))}
                    disabled={skip === 0}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Previous
                  </button>
                  <span className="text-sm text-gray-600">
                    Showing {skip + 1}-{Math.min(skip + limit, total)} of {total}
                  </span>
                  <button
                    onClick={() => setSkip(skip + limit)}
                    disabled={!hasMore}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* File Preview Modal */}
      {previewDoc && (
        <FilePreviewModal
          isOpen={true}
          onClose={() => setPreviewDoc(null)}
          documentId={previewDoc.id}
          filename={previewDoc.filename}
          fileType={previewDoc.fileType}
        />
      )}
    </div>
  );
}
