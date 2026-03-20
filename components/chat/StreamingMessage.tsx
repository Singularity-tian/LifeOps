"use client";

import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Choice } from "@/lib/types";
import ChoiceCards from "./ChoiceCards";

interface StreamingMessageProps {
  text: string;
  choices: Choice[] | null;
  isStreaming: boolean;
  onChoiceSelect: (choice: Choice) => void;
}

export default function StreamingMessage({
  text,
  choices,
  isStreaming,
  onChoiceSelect,
}: StreamingMessageProps) {
  if (!text && !isStreaming) return null;

  return (
    <div className="flex justify-start animate-fade-in">
      <div className="max-w-[75%] min-w-[64px]">
        <div
          className="px-3.5 py-2.5 rounded-[18px] rounded-bl-[6px]"
          style={{
            background: "var(--bg-bubble-ai)",
            color: "var(--text-bubble-ai)",
          }}
        >
          <div className="prose-chat">
            {text ? (
              <Markdown remarkPlugins={[remarkGfm]}>{text}</Markdown>
            ) : (
              <div className="flex items-center gap-1 py-1">
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "var(--text-tertiary)",
                    animation: "pulse 1.2s ease-in-out infinite",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "var(--text-tertiary)",
                    animation: "pulse 1.2s ease-in-out infinite 0.2s",
                  }}
                />
                <span
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: "var(--text-tertiary)",
                    animation: "pulse 1.2s ease-in-out infinite 0.4s",
                  }}
                />
              </div>
            )}
            {text && isStreaming && (
              <span
                className="inline-block w-[2px] h-[14px] ml-0.5 align-text-bottom"
                style={{
                  background: "var(--accent)",
                  animation: "blink 0.8s ease-in-out infinite",
                }}
              />
            )}
          </div>
        </div>

        {/* Choices appear once streaming is done */}
        {!isStreaming && choices && choices.length > 0 && (
          <ChoiceCards
            choices={choices}
            onSelect={onChoiceSelect}
          />
        )}
      </div>
    </div>
  );
}
