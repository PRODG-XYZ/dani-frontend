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

  return (
    <div className="my-3 p-4 rounded-lg border border-blue-200 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/30">
      <div className="flex items-center gap-3">
        {/* Tool Icon */}
        <div className="flex-shrink-0 p-2 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
          {icon}
        </div>

        {/* Status Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {/* Status Icon */}
            {status === "starting" || status === "processing" ? (
              <LoadingIcon className="w-4 h-4 animate-spin text-blue-500" />
            ) : status === "complete" ? (
              <CheckIcon className="w-4 h-4 text-green-500" />
            ) : (
              <XIcon className="w-4 h-4 text-red-500" />
            )}

            {/* Status Text */}
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {status === "starting" && `DANI is preparing ${displayName}...`}
              {status === "processing" && (message || `Generating with ${displayName}...`)}
              {status === "complete" && `${displayName} complete`}
              {status === "error" && `${displayName} failed`}
            </span>
          </div>

          {/* Show args preview for starting state */}
          {status === "starting" && args && typeof args.request === 'string' && (
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400 truncate">
              Request: {args.request.slice(0, 80)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ToolCallBlock;
