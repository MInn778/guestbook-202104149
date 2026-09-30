"use server";

import { revalidatePath } from "next/cache";
import {
  createEntry,
  updateMessage,
  deleteEntry,
  removeEntry,
  restoreEntry,
} from "@/lib/entries";
import { isAdmin, login, logout } from "@/lib/admin";

export type ActionResult = { ok: boolean; error?: string; gone?: boolean };

const MESSAGES = {
  invalid: "입력값을 확인해주세요 (이름 1~20자, 메시지 1~500자, 비밀번호 4~20자)",
  "wrong-password": "비밀번호가 일치하지 않습니다",
  "not-found": "이미 삭제된 글입니다",
  removed: "관리자에 의해 삭제된 글입니다",
  "admin-wrong-password": "관리자 비밀번호가 일치하지 않습니다",
  "not-admin": "관리자만 할 수 있습니다",
} as const;

function toResult(r: "ok" | keyof typeof MESSAGES): ActionResult {
  revalidatePath("/");
  if (r === "ok") return { ok: true };
  return { ok: false, error: MESSAGES[r], gone: r === "not-found" || r === "removed" };
}

const str = (fd: FormData, k: string) => String(fd.get(k) ?? "");

export async function createAction(fd: FormData) {
  return toResult(
    await createEntry({
      authorName: str(fd, "authorName"),
      message: str(fd, "message"),
      password: str(fd, "password"),
    }),
  );
}

// Action arguments come from the client and can be tampered with; a bad id matches no Entry.
const entryId = (id: unknown) => (Number.isInteger(id) ? (id as number) : -1);

export async function updateAction(id: number, fd: FormData) {
  return toResult(await updateMessage(entryId(id), str(fd, "password"), str(fd, "message")));
}

export async function deleteAction(id: number, fd: FormData) {
  return toResult(await deleteEntry(entryId(id), str(fd, "password")));
}

export async function loginAction(fd: FormData) {
  return toResult((await login(str(fd, "password"))) ? "ok" : "admin-wrong-password");
}

export async function logoutAction() {
  await logout();
  return toResult("ok");
}

// Admin rights are re-checked on the server for every call; hidden buttons are not protection.
export async function removeAction(id: number) {
  return toResult((await isAdmin()) ? await removeEntry(entryId(id)) : "not-admin");
}

export async function restoreAction(id: number) {
  return toResult((await isAdmin()) ? await restoreEntry(entryId(id)) : "not-admin");
}
