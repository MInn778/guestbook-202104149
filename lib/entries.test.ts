// Run: npm test  (hits the real Neon DB from .env.local, cleans up after itself)
import { test, after } from "node:test";
import assert from "node:assert/strict";
import { createEntry, listEntries, deleteEntry } from "./entries.ts";

const PW = "pass1234";
const created: number[] = [];

async function make(message: string) {
  const r = await createEntry({ authorName: "테스터", message, password: PW });
  assert.equal(r, "ok");
  const e = (await listEntries({ isAdmin: true })).find(
    (e) => "message" in e && e.message === message,
  );
  assert.ok(e);
  created.push(e.id);
  return e.id;
}

after(async () => {
  for (const id of created) await deleteEntry(id, PW);
});

test("created Entry is listed newest first without its password hash", async () => {
  const tag = `t-${Date.now()}`;
  await make(`${tag}-old`);
  await make(`${tag}-new`);
  const list = await listEntries({ isAdmin: false });
  const mine = list.filter((e) => "message" in e && e.message.startsWith(tag));
  assert.deepEqual(
    mine.map((e) => "message" in e && e.message),
    [`${tag}-new`, `${tag}-old`],
  );
  const e = mine[0];
  assert.ok("message" in e);
  assert.equal(e.authorName, "테스터");
  assert.equal(e.edited, false);
  assert.equal(JSON.stringify(e).includes(PW), false);
  assert.equal("passwordHash" in e || "password_hash" in e, false);
});

test("blank or too-long input is rejected", async () => {
  const ok = { authorName: "a", message: "m", password: "1234" };
  assert.equal(await createEntry({ ...ok, authorName: "   " }), "invalid");
  assert.equal(await createEntry({ ...ok, authorName: "x".repeat(21) }), "invalid");
  assert.equal(await createEntry({ ...ok, message: "x".repeat(501) }), "invalid");
  assert.equal(await createEntry({ ...ok, password: "123" }), "invalid");
});
