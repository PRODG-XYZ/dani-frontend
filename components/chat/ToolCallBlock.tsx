"use client";

import React from "react";
import { LoadingIcon, ImageIcon, CopyIcon } from "@/components/ui/Icons";

// Tool status types
type ToolStatus = "starting" | "processing" | "complete" | "error";
type ToolName = "infographic_generator" | "content_writer";

interface ToolCallBlockProps {
  toolName: ToolName;
  status: ToolStatus;
  message?: string;
  args?: Record<string, unknown>;
}

// Human-readable tool names
const TOOL_DISPLAY_NAMES: Record<ToolName, string> = {
  infographic_generator: "Infographic Generator",
  content_writer: "Content Writer",
};

// Check icon SVG
const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

// Error X icon SVG
const XIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

// Document icon for content writer
const DocumentIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
  </svg>
);

/**
 * ToolCallBlock - Shows when DANI is using a tool
 * 
 * Displays:
 * - Starting: "DANI is preparing to use [tool]..."
 * - Processing: "DANI is generating..." with spinner
 * - Complete: "Complete" with checkmark
 * - Error: Error message with X
 */
export function ToolCallBlock({ toolName, status, message, args }: ToolCallBlockProps) {
  const displayName = TOOL_DISPLAY_NAMES[toolName] || toolName;
  const icon = toolName === "infographic_generator"
    ? <ImageIcon className="w-5 h-5" />
    : <DocumentIcon className="w-5 h-5" />;

  // Minimalistic for content_writer (Ghostwriter) while drafting - match Thinking style
  if (toolName === "content_writer" && (status === "starting" || status === "processing")) {
    return (
      <div className="my-3 flex items-center gap-2 text-gray-500">
        <div className="flex gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm">{message || "Writing..."}</span>
      </div>
    );
  }

  return (
    <div className="my-3 p-4 rounded-xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50 dark:border-amber-500/50 dark:from-amber-950/40 dark:via-orange-950/30 dark:to-rose-950/30 shadow-sm">
      <div className="flex items-center gap-3">
        {/* Tool Icon */}
        <div className="flex-shrink-0 p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-md">
          {icon}
        </div>

        {/* Status Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Status Icon */}
            {status === "starting" || status === "processing" ? (
              <LoadingIcon className="w-4 h-4 animate-spin text-amber-600 dark:text-amber-400" />
            ) : status === "complete" ? (
              <CheckIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            ) : (
              <XIcon className="w-4 h-4 text-red-500" />
            )}

            {/* Status Text */}
            <span className="text-sm font-semibold text-gray-800 dark:text-gray-200">
              {status === "starting" && `DANI is preparing ${displayName}...`}
              {status === "processing" && (message || `Generating with ${displayName}...`)}
              {status === "complete" && `${displayName} complete`}
              {status === "error" && `${displayName} failed`}
            </span>
          </div>

          {/* Show args preview for starting state */}
          {status === "starting" && args && typeof args.request === 'string' && (
            <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 truncate">
              Request: {args.request.slice(0, 80)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToolCallBlock;
