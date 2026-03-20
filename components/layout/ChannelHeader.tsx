"use client";

import type { Channel } from "@/lib/types";

interface ChannelHeaderProps {
  channel: Channel | null;
  onOpenSettings: () => void;
}

export default function ChannelHeader({
  channel,
  onOpenSettings,
}: ChannelHeaderProps) {
  if (!channel) return null;

  return (
    <header
      className="flex items-center justify-between px-5 py-3 shrink-0"
      style={{ borderBottom: "1px solid var(--border)" }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <span
          className="text-[15px] font-medium shrink-0"
          style={{ color: "var(--text-tertiary)" }}
        >
          #
        </span>
        <h2 className="text-[14.5px] font-semibold truncate">
          {channel.name}
        </h2>
        {channel.description && (
          <>
            <span
              className="shrink-0 mx-1 h-3.5 w-px"
              style={{ background: "var(--border-strong)" }}
            />
            <span
              className="text-[13px] truncate"
              style={{ color: "var(--text-secondary)" }}
            >
              {channel.description}
            </span>
          </>
        )}
      </div>
      <button
        onClick={onOpenSettings}
        className="shrink-0 p-1.5 rounded-md transition-all duration-200 active:scale-95"
        style={{ color: "var(--text-tertiary)" }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "var(--bg-tertiary)";
          e.currentTarget.style.color = "var(--text-secondary)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "var(--text-tertiary)";
        }}
        title="Channel settings"
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="8" cy="8" r="1.5" />
          <path d="M6.8 2.4l-.3 1.1a.9.9 0 01-.5.5l-.1.1a.9.9 0 01-.7 0l-1-.5-.8.8.5 1a.9.9 0 010 .7v.1a.9.9 0 01-.5.5l-1.1.3v1.2l1.1.3a.9.9 0 01.5.5v.1a.9.9 0 010 .7l-.5 1 .8.8 1-.5a.9.9 0 01.7 0h.1a.9.9 0 01.5.5l.3 1.1h1.2l.3-1.1a.9.9 0 01.5-.5h.1a.9.9 0 01.7 0l1 .5.8-.8-.5-1a.9.9 0 010-.7v-.1a.9.9 0 01.5-.5l1.1-.3V7.2l-1.1-.3a.9.9 0 01-.5-.5v-.1a.9.9 0 010-.7l.5-1-.8-.8-1 .5a.9.9 0 01-.7 0h-.1a.9.9 0 01-.5-.5l-.3-1.1z" />
        </svg>
      </button>
    </header>
  );
}
