import type { ToolUnion } from "../llm";

export function getDefaultTools(): ToolUnion[] {
  return [
    { type: "web_search_20250305", name: "web_search" },
    { type: "web_fetch_20250910", name: "web_fetch" },
  ];
}
