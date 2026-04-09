import type { ToolUnion } from "../llm";

// Azure OpenAI GPT-5.x does not expose Anthropic's server-side web_search /
// web_fetch tools. Returning an empty list keeps the plumbing intact; plug in
// real function-calling tools here when needed.
export function getDefaultTools(): ToolUnion[] {
  return [];
}
