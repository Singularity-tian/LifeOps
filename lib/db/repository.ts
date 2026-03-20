import { getDb } from "./client";
import type { Channel, Choice, Message, StoredToolCall, User } from "../types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function first(rows: any): any {
  return Array.isArray(rows) ? rows[0] : undefined;
}

export class ChatDB {
  private sql = getDb();

  // ── Users ─────────────────────────────────────────────────

  async getUserByEmail(email: string): Promise<User | null> {
    const rows = await this.sql`
      SELECT * FROM users WHERE email = ${email}
    `;
    return (first(rows) as User) ?? null;
  }

  // ── Channels ──────────────────────────────────────────────

  async getAllChannels(userId: string): Promise<Channel[]> {
    const rows = await this.sql`
      SELECT * FROM channels WHERE user_id = ${userId} ORDER BY updated_at DESC
    `;
    return rows as unknown as Channel[];
  }

  async getChannel(id: string): Promise<Channel | null> {
    const rows = await this.sql`
      SELECT * FROM channels WHERE id = ${id}
    `;
    return (first(rows) as Channel) ?? null;
  }

  async createChannel(
    userId: string,
    name: string,
    description = "",
    systemPrompt = ""
  ): Promise<Channel> {
    const rows = await this.sql`
      INSERT INTO channels (user_id, name, description, system_prompt)
      VALUES (${userId}, ${name}, ${description}, ${systemPrompt})
      RETURNING *
    `;
    return first(rows) as Channel;
  }

  async updateChannel(
    id: string,
    updates: Partial<Pick<Channel, "name" | "description" | "system_prompt">>
  ): Promise<Channel> {
    const channel = await this.getChannel(id);
    if (!channel) throw new Error(`Channel ${id} not found`);

    const name = updates.name ?? channel.name;
    const description = updates.description ?? channel.description;
    const systemPrompt = updates.system_prompt ?? channel.system_prompt;

    const rows = await this.sql`
      UPDATE channels
      SET name = ${name}, description = ${description}, system_prompt = ${systemPrompt}, updated_at = now()
      WHERE id = ${id}
      RETURNING *
    `;
    return first(rows) as Channel;
  }

  async deleteChannel(id: string): Promise<void> {
    await this.sql`DELETE FROM channels WHERE id = ${id}`;
  }

  async updateMemorySummary(
    channelId: string,
    summary: string
  ): Promise<void> {
    await this.sql`
      UPDATE channels
      SET memory_summary = ${summary}, last_summarized_at = now(), updated_at = now()
      WHERE id = ${channelId}
    `;
  }

  // ── Messages ──────────────────────────────────────────────

  async getMessages(
    channelId: string,
    limit = 50,
    before?: string
  ): Promise<Message[]> {
    if (before) {
      const rows = await this.sql`
        SELECT * FROM messages
        WHERE channel_id = ${channelId} AND created_at < (
          SELECT created_at FROM messages WHERE id = ${before}
        )
        ORDER BY created_at DESC
        LIMIT ${limit}
      `;
      return (rows as unknown as Message[]).reverse();
    }
    const rows = await this.sql`
      SELECT * FROM messages
      WHERE channel_id = ${channelId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
    return (rows as unknown as Message[]).reverse();
  }

  async getRecentMessages(
    channelId: string,
    count: number
  ): Promise<Message[]> {
    return this.getMessages(channelId, count);
  }

  async createMessage(
    channelId: string,
    userId: string,
    role: "user" | "assistant",
    content: string,
    choices?: Choice[],
    toolCalls?: StoredToolCall[]
  ): Promise<Message> {
    const choicesJson = choices ? JSON.stringify(choices) : null;
    const toolCallsJson = toolCalls?.length ? JSON.stringify(toolCalls) : null;
    const rows = await this.sql`
      INSERT INTO messages (channel_id, user_id, role, content, choices, tool_calls)
      VALUES (${channelId}, ${userId}, ${role}, ${content}, ${choicesJson}::jsonb, ${toolCallsJson}::jsonb)
      RETURNING *
    `;
    await this.sql`
      UPDATE channels
      SET message_count = message_count + 1, updated_at = now()
      WHERE id = ${channelId}
    `;
    return first(rows) as Message;
  }

  async getMessageCountSince(
    channelId: string,
    since: string | null
  ): Promise<number> {
    if (!since) {
      const rows = await this.sql`
        SELECT COUNT(*)::int as count FROM messages WHERE channel_id = ${channelId}
      `;
      return (first(rows) as { count: number }).count;
    }
    const rows = await this.sql`
      SELECT COUNT(*)::int as count FROM messages
      WHERE channel_id = ${channelId} AND created_at > ${since}
    `;
    return (first(rows) as { count: number }).count;
  }

  async getMessagesForSummarization(
    channelId: string,
    recentCount: number
  ): Promise<Message[]> {
    const channel = await this.getChannel(channelId);
    if (!channel) return [];

    if (channel.last_summarized_at) {
      const rows = await this.sql`
        SELECT * FROM messages
        WHERE channel_id = ${channelId}
          AND created_at > ${channel.last_summarized_at}
        ORDER BY created_at ASC
      `;
      const all = rows as unknown as Message[];
      return all.slice(0, Math.max(0, all.length - recentCount));
    }

    const rows = await this.sql`
      SELECT * FROM messages
      WHERE channel_id = ${channelId}
      ORDER BY created_at ASC
    `;
    const all = rows as unknown as Message[];
    return all.slice(0, Math.max(0, all.length - recentCount));
  }
}
