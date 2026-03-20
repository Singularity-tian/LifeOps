import { generate } from "./llm";
import type { Message } from "./types";

export async function summarizeMessages(
  existingSummary: string,
  messages: Message[]
): Promise<string> {
  if (messages.length === 0) return existingSummary;

  const messagesText = messages
    .map((m) => `[${m.role}]: ${m.content}`)
    .join("\n");

  const prompt = `You are summarizing a conversation for future context.

${existingSummary ? `Previous summary:\n${existingSummary}\n\n` : ""}New messages to incorporate:
${messagesText}

Create a concise but comprehensive summary that captures:
- Key topics discussed
- Decisions made
- Action items or ongoing tasks
- Important preferences or information the user shared
- Context needed for future conversations

Keep the summary under 500 words. Focus on actionable and contextual information.`;

  return generate(
    prompt,
    "You are a precise conversation summarizer. Output only the summary, no preamble.",
    0.3
  );
}
