export interface User {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
}

export interface Channel {
  id: string;
  user_id: string;
  name: string;
  description: string;
  system_prompt: string;
  memory_summary: string;
  message_count: number;
  last_summarized_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Choice {
  label: string;
  value: string;
  description?: string;
}

export interface WebSearchResult {
  title: string;
  url: string;
  page_age?: string | null;
  encrypted_content: string;
}

export interface WebFetchResult {
  url: string;
  page_title?: string;
  content_length?: number;
  encrypted_content?: string;
}

export interface StoredToolCall {
  id: string;
  name: string;
  input: unknown;
  results?: WebSearchResult[] | WebFetchResult | null;
  error?: string;
}

export interface ActiveToolUse {
  id: string;
  name: string;
  status: "running" | "complete" | "error";
  results?: WebSearchResult[] | WebFetchResult | null;
  error?: string;
}

export interface Message {
  id: string;
  channel_id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  choices: Choice[] | null;
  tool_calls: StoredToolCall[] | null;
  created_at: string;
}

export interface AIResponse {
  text: string;
  choices?: Choice[];
  toolCalls?: StoredToolCall[];
}
