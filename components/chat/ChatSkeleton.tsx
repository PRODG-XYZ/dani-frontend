'use client';

export default function ChatSkeleton() {
  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar Skeleton */}
      <div className="w-60 h-screen bg-[#FAFAFA] flex flex-col border-r border-gray-200">
        {/* Header */}
        <div className="p-4">
          {/* Logo and Collapse */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-gray-200 animate-pulse" />
              <div className="w-12 h-5 rounded bg-gray-200 animate-pulse" />
            </div>
            <div className="w-6 h-6 rounded-lg bg-gray-200 animate-pulse" />
          </div>

          {/* Search */}
          <div className="w-full h-9 rounded-lg bg-gray-200 animate-pulse mb-4" />
        </div>

        {/* Navigation */}
        <div className="px-2 mb-2 space-y-1">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-full h-9 rounded-lg bg-gray-200 animate-pulse" />
          ))}
        </div>

        {/* Conversations */}
        <div className="flex-1 overflow-y-auto px-2">
          <div className="px-3 py-1 mb-2">
            <div className="w-24 h-3 rounded bg-gray-200 animate-pulse" />
          </div>
          <div className="space-y-1">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="w-full h-10 rounded-lg bg-gray-200 animate-pulse" />
            ))}
          </div>
        </div>

        {/* User Profile */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            <div className="flex-1">
              <div className="w-20 h-4 rounded bg-gray-200 animate-pulse mb-1" />
              <div className="w-32 h-3 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Skeleton */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-8 py-3 border-b border-gray-200 flex items-center justify-end">
          <div className="w-24 h-9 rounded-lg bg-gray-200 animate-pulse" />
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto py-4 px-8 w-full">
            {/* Empty State Skeleton */}
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mb-6" />
              <div className="w-64 h-6 rounded bg-gray-200 animate-pulse mb-2" />
              <div className="w-48 h-4 rounded bg-gray-200 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Input Skeleton */}
        <div className="px-8 py-6 bg-white border-t border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="w-full h-14 rounded-[20px] bg-gray-200 animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
