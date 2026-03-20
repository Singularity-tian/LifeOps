"use client";

import { useState, useCallback } from "react";
import type { Choice } from "@/lib/types";

export function useChat(channelId: string | null) {
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  const [streamingChoices, setStreamingChoices] = useState<Choice[] | null>(
    null
  );

  const clearStreaming = useCallback(() => {
    setStreamingText("");
    setStreamingChoices(null);
  }, []);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!channelId || isStreaming) return;

      setIsStreaming(true);
      setStreamingText("");
      setStreamingChoices(null);

      try {
        const response = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channelId, content }),
        });

        if (!response.ok || !response.body) {
          throw new Error("Chat request failed");
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let finalText = "";
        let choices: Choice[] | null = null;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data: ")) continue;

            try {
              const data = JSON.parse(trimmed.slice(6));

              switch (data.type) {
                case "delta":
                  finalText += data.text;
                  setStreamingText(finalText);
                  break;
                case "text_done":
                  if (data.finalText) {
                    finalText = data.finalText;
                    setStreamingText(data.finalText);
                  }
                  setIsStreaming(false);
                  break;
                case "choices":
                  choices = data.choices;
                  setStreamingChoices(data.choices);
                  break;
                case "done":
                  break;
                case "error":
                  console.error("Stream error:", data.message);
                  setIsStreaming(false);
                  break;
              }
            } catch {
              // Skip malformed SSE events
            }
          }
        }

        return { text: finalText, choices };
      } catch (e) {
        console.error("Chat error:", e);
        setIsStreaming(false);
        return null;
      }
    },
    [channelId, isStreaming]
  );

  return {
    sendMessage,
    isStreaming,
    streamingText,
    streamingChoices,
    clearStreaming,
  };
}
