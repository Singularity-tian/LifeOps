"use client";

import { useSession, signOut } from "next-auth/react";
import type { Channel } from "@/lib/types";

interface SidebarProps {
  channels: Channel[];
  activeChannelId: string | null;
  onSelectChannel: (id: string) => void;
  onCreateChannel: () => void;
  loading?: boolean;
}

export default function Sidebar({
  channels,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  loading,
}: SidebarProps) {
  const { data: session } = useSession();

  return (
    <aside
      className="flex flex-col h-full shrink-0"
      style={{
        width: 260,
        background: "var(--bg-sidebar)",
        backdropFilter: "blur(24px) saturate(1.4)",
        WebkitBackdropFilter: "blur(24px) saturate(1.4)",
        borderRight: "1px solid var(--border)",
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-3">
        <h1
          className="text-[13px] font-semibold tracking-wide uppercase"
          style={{ color: "var(--text-secondary)", letterSpacing: "0.06em" }}
        >
          LifeOps
        </h1>
      </div>

      {/* Channel list */}
      <nav className="flex-1 overflow-y-auto px-2.5 pb-2">
        {loading ? (
          <div className="px-2.5 py-8 text-center" style={{ color: "var(--text-tertiary)" }}>
            <div className="inline-block w-4 h-4 border-2 rounded-full animate-spin" style={{ borderColor: "var(--text-tertiary)", borderTopColor: "transparent" }} />
          </div>
        ) : channels.length === 0 ? (
          <div
            className="px-2.5 py-8 text-center text-[13px]"
            style={{ color: "var(--text-tertiary)" }}
          >
            No channels yet
          </div>
        ) : (
          <div className="space-y-0.5">
            {channels.map((channel) => {
              const isActive = channel.id === activeChannelId;
              return (
                <button
                  key={channel.id}
                  onClick={() => onSelectChannel(channel.id)}
                  className="w-full text-left px-2.5 py-[7px] rounded-lg flex items-center gap-2.5 transition-all duration-200 group"
                  style={{
                    background: isActive
                      ? "var(--accent-subtle)"
                      : "transparent",
                    color: isActive
                      ? "var(--accent)"
                      : "var(--text-primary)",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "var(--bg-tertiary)";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.background = "transparent";
                    }
                  }}
                >
                  <span
                    className="text-[15px] font-medium shrink-0"
                    style={{
                      color: isActive
                        ? "var(--accent)"
                        : "var(--text-tertiary)",
                    }}
                  >
                    #
                  </span>
                  <span className="text-[13.5px] truncate font-medium">
                    {channel.name}
                  </span>
                  {channel.message_count > 0 && (
                    <span
                      className="ml-auto text-[11px] tabular-nums shrink-0"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {channel.message_count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </nav>

      {/* New channel button */}
      <div className="px-2.5 pb-1.5">
        <button
          onClick={onCreateChannel}
          className="w-full py-2 rounded-lg text-[13px] font-medium flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98]"
          style={{
            background: "var(--bg-tertiary)",
            color: "var(--text-secondary)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--accent-subtle)";
            e.currentTarget.style.color = "var(--accent)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--bg-tertiary)";
            e.currentTarget.style.color = "var(--text-secondary)";
          }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
          >
            <path d="M8 3v10M3 8h10" />
          </svg>
          New Channel
        </button>
      </div>

      {/* User profile */}
      {session?.user && (
        <div
          className="px-3 py-2.5 flex items-center gap-2.5"
          style={{ borderTop: "1px solid var(--border)" }}
        >
          {session.user.image ? (
            <img
              src={session.user.image}
              alt=""
              className="w-7 h-7 rounded-full shrink-0"
              referrerPolicy="no-referrer"
            />
          ) : (
            <div
              className="w-7 h-7 rounded-full shrink-0 flex items-center justify-center text-[11px] font-semibold"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              {session.user.name?.[0]?.toUpperCase() ?? "?"}
            </div>
          )}
          <span
            className="text-[13px] truncate flex-1"
            style={{ color: "var(--text-secondary)" }}
          >
            {session.user.name ?? session.user.email}
          </span>
          <button
            onClick={() => signOut()}
            className="shrink-0 p-1 rounded-md transition-colors duration-200"
            style={{ color: "var(--text-tertiary)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "var(--text-secondary)";
              e.currentTarget.style.background = "var(--bg-tertiary)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "var(--text-tertiary)";
              e.currentTarget.style.background = "transparent";
            }}
            title="Sign out"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 14H3a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1h3M11 11l3-3-3-3M14 8H6" />
            </svg>
          </button>
        </div>
      )}
    </aside>
  );
}
