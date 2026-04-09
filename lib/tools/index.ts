import type { ToolUnion } from "../llm";

// Server-side tools available via the Azure OpenAI Responses API.
export function getDefaultTools(): ToolUnion[] {
  return [{ type: "web_search_preview" }];
}
