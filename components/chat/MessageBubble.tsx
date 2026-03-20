"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Message, Choice } from "@/lib/types";
import ChoiceCards from "./ChoiceCards";
import ToolUseBlock from "./ToolUseBlock";

interface MessageBubbleProps {
  message: Message;
  onChoiceSelect?: (choice: Choice) => void;
  selectedChoice?: string | null;
  isLatestAssistant?: boolean;
  skipAnimation?: boolean;
}

export default function MessageBubble({
  message,
  onChoiceSelect,
  selectedChoice,
  isLatestAssistant,
  skipAnimation,
}: MessageBubbleProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={`flex ${isUser ? "justify-end" : "justify-start"} ${skipAnimation ? "" : "animate-fade-in"}`}
    >
      <div
        className={`max-w-[75%] ${isUser ? "min-w-[48px]" : "min-w-[64px]"}`}
      >
        {/* Tool use blocks for assistant messages */}
        {!isUser && message.tool_calls?.map((tc) => (
          <ToolUseBlock
            key={tc.id}
            tool={{
              id: tc.id,
              name: tc.name,
              status: "complete",
              results: tc.results,
            }}
          />
        ))}

        {/* Bubble */}
        <div
          className={`px-3.5 py-2.5 ${isUser ? "rounded-[18px] rounded-br-[6px]" : "rounded-[18px] rounded-bl-[6px]"}`}
          style={{
            background: isUser
              ? "var(--bg-bubble-user)"
              : "var(--bg-bubble-ai)",
            color: isUser
              ? "var(--text-bubble-user)"
              : "var(--text-bubble-ai)",
          }}
        >
          <div
            className={`prose-chat ${isUser ? "prose-chat-user" : ""}`}
          >
            <Markdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </Markdown>
          </div>
        </div>

        {/* Choice cards below assistant messages */}
        {!isUser && message.choices && message.choices.length > 0 && (
          <ChoiceCards
            choices={message.choices}
            onSelect={onChoiceSelect ?? (() => {})}
            selectedValue={selectedChoice}
            disabled={!isLatestAssistant}
          />
        )}
      </div>
    </div>
  );
}
