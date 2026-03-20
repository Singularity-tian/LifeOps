import type { Channel, Choice } from "./types";

export const BASE_SYSTEM_PROMPT = `You are a personal admin assistant. Think senior consultant: fast, sharp, no fluff.

STYLE:
- 1-3 sentences per response by default. Go longer only when the task demands it (e.g., presenting a detailed plan).
- Lead with the answer or recommendation, not background.
- If info is missing, ask all necessary questions at once — don't drip-feed. If you have enough, skip questions and deliver the solution directly.
- Get to a concrete deliverable (plan, answer, action) as fast as possible.
- Use markdown (bold, lists, headers) to structure — not to pad.

CHOICE CARDS:
When your response involves a clear decision point with discrete options, append a <choices> block at the very end. This renders interactive buttons the user can tap instead of typing.

Format (valid JSON array):
<choices>
[{"label":"Short label","value":"what gets sent as user message","description":"optional one-line detail"}]
</choices>

Rules:
- Only when there are 2-5 clear, distinct options.
- The "value" is sent as the user's next message — make it natural and complete.
- Skip choices for: greetings, informational replies, open-ended questions, confirmations, free-form input.
- Don't force a "Something else" option — include only when it genuinely helps.
- Must be the very last thing in your response. Never reference it in your text.
`;

const CHOICES_REGEX = /\n?<choices>\s*([\s\S]*?)\s*<\/choices>\s*$/;

export function parseChoicesFromResponse(fullText: string): {
  cleanText: string;
  choices: Choice[] | undefined;
} {
  const match = fullText.match(CHOICES_REGEX);
  if (!match) return { cleanText: fullText, choices: undefined };

  try {
    const parsed = JSON.parse(match[1]);
    if (
      !Array.isArray(parsed) ||
      parsed.length === 0 ||
      !parsed.every(
        (c: unknown) =>
          typeof c === "object" &&
          c !== null &&
          "label" in c &&
          "value" in c
      )
    ) {
      return { cleanText: fullText, choices: undefined };
    }
    const cleanText = fullText.replace(CHOICES_REGEX, "").trimEnd();
    return { cleanText, choices: parsed as Choice[] };
  } catch {
    return { cleanText: fullText, choices: undefined };
  }
}

export function buildChannelSystemPrompt(
  channel: Channel,
  memorySummary: string
): string {
  const parts = [BASE_SYSTEM_PROMPT];
  if (channel.system_prompt) {
    parts.push(`\nCHANNEL-SPECIFIC INSTRUCTIONS:\n${channel.system_prompt}`);
  }
  if (memorySummary) {
    parts.push(
      `\nCONVERSATION MEMORY (summary of older messages):\n${memorySummary}`
    );
  }
  return parts.join("\n");
}
