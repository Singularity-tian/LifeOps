import { NextResponse } from "next/server";
import { ChatDB } from "@/lib/db/repository";
import { summarizeMessages } from "@/lib/memory";
import { RECENT_MESSAGE_COUNT } from "@/lib/constants";
import { getRequiredSession, unauthorizedResponse } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = new ChatDB();
    const channel = await db.getChannel(id);
    if (!channel || channel.user_id !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const messagesToSummarize = await db.getMessagesForSummarization(
      id,
      RECENT_MESSAGE_COUNT
    );

    if (messagesToSummarize.length === 0) {
      return NextResponse.json({ summary: channel.memory_summary });
    }

    const newSummary = await summarizeMessages(
      channel.memory_summary,
      messagesToSummarize
    );
    await db.updateMemorySummary(id, newSummary);

    return NextResponse.json({ summary: newSummary });
  } catch (e) {
    console.error("POST /api/channels/[id]/summarize error:", e);
    return NextResponse.json(
      { error: "Failed to summarize" },
      { status: 500 }
    );
  }
}
