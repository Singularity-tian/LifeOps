"use client";

import { useState, useEffect, useCallback } from "react";
import type { Channel } from "@/lib/types";

export function useChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchChannels = useCallback(async () => {
    try {
      const res = await fetch("/api/channels");
      if (res.ok) {
        const data = await res.json();
        setChannels(data);
      }
    } catch (e) {
      console.error("Failed to fetch channels:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  const createChannel = useCallback(
    async (
      name: string,
      description = "",
      systemPrompt = ""
    ): Promise<Channel | null> => {
      try {
        const res = await fetch("/api/channels", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            system_prompt: systemPrompt,
          }),
        });
        if (res.ok) {
          const channel = await res.json();
          setChannels((prev) => [channel, ...prev]);
          return channel;
        }
      } catch (e) {
        console.error("Failed to create channel:", e);
      }
      return null;
    },
    []
  );

  const updateChannel = useCallback(
    async (
      id: string,
      updates: Partial<Pick<Channel, "name" | "description" | "system_prompt">>
    ): Promise<Channel | null> => {
      try {
        const res = await fetch(`/api/channels/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updates),
        });
        if (res.ok) {
          const updated = await res.json();
          setChannels((prev) =>
            prev.map((c) => (c.id === id ? updated : c))
          );
          return updated;
        }
      } catch (e) {
        console.error("Failed to update channel:", e);
      }
      return null;
    },
    []
  );

  const deleteChannel = useCallback(async (id: string): Promise<boolean> => {
    try {
      const res = await fetch(`/api/channels/${id}`, { method: "DELETE" });
      if (res.ok) {
        setChannels((prev) => prev.filter((c) => c.id !== id));
        return true;
      }
    } catch (e) {
      console.error("Failed to delete channel:", e);
    }
    return false;
  }, []);

  return {
    channels,
    loading,
    createChannel,
    updateChannel,
    deleteChannel,
    refetch: fetchChannels,
  };
}
