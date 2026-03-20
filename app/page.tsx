"use client";

import { useState, useCallback, useMemo } from "react";
import { useSession } from "next-auth/react";
import { useChannels } from "@/hooks/useChannels";
import Sidebar from "@/components/layout/Sidebar";
import ChannelHeader from "@/components/layout/ChannelHeader";
import ChatContainer from "@/components/chat/ChatContainer";
import CreateChannelDialog from "@/components/channels/CreateChannelDialog";
import ChannelSettings from "@/components/channels/ChannelSettings";

export default function Home() {
  const { status } = useSession();
  const {
    channels,
    loading,
    createChannel,
    updateChannel,
    deleteChannel,
  } = useChannels();

  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const activeChannel = useMemo(
    () => channels.find((c) => c.id === activeChannelId) ?? null,
    [channels, activeChannelId]
  );

  const handleCreate = useCallback(
    async (name: string, description: string, systemPrompt: string) => {
      const channel = await createChannel(name, description, systemPrompt);
      if (channel) {
        setActiveChannelId(channel.id);
      }
    },
    [createChannel]
  );

  const handleUpdate = useCallback(
    async (
      updates: Partial<
        Pick<
          (typeof channels)[number],
          "name" | "description" | "system_prompt"
        >
      >
    ) => {
      if (activeChannelId) {
        await updateChannel(activeChannelId, updates);
      }
    },
    [activeChannelId, updateChannel]
  );

  const handleDelete = useCallback(async () => {
    if (activeChannelId) {
      const success = await deleteChannel(activeChannelId);
      if (success) {
        setActiveChannelId(null);
      }
    }
  }, [activeChannelId, deleteChannel]);

  if (status === "loading") {
    return (
      <div
        className="flex items-center justify-center h-full"
        style={{ background: "var(--bg)" }}
      >
        <div
          className="w-5 h-5 border-2 rounded-full animate-spin"
          style={{
            borderColor: "var(--text-tertiary)",
            borderTopColor: "transparent",
          }}
        />
      </div>
    );
  }

  return (
    <div className="flex h-full" style={{ background: "var(--bg)" }}>
      <Sidebar
        channels={channels}
        activeChannelId={activeChannelId}
        onSelectChannel={setActiveChannelId}
        onCreateChannel={() => setShowCreateDialog(true)}
        loading={loading}
      />

      <main
        className="flex flex-col flex-1 min-w-0"
        style={{ background: "var(--bg-primary)" }}
      >
        {activeChannel ? (
          <>
            <ChannelHeader
              channel={activeChannel}
              onOpenSettings={() => setShowSettings(true)}
            />
            <ChatContainer
              key={activeChannel.id}
              channelId={activeChannel.id}
            />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{
                background: "var(--accent-subtle)",
                color: "var(--accent)",
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <p
              className="text-[15px] font-medium"
              style={{ color: "var(--text-primary)" }}
            >
              LifeOps
            </p>
            <p
              className="text-[13.5px]"
              style={{ color: "var(--text-secondary)" }}
            >
              Select a channel or create a new one to get started
            </p>
            <button
              onClick={() => setShowCreateDialog(true)}
              className="mt-2 px-4 py-2 rounded-xl text-[13.5px] font-medium transition-all duration-200 active:scale-[0.97]"
              style={{
                background: "var(--accent)",
                color: "var(--text-on-accent)",
              }}
            >
              Create Channel
            </button>
          </div>
        )}
      </main>

      <CreateChannelDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onCreate={handleCreate}
      />

      {activeChannel && (
        <ChannelSettings
          channel={activeChannel}
          open={showSettings}
          onClose={() => setShowSettings(false)}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
