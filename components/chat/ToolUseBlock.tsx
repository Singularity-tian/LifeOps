"use client";

import { useState } from "react";
import type { ActiveToolUse, WebSearchResult } from "@/lib/types";

interface ToolUseBlockProps {
  tool: ActiveToolUse;
}

function getToolLabel(name: string): string {
  switch (name) {
    case "web_search":
      return "Searching the web";
    case "web_fetch":
      return "Reading page";
    default:
      return "Using tool";
  }
}

function getToolIcon(name: string): string {
  switch (name) {
    case "web_search":
      return "🔍";
    case "web_fetch":
      return "🌐";
    default:
      return "⚙️";
  }
}

function getDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url;
  }
}

export default function ToolUseBlock({ tool }: ToolUseBlockProps) {
  const [expanded, setExpanded] = useState(false);
  const isRunning = tool.status === "running";
  const isSearch = tool.name === "web_search";
  const searchResults = isSearch && Array.isArray(tool.results)
    ? (tool.results as WebSearchResult[])
    : [];
  const resultCount = searchResults.length;

  const completedLabel = isSearch
    ? `Searched ${resultCount} result${resultCount !== 1 ? "s" : ""}`
    : tool.name === "web_fetch"
      ? `Fetched page`
      : "Tool complete";

  return (
    <div className="mb-2 animate-fade-in">
      <button
        onClick={() => !isRunning && setExpanded(!expanded)}
        disabled={isRunning}
        className="flex items-center gap-2 px-3 py-1.5 text-[13px] rounded-[10px] transition-all duration-200"
        style={{
          background: "var(--bg-tertiary)",
          color: "var(--text-secondary)",
          cursor: isRunning ? "default" : "pointer",
        }}
      >
        {/* Icon */}
        <span className="text-[12px]">{getToolIcon(tool.name)}</span>

        {/* Label */}
        <span className="font-medium">
          {isRunning ? getToolLabel(tool.name) : completedLabel}
        </span>

        {/* Running indicator */}
        {isRunning && (
          <span className="flex gap-0.5">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1 h-1 rounded-full"
                style={{
                  background: "var(--text-tertiary)",
                  animation: `pulse 1.2s ease-in-out infinite ${i * 0.2}s`,
                }}
              />
            ))}
          </span>
        )}

        {/* Chevron */}
        {!isRunning && resultCount > 0 && (
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="transition-transform duration-200"
            style={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              color: "var(--text-tertiary)",
            }}
          >
            <path
              d="M3 4.5L6 7.5L9 4.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </button>

      {/* Expanded results */}
      {expanded && searchResults.length > 0 && (
        <div
          className="mt-1 ml-1 pl-3 border-l-2 space-y-1"
          style={{ borderColor: "var(--border-strong)" }}
        >
          {searchResults.map((result, i) => (
            <a
              key={i}
              href={result.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col py-1 text-[12px] transition-colors duration-150 hover:opacity-80"
            >
              <span
                className="font-medium leading-tight line-clamp-1"
                style={{ color: "var(--text-primary)" }}
              >
                {result.title}
              </span>
              <span style={{ color: "var(--text-tertiary)" }}>
                {getDomain(result.url)}
                {result.page_age && ` · ${result.page_age}`}
              </span>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
