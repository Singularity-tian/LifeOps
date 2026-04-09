import OpenAI from "openai";
import { z } from "zod/v4";

// Re-export types so callers (route handlers, tools/history.ts) stay decoupled
// from the underlying SDK surface.
export type MessageParam = OpenAI.Chat.ChatCompletionMessageParam;
export type ToolUnion = OpenAI.Responses.Tool;

let _client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!_client) {
    _client = new OpenAI({
      apiKey: process.env.AZURE_API_KEY,
      baseURL: process.env.AZURE_BASE_URL!,
    });
  }
  return _client;
}

const DEFAULT_MODEL = "gpt-5.4";

/** Generate a free-form text response. */
export async function generate(
  prompt: string,
  systemPrompt = "",
  _temperature = 0.7,
  model = DEFAULT_MODEL
): Promise<string> {
  const messages: MessageParam[] = [];
  if (systemPrompt) messages.push({ role: "system", content: systemPrompt });
  messages.push({ role: "user", content: prompt });

  const resp = await getClient().chat.completions.create({
    model,
    max_completion_tokens: 4096,
    messages,
  });
  return resp.choices[0]?.message?.content ?? "";
}

/** Generate a structured JSON response validated against a Zod schema. */
export async function generateStructured<T>(
  prompt: string,
  schema: z.ZodType<T>,
  _temperature = 0.1,
  model = DEFAULT_MODEL,
  systemPrompt = ""
): Promise<T> {
  const jsonInstruction =
    "\n\nRespond with ONLY valid JSON that matches the requested schema. No markdown, no explanation.";

  const resp = await getClient().chat.completions.create({
    model,
    max_completion_tokens: 2048,
    messages: [
      {
        role: "system",
        content:
          (systemPrompt || "You are a precise JSON-generating assistant.") +
          jsonInstruction,
      },
      { role: "user", content: prompt },
    ],
  });

  const raw = resp.choices[0]?.message?.content ?? "{}";
  const cleaned = raw
    .replace(/^```(?:json)?\n?/, "")
    .replace(/\n?```$/, "")
    .trim();

  const parsed = JSON.parse(cleaned);
  return schema.parse(parsed);
}

/** Retry wrapper — retries up to 3 times on failure. */
export async function generateStructuredWithRetry<T>(
  prompt: string,
  schema: z.ZodType<T>,
  temperature = 0.1,
  model = DEFAULT_MODEL,
  systemPrompt = ""
): Promise<T> {
  let lastError: unknown;
  for (let i = 0; i < 3; i++) {
    try {
      return await generateStructured(
        prompt,
        schema,
        temperature,
        model,
        systemPrompt
      );
    } catch (e) {
      lastError = e;
      if (i < 2) await sleep(1000 * (i + 1));
    }
  }
  throw lastError;
}

/**
 * Stream a chat response via the Responses API (required for server-side
 * tools like web_search_preview). Yields plain text deltas.
 */
export async function* generateStream(
  messages: MessageParam[],
  systemPrompt: string,
  options?: {
    tools?: ToolUnion[];
    temperature?: number;
    model?: string;
  }
): AsyncGenerator<string, void, unknown> {
  const model = options?.model ?? DEFAULT_MODEL;
  const tools = options?.tools;
  const hasTools = tools && tools.length > 0;

  // Responses API accepts { role, content } items where content is a string.
  const input = messages
    .filter((m) => m.role === "user" || m.role === "assistant")
    .map((m) => ({
      role: m.role as "user" | "assistant",
      content: typeof m.content === "string" ? m.content : "",
    }));

  const stream = await getClient().responses.create({
    model,
    instructions: systemPrompt || undefined,
    input,
    max_output_tokens: hasTools ? 8192 : 4096,
    stream: true,
    ...(hasTools ? { tools } : {}),
  });

  for await (const event of stream) {
    if (event.type === "response.output_text.delta") {
      yield event.delta;
    }
  }
}

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}
