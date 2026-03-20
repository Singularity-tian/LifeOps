import { NextResponse } from "next/server";
import { ChatDB } from "@/lib/db/repository";
import { getRequiredSession, unauthorizedResponse } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET(
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
    return NextResponse.json(channel);
  } catch (e) {
    console.error("GET /api/channels/[id] error:", e);
    return NextResponse.json({ error: "Failed to fetch channel" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = new ChatDB();
    const existing = await db.getChannel(id);
    if (!existing || existing.user_id !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const body = await req.json();
    const channel = await db.updateChannel(id, {
      name: body.name?.trim(),
      description: body.description?.trim(),
      system_prompt: body.system_prompt?.trim(),
    });
    return NextResponse.json(channel);
  } catch (e) {
    console.error("PUT /api/channels/[id] error:", e);
    return NextResponse.json({ error: "Failed to update channel" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const { id } = await params;
    const db = new ChatDB();
    const existing = await db.getChannel(id);
    if (!existing || existing.user_id !== session.userId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await db.deleteChannel(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/channels/[id] error:", e);
    return NextResponse.json({ error: "Failed to delete channel" }, { status: 500 });
  }
}
