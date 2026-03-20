"use client";

import { useCallback, useState, useEffect } from "react";
import { useMessages } from "@/hooks/useMessages";
import { useChat } from "@/hooks/useChat";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";
import type { Choice, Message } from "@/lib/types";
import MessageBubble from "./MessageBubble";
import StreamingMessage from "./StreamingMessage";
import ChatInput from "./ChatInput";

interface ChatContainerProps {
  channelId: string;
}

export default function ChatContainer({ channelId }: ChatContainerProps) {
  const {
    messages,
    loading,
    addMessage,
  } = useMessages(channelId);

  const {
    sendMessage,
    isStreaming,
    streamingText,
    streamingChoices,
    clearStreaming,
  } = useChat(channelId);

  const { containerRef, scrollToBottom } = useScrollToBottom([
    messages.length,
    streamingText,
  ]);

  // Track selected choices per message
  const [selectedChoices, setSelectedChoices] = useState<
    Record<string, string>
  >({});

  // Reset selected choices when channel changes
  useEffect(() => {
    setSelectedChoices({});
  }, [channelId]);

  const handleSend = useCallback(
    async (content: string) => {
      // Add optimistic user message
      const userMsg: Message = {
        id: `temp-${Date.now()}`,
        channel_id: channelId,
        user_id: "",
        role: "user",
        content,
        choices: null,
        created_at: new Date().toISOString(),
      };
      addMessage(userMsg);
      scrollToBottom(true);

      const result = await sendMessage(content);

      if (result) {
        // Add persisted assistant message, then clear streaming
        const assistantMsg: Message = {
          id: `assistant-${Date.now()}`,
          channel_id: channelId,
          user_id: "",
          role: "assistant",
          content: result.text,
          choices: result.choices ?? null,
          created_at: new Date().toISOString(),
        };
        addMessage(assistantMsg);
      }
      clearStreaming();
    },
    [channelId, addMessage, sendMessage, clearStreaming, scrollToBottom]
  );

  const handleChoiceSelect = useCallback(
    (messageId: string) => (choice: Choice) => {
      setSelectedChoices((prev) => ({
        ...prev,
        [messageId]: choice.value,
      }));
      handleSend(choice.value);
    },
    [handleSend]
  );

  const handleStreamingChoiceSelect = useCallback(
    (choice: Choice) => {
      handleSend(choice.value);
    },
    [handleSend]
  );

  // Find the latest assistant message for enabling choice selection
  const latestAssistantIdx = [...messages]
    .reverse()
    .findIndex((m) => m.role === "assistant");
  const latestAssistantId =
    latestAssistantIdx >= 0
      ? messages[messages.length - 1 - latestAssistantIdx]?.id
      : null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      {/* Messages area */}
      <div
        ref={containerRef}
        className="flex-1 overflow-y-auto px-5 py-4"
      >
        {loading ? (
          <div
            className="flex items-center justify-center h-full"
            style={{ color: "var(--text-tertiary)" }}
          >
            <div
              className="w-5 h-5 border-2 rounded-full animate-spin"
              style={{
                borderColor: "var(--text-tertiary)",
                borderTopColor: "transparent",
              }}
            />
          </div>
        ) : messages.length === 0 && !isStreaming && !streamingText ? (
          <div className="flex flex-col items-center justify-center h-full gap-2">
            <div
              className="text-[32px] font-light"
              style={{ color: "var(--text-tertiary)" }}
            >
              #
            </div>
            <p
              className="text-[13.5px]"
              style={{ color: "var(--text-tertiary)" }}
            >
              Start a conversation
            </p>
          </div>
        ) : (
          <div className="space-y-3 max-w-3xl mx-auto">
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                onChoiceSelect={handleChoiceSelect(msg.id)}
                selectedChoice={selectedChoices[msg.id] ?? null}
                isLatestAssistant={
                  msg.id === latestAssistantId && !isStreaming
                }
              />
            ))}

            {/* Streaming message — stays visible until clearStreaming() */}
            {(isStreaming || streamingText) && (
              <StreamingMessage
                text={streamingText}
                choices={streamingChoices}
                isStreaming={isStreaming}
                onChoiceSelect={handleStreamingChoiceSelect}
              />
            )}
          </div>
        )}
      </div>

      {/* Input */}
      <div className="max-w-3xl mx-auto w-full">
        <ChatInput onSend={handleSend} disabled={isStreaming} />
      </div>
    </div>
  );
}
