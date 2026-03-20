import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { getDb } from "@/lib/db/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function first(rows: any): any {
  return Array.isArray(rows) ? rows[0] : undefined;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Google],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request }) {
      const isLoggedIn = !!auth?.user;
      const isLoginPage = request.nextUrl.pathname.startsWith("/login");
      const isAuthApi = request.nextUrl.pathname.startsWith("/api/auth");

      if (isAuthApi) return true;
      if (isLoginPage) return true;
      if (isLoggedIn) return true;

      // Redirect unauthenticated users to login
      return false;
    },

    async signIn({ user }) {
      if (!user.email) return false;

      const sql = getDb();

      // Upsert user
      const existing = await sql`
        SELECT id FROM users WHERE email = ${user.email}
      `;

      if (!first(existing)) {
        await sql`
          INSERT INTO users (email, name, image)
          VALUES (${user.email}, ${user.name ?? null}, ${user.image ?? null})
        `;
      } else {
        await sql`
          UPDATE users SET name = ${user.name ?? null}, image = ${user.image ?? null}
          WHERE email = ${user.email}
        `;
      }

      return true;
    },

    async jwt({ token }) {
      if (token.email && !token.userId) {
        const sql = getDb();
        const rows = await sql`
          SELECT id FROM users WHERE email = ${token.email}
        `;
        const row = first(rows);
        if (row) {
          token.userId = row.id;
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
