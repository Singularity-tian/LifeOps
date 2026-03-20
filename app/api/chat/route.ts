import { ChatDB } from "@/lib/db/repository";
import { generateStream, generateStructuredWithRetry } from "@/lib/llm";
import { buildChannelSystemPrompt } from "@/lib/prompts";
import { summarizeMessages } from "@/lib/memory";
import {
  RECENT_MESSAGE_COUNT,
  SUMMARY_TRIGGER_THRESHOLD,
} from "@/lib/constants";
import type { Choice } from "@/lib/types";
import { z } from "zod/v4";
import { getRequiredSession } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

const ChoicesSchema = z.object({
  choices: z.array(
    z.object({
      label: z.string(),
      value: z.string(),
      description: z.string().optional(),
    })
  ),
});

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

    const apiMessages = recentMessages.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    }));

    // Stream the response in real-time, then extract choices after
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullText = "";
          const messageStream = await generateStream(
            apiMessages,
            systemPrompt
          );

          // Stream text deltas as they arrive
          for await (const event of messageStream) {
            if (
              event.type === "content_block_delta" &&
              event.delta.type === "text_delta"
            ) {
              const text = event.delta.text;
              fullText += text;
              controller.enqueue(
                encoder.encode(
                  `data: ${JSON.stringify({ type: "delta", text })}\n\n`
                )
              );
            }
          }

          // Signal that text streaming is done (cursor can hide)
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "text_done" })}\n\n`
            )
          );

          // Extract choices from the completed response
          let choices: Choice[] | undefined;
          try {
            const result = await generateStructuredWithRetry(
              `Given this AI assistant response, extract 2-6 relevant next-step choices the user could pick. Each choice should be a natural continuation of the conversation. If the response is purely informational with no clear next steps, return an empty choices array. Always include a "Something else" option.\n\nAI Response:\n${fullText}`,
              ChoicesSchema,
              0.1
            );
            choices = result.choices.length > 0 ? result.choices : undefined;
          } catch {
            // No choices is fine
          }

          // Save assistant message to DB
          await db.createMessage(channelId, userId, "assistant", fullText, choices);

          // Send choices event
          if (choices?.length) {
            controller.enqueue(
              encoder.encode(
                `data: ${JSON.stringify({ type: "choices", choices })}\n\n`
              )
            );
          }

          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ type: "done" })}\n\n`)
          );
          controller.close();

          // Async: check if summarization is needed
          maybeTriggerSummarization(channelId, db).catch(console.error);
        } catch (e) {
          console.error("Chat stream error:", e);
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ type: "error", message: "Stream failed" })}\n\n`
            )
          );
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
