import { NextResponse } from "next/server";
import { ChatDB } from "@/lib/db/repository";
import { getRequiredSession, unauthorizedResponse } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const db = new ChatDB();
    const channels = await db.getAllChannels(session.userId);
    return NextResponse.json(channels);
  } catch (e) {
    console.error("GET /api/channels error:", e);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getRequiredSession();
  if (!session) return unauthorizedResponse();

  try {
    const { name, description, system_prompt } = await req.json();
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "name is required" },
        { status: 400 }
      );
    }
    const db = new ChatDB();
    const channel = await db.createChannel(
      session.userId,
      name.trim(),
      description?.trim() ?? "",
      system_prompt?.trim() ?? ""
    );
    return NextResponse.json(channel, { status: 201 });
  } catch (e) {
    console.error("POST /api/channels error:", e);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}
