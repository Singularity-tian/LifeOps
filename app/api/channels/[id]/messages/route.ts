import { NextResponse } from "next/server";
import { ChatDB } from "@/lib/db/repository";
import { getRequiredSession, unauthorizedResponse } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = new ChatDB();

    // Verify ownership
    const channel = await db.getChannel(id);
    if (!channel || channel.user_id !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") ?? "50", 10);
    const before = url.searchParams.get("before") ?? undefined;

    const messages = await db.getMessages(id, limit, before);
    return NextResponse.json(messages);
  } catch (e) {
    console.error("GET /api/channels/[id]/messages error:", e);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
