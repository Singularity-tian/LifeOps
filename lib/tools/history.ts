import type { MessageParam } from "../llm";
import type { Message } from "../types";

/**
 * Build API-compatible messages from stored message history.
 *
 * Messages with tool_calls are sent as plain text — the AI's response
 * already incorporates information from tool results, so conversation
 * context is preserved without reconstructing content blocks.
 */
export function buildApiMessages(messages: Message[]): MessageParam[] {
  return messages.map((m) => ({
    role: m.role as "user" | "assistant",
    content: m.content,
  }));
}
