"use client";

import React from "react";
import { CopyIcon, ChevronDownIcon } from "@/components/ui/Icons";
import { ToolResultData } from "@/services/api";

type ToolName = "infographic_generator" | "content_writer";

interface ToolResultBlockProps {
  toolName: ToolName;
  data: ToolResultData;
}

// Download icon SVG
const DownloadIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

// Chevron up icon
const ChevronUpIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
  </svg>
);

// Check icon
const CheckIcon = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

/**
 * ToolResultBlock - Displays the result of a tool execution
 * 
 * For infographic_generator: Shows structured data + image
 * For content_writer: Shows formatted content
 */
export function ToolResultBlock({ toolName, data }: ToolResultBlockProps) {
  const [isExpanded, setIsExpanded] = React.useState(true);
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async (text: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Render infographic result
  if (toolName === "infographic_generator" && data.structured_data) {
    const { headline, subtitle, stats, key_points } = data.structured_data;

    return (
      <div className="my-3 rounded-lg border border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 dark:border-purple-900 dark:from-purple-950/30 dark:to-pink-950/30 overflow-hidden">
        {/* Header */}
        <div 
          className="p-4 cursor-pointer flex items-center justify-between hover:bg-purple-100/50 dark:hover:bg-purple-900/20 transition-colors"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div>
            <h3 className="text-lg font-bold text-purple-900 dark:text-purple-100">
              {headline}
            </h3>
            {subtitle && (
              <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          {isExpanded ? (
            <ChevronUpIcon className="w-5 h-5 text-purple-500" />
          ) : (
            <ChevronDownIcon className="w-5 h-5 text-purple-500" />
          )}
        </div>

        {/* Expandable content */}
        {isExpanded && (
          <div className="px-4 pb-4 space-y-4">
            {/* Stats Grid */}
            {stats && stats.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {stats.map((stat, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-white/60 dark:bg-gray-900/40 border border-purple-100 dark:border-purple-800"
                  >
                    <div className="text-2xl mb-1">{stat.icon || "📊"}</div>
                    <div className="text-xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Key Points */}
            {key_points && key_points.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-semibold text-purple-800 dark:text-purple-200">
                  Key Insights
                </h4>
                <ul className="space-y-1">
                  {key_points.map((point, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300"
                    >
                      <span className="text-purple-500 mt-1">•</span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Image (if available) */}
            {data.image && (
              <div className="mt-4">
                <img
                  src={data.image.startsWith("data:") ? data.image : `data:image/png;base64,${data.image}`}
                  alt="Generated Infographic"
                  className="w-full max-w-2xl rounded-lg shadow-lg mx-auto"
                />
                <div className="flex justify-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      const link = document.createElement("a");
                      link.href = data.image!.startsWith("data:") 
                        ? data.image! 
                        : `data:image/png;base64,${data.image}`;
                      link.download = "infographic.png";
                      link.click();
                    }}
                    className="inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                  >
                    <DownloadIcon className="w-3 h-3" />
                    Download
                  </button>
                </div>
              </div>
            )}

            {/* Timing */}
            {data.timing_ms && (
              <p className="text-xs text-gray-500 dark:text-gray-500">
                Generated in {(data.timing_ms / 1000).toFixed(1)}s
              </p>
            )}
          </div>
        )}
      </div>
    );
  }

  // Render content writer result
  if (toolName === "content_writer" && data.content) {
    return (
      <div className="my-3 rounded-lg border border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/30 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
          <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
            {data.content_type === "linkedin_post" ? "LinkedIn Post" :
             data.content_type === "email" ? "Email Draft" :
             data.content_type === "tweet_thread" ? "Tweet Thread" :
             "Generated Content"}
          </span>
          <button
            onClick={() => handleCopy(data.content!)}
            className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200 dark:hover:bg-emerald-800/50 transition-colors"
          >
            {copied ? (
              <>
                <CheckIcon className="w-3 h-3" />
                Copied!
              </>
            ) : (
              <>
                <CopyIcon className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="prose prose-sm dark:prose-invert max-w-none whitespace-pre-wrap">
            {data.content}
          </div>
        </div>

        {/* Timing */}
        {data.timing_ms && (
          <div className="px-4 pb-3">
            <p className="text-xs text-gray-500 dark:text-gray-500">
              Generated in {(data.timing_ms / 1000).toFixed(1)}s
            </p>
          </div>
        )}
      </div>
    );
  }

  // Fallback for unknown tool results
  return (
    <div className="my-3 p-4 rounded-lg border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
      <pre className="text-xs overflow-auto">
        {JSON.stringify(data, null, 2)}
      </pre>
    </div>
  );
}

export default ToolResultBlock;
