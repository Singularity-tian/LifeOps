import { config } from "dotenv";
config({ path: ".env.local" });
import { getDb } from "../lib/db/client";
import { runMigration } from "../lib/db/schema";

async function main() {
  const sql = getDb();
  await runMigration(sql);
}

main().catch((e) => {
  console.error("Migration failed:", e);
  process.exit(1);
});
