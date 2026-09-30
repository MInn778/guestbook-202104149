// Run: npm test  (hits the real Neon DB from .env.local, cleans up after itself)
import { test, after } from "node:test";
import assert from "node:assert/strict";
import {
  createEntry,
  listEntries,
  deleteEntry,
  updateMessage,
  removeEntry,
  restoreEntry,
} from "./entries.ts";

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
  for (const id of created) {
    await restoreEntry(id);
    await deleteEntry(id, PW, { isAdmin: true });
  }
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

async function find(id: number, isAdmin = false) {
  return (await listEntries({ isAdmin })).find((e) => e.id === id);
}

test("edit with the wrong Password is refused and the Message is unchanged", async () => {
  const id = await make(`edit-wrong-${Date.now()}`);
  const before = await find(id);
  assert.equal(await updateMessage(id, "nope1234", "hacked"), "wrong-password");
  assert.deepEqual(await find(id), before);
});

test("edit with the right Password changes only the Message and marks it Edited", async () => {
  const id = await make(`edit-ok-${Date.now()}`);
  const before = await find(id);
  assert.equal(await updateMessage(id, PW, "  고친 메시지  "), "ok");
  const after = await find(id);
  assert.ok(after && "message" in after && before && "message" in before);
  assert.equal(after.message, "고친 메시지");
  assert.equal(after.edited, true);
  assert.equal(before.updatedAt, null);
  assert.ok(after.updatedAt instanceof Date);
  assert.ok(after.updatedAt.getTime() >= after.createdAt.getTime());
  assert.equal(after.authorName, before.authorName);
  assert.equal(after.createdAt.getTime(), before.createdAt.getTime());
  assert.equal(await updateMessage(id, PW, "   "), "invalid");
});

test("delete with the wrong Password is refused; the right one removes the Entry", async () => {
  const id = await make(`del-${Date.now()}`);
  assert.equal(await deleteEntry(id, "nope1234"), "wrong-password");
  assert.ok(await find(id));
  assert.equal(await deleteEntry(id, PW), "ok");
  assert.equal(await find(id, true), undefined);
});

test("editing or deleting an Entry that no longer exists reports not-found", async () => {
  assert.equal(await updateMessage(-1, PW, "x"), "not-found");
  assert.equal(await deleteEntry(-1, PW), "not-found");
});

test("a Removed Entry shows no content to non-Admins but stays visible to the Admin", async () => {
  const message = `rm-${Date.now()}`;
  const id = await make(message);
  assert.equal(await removeEntry(id), "ok");
  const pub = await find(id);
  assert.deepEqual(pub, { id, removed: true });
  const adm = await find(id, true);
  assert.ok(adm && "message" in adm);
  assert.equal(adm.message, message);
  assert.equal(adm.removed, true);
  const pos = (l: { id: number }[]) => l.findIndex((e) => e.id === id);
  assert.equal(pos(await listEntries({ isAdmin: false })), pos(await listEntries({ isAdmin: true })));
});

test("the author cannot edit or delete a Removed Entry; Restore brings the Password back", async () => {
  const message = `rs-${Date.now()}`;
  const id = await make(message);
  await removeEntry(id);
  assert.equal(await updateMessage(id, PW, "x"), "removed");
  assert.equal(await deleteEntry(id, PW), "removed");
  assert.equal(await restoreEntry(id), "ok");
  const back = await find(id);
  assert.ok(back && "message" in back);
  assert.equal(back.message, message);
  assert.equal(back.removed, false);
  assert.equal(await updateMessage(id, PW, "복구 후 수정"), "ok");
});

test("Remove and Restore of an unknown Entry report not-found", async () => {
  assert.equal(await removeEntry(-1), "not-found");
  assert.equal(await restoreEntry(-1), "not-found");
});

test("an Entry written by the Admin is marked as such; others are not", async () => {
  const tag = `adm-${Date.now()}`;
  assert.equal(await createEntry({ authorName: "관리자", message: tag, password: PW, byAdmin: true }), "ok");
  const e = (await listEntries({ isAdmin: false })).find((e) => "message" in e && e.message === tag);
  assert.ok(e && "message" in e);
  created.push(e.id);
  assert.equal(e.byAdmin, true);
  const plain = await find(await make(`${tag}-plain`));
  assert.ok(plain && "message" in plain);
  assert.equal(plain.byAdmin, false);
});

test("an Admin Entry can be edited or deleted only while logged in as the Admin", async () => {
  const tag = `adm-lock-${Date.now()}`;
  await createEntry({ authorName: "관리자", message: tag, password: PW, byAdmin: true });
  const e = (await listEntries({ isAdmin: true })).find((e) => "message" in e && e.message === tag);
  assert.ok(e);
  created.push(e.id);
  assert.equal(await updateMessage(e.id, PW, "x"), "admin-only");
  assert.equal(await deleteEntry(e.id, PW), "admin-only");
  assert.equal(await updateMessage(e.id, PW, `${tag}-edited`, { isAdmin: true }), "ok");
  assert.equal(await deleteEntry(e.id, PW, { isAdmin: true }), "ok");
  assert.equal(await find(e.id, true), undefined);
});

test("blank or too-long input is rejected", async () => {
  const ok = { authorName: "a", message: "m", password: "1234" };
  assert.equal(await createEntry({ ...ok, authorName: "   " }), "invalid");
  assert.equal(await createEntry({ ...ok, authorName: "x".repeat(21) }), "invalid");
  assert.equal(await createEntry({ ...ok, message: "x".repeat(501) }), "invalid");
  assert.equal(await createEntry({ ...ok, password: "123" }), "invalid");
});
