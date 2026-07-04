import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import { pfVideosTable } from "@workspace/db/schema";

const { Pool } = pg;

export { pfVideosTable };

let _db: ReturnType<typeof drizzle> | null = null;

export function getPfDb() {
  if (_db) return _db;
  const url = process.env["DATABASE_URL"];
  if (!url) throw new Error("DATABASE_URL is not set — provision a database first");
  const pool = new Pool({ connectionString: url, max: 10 });
  _db = drizzle(pool, { schema: { pfVideosTable } });
  return _db;
}
