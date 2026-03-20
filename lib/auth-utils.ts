import { auth } from "@/auth";
import { NextResponse } from "next/server";

export interface AuthSession {
  userId: string;
  user: { id: string; name?: string | null; email?: string | null; image?: string | null };
}

export async function getRequiredSession(): Promise<AuthSession | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return { userId: session.user.id, user: session.user as AuthSession["user"] };
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
