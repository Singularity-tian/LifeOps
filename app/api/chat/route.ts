import { ChatDB } from "@/lib/db/repository";
import { generateStream } from "@/lib/llm";
import { buildChannelSystemPrompt, parseChoicesFromResponse } from "@/lib/prompts";
import { summarizeMessages } from "@/lib/memory";
import {
  RECENT_MESSAGE_COUNT,
  SUMMARY_TRIGGER_THRESHOLD,
} from "@/lib/constants";
import { getRequiredSession } from "@/lib/auth-utils";
import { getDefaultTools } from "@/lib/tools";
import { buildApiMessages } from "@/lib/tools/history";
import type { StoredToolCall, WebSearchResult } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const session = await getRequiredSession();
  if (!session) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const userId = session.userId;

  try {
    const { channelId, content } = await req.json();
    if (!channelId || !content) {
      return new Response(
        JSON.stringify({ error: "channelId and content are required" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    const db = new ChatDB();

    // Verify ownership
    const channel = await db.getChannel(channelId);
    if (!channel || channel.user_id !== userId) {
      return new Response(JSON.stringify({ error: "Channel not found" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Save user message
    await db.createMessage(channelId, userId, "user", content);

    const recentMessages = await db.getRecentMessages(
      channelId,
      RECENT_MESSAGE_COUNT
    );

    const systemPrompt = buildChannelSystemPrompt(
      channel,
      channel.memory_summary
    );

    const apiMessages = buildApiMessages(recentMessages);

    // Stream the response in real-time
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const sendSSE = (data: unknown) => {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
          );
        };

        try {
          let fullText = "";
          const toolCalls: StoredToolCall[] = [];
          let currentToolUse: Partial<StoredToolCall> | null = null;

          const messageStream = await generateStream(
            apiMessages,
            systemPrompt,
            { tools: getDefaultTools() }
          );

          for await (const event of messageStream) {
            switch (event.type) {
              case "content_block_start": {
                const block = event.content_block;

                // Server tool invocation (web_search, web_fetch)
                if (block.type === "server_tool_use") {
                  currentToolUse = {
                    id: block.id,
                    name: block.name,
                    input: block.input,
                  };
                  sendSSE({
                    type: "tool_use_start",
                    name: block.name,
                    id: block.id,
                  });
                }

                // Web search results
                if (block.type === "web_search_tool_result") {
                  const results: WebSearchResult[] = Array.isArray(block.content)
                    ? block.content
                        .filter((r): r is { type: "web_search_result"; title: string; url: string; page_age: string | null; encrypted_content: string } =>
                          r.type === "web_search_result"
                        )
                        .map((r) => ({
                          title: r.title,
                          url: r.url,
                          page_age: r.page_age,
                          encrypted_content: r.encrypted_content,
                        }))
                    : [];

                  if (currentToolUse) {
                    currentToolUse.results = results;
                    toolCalls.push(currentToolUse as StoredToolCall);
                    currentToolUse = null;
                  }

                  // Send results to frontend (without encrypted_content)
                  sendSSE({
                    type: "tool_result",
                    tool_use_id: block.tool_use_id,
                    name: "web_search",
                    results: results.map((r) => ({
                      title: r.title,
                      url: r.url,
                      page_age: r.page_age,
                    })),
                  });
                }

                // Web fetch results
                if (block.type === "web_fetch_tool_result") {
                  const fetchContent = block.content;
                  const isError = fetchContent.type === "web_fetch_tool_result_error";

                  if (currentToolUse) {
                    if (isError) {
                      currentToolUse.error = fetchContent.error_code;
                    } else {
                      currentToolUse.results = {
                        url: fetchContent.url,
                        page_title: fetchContent.url,
                      };
                    }
                    toolCalls.push(currentToolUse as StoredToolCall);
                    currentToolUse = null;
                  }

                  sendSSE({
                    type: "tool_result",
                    tool_use_id: block.tool_use_id,
                    name: "web_fetch",
                    results: isError
                      ? { error: fetchContent.error_code }
                      : { url: fetchContent.url },
                  });
                }
                break;
              }

              case "content_block_delta": {
                if (event.delta.type === "text_delta") {
                  fullText += event.delta.text;
                  sendSSE({ type: "delta", text: event.delta.text });
                }
                break;
              }
            }
          }

          // Parse inline choices from the response
          const { cleanText, choices } = parseChoicesFromResponse(fullText);

          // Signal that text streaming is done
          sendSSE({ type: "text_done", finalText: cleanText });

          // Save assistant message to DB (with tool calls)
          await db.createMessage(
            channelId,
            userId,
            "assistant",
            cleanText,
            choices,
            toolCalls.length > 0 ? toolCalls : undefined
          );

          // Send tool_calls to frontend for persisted message
          if (toolCalls.length > 0) {
            // Strip encrypted_content before sending to client
            const clientToolCalls = toolCalls.map((tc) => ({
              ...tc,
              results: Array.isArray(tc.results)
                ? tc.results.map((r) => {
                    const { encrypted_content: _, ...rest } = r as WebSearchResult;
                    return rest;
                  })
                : tc.results,
            }));
            sendSSE({ type: "tool_calls", toolCalls: clientToolCalls });
          }

          // Send choices event
          if (choices?.length) {
            sendSSE({ type: "choices", choices });
          }

          sendSSE({ type: "done" });
          controller.close();

          // Async: check if summarization is needed
          maybeTriggerSummarization(channelId, db).catch(console.error);
        } catch (e) {
          console.error("Chat stream error:", e);
          sendSSE({ type: "error", message: "Stream failed" });
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (e) {
    console.error("POST /api/chat error:", e);
    return new Response(JSON.stringify({ error: "Chat failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

async function maybeTriggerSummarization(channelId: string, db: ChatDB) {
  const channel = await db.getChannel(channelId);
  if (!channel) return;

  const countSince = await db.getMessageCountSince(
    channelId,
    channel.last_summarized_at
  );

  if (countSince > SUMMARY_TRIGGER_THRESHOLD + RECENT_MESSAGE_COUNT) {
    const messagesToSummarize = await db.getMessagesForSummarization(
      channelId,
      RECENT_MESSAGE_COUNT
    );

    if (messagesToSummarize.length > 0) {
      const newSummary = await summarizeMessages(
        channel.memory_summary,
        messagesToSummarize
      );
      await db.updateMemorySummary(channelId, newSummary);
    }
  }
}
