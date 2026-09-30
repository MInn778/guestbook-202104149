// The Entries module: the only place that touches the entries table.
// Server-only: never import from a client component.
import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

// Created lazily so importing this module never needs DATABASE_URL (e.g. at build time).
const sql = () => neon(process.env.DATABASE_URL!);

export type Entry = {
  id: number;
  authorName: string;
  message: string;
  createdAt: Date;
  edited: boolean;
  removed: boolean;
};
/** What a non-Admin gets for a Removed Entry: no content at all. */
export type RemovedNotice = { id: number; removed: true };
export type EntryView = Entry | RemovedNotice;

type Row = {
  id: number;
  author_name: string;
  message: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date | null;
  removed_at: Date | null;
};

function clean(value: string, min: number, max: number) {
  const s = value.trim();
  return s.length >= min && s.length <= max ? s : null;
}

function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  return `${salt}:${scryptSync(password, salt, 32).toString("hex")}`;
}

function verify(password: string, stored: string) {
  const [salt, hex] = stored.split(":");
  return timingSafeEqual(scryptSync(password, salt, 32), Buffer.from(hex, "hex"));
}

export async function listEntries({ isAdmin }: { isAdmin: boolean }): Promise<EntryView[]> {
  const rows = (await sql()`
    SELECT id, author_name, message, created_at, updated_at, removed_at
    FROM entries ORDER BY created_at DESC, id DESC`) as Row[];
  return rows.map((r) =>
    r.removed_at && !isAdmin
      ? { id: r.id, removed: true }
      : {
          id: r.id,
          authorName: r.author_name,
          message: r.message,
          createdAt: new Date(r.created_at),
          edited: r.updated_at !== null,
          removed: r.removed_at !== null,
        },
  );
}

export async function createEntry(input: {
  authorName: string;
  message: string;
  password: string;
}): Promise<"ok" | "invalid"> {
  const authorName = clean(input.authorName, 1, 20);
  const message = clean(input.message, 1, 500);
  const password = clean(input.password, 4, 20);
  if (!authorName || !message || !password) return "invalid";
  await sql()`
    INSERT INTO entries (author_name, message, password_hash)
    VALUES (${authorName}, ${message}, ${hash(password)})`;
  return "ok";
}

async function authorize(id: number, password: string) {
  const [row] = (await sql()`
    SELECT password_hash, removed_at FROM entries WHERE id = ${id}`) as Row[];
  if (!row) return "not-found";
  if (row.removed_at) return "removed";
  if (!verify(password.trim(), row.password_hash)) return "wrong-password";
  return "ok";
}

export async function updateMessage(
  id: number,
  password: string,
  message: string,
): Promise<"ok" | "invalid" | "wrong-password" | "not-found" | "removed"> {
  const cleanMessage = clean(message, 1, 500);
  if (!cleanMessage) return "invalid";
  const auth = await authorize(id, password);
  if (auth !== "ok") return auth;
  const rows = await sql()`
    UPDATE entries SET message = ${cleanMessage}, updated_at = now()
    WHERE id = ${id} AND removed_at IS NULL RETURNING id`;
  return rows.length ? "ok" : lostRace(id);
}

// The Entry was Deleted or Removed between the Password check and the write.
async function lostRace(id: number) {
  const [row] = await sql()`SELECT 1 FROM entries WHERE id = ${id}`;
  return row ? "removed" : "not-found";
}

export async function deleteEntry(
  id: number,
  password: string,
): Promise<"ok" | "wrong-password" | "not-found" | "removed"> {
  const auth = await authorize(id, password);
  if (auth !== "ok") return auth;
  const rows = await sql()`DELETE FROM entries WHERE id = ${id} AND removed_at IS NULL RETURNING id`;
  return rows.length ? "ok" : lostRace(id);
}

// Admin only: callers must verify the Admin session first (ADR 0001: soft delete).
export async function removeEntry(id: number): Promise<"ok" | "not-found"> {
  const rows = await sql()`
    UPDATE entries SET removed_at = coalesce(removed_at, now()) WHERE id = ${id} RETURNING id`;
  return rows.length ? "ok" : "not-found";
}

export async function restoreEntry(id: number): Promise<"ok" | "not-found"> {
  const rows = await sql()`
    UPDATE entries SET removed_at = NULL WHERE id = ${id} RETURNING id`;
  return rows.length ? "ok" : "not-found";
}
