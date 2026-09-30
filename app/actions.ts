"use server";

import { revalidatePath } from "next/cache";
import { createEntry } from "@/lib/entries";

export type ActionResult = { ok: boolean; error?: string; gone?: boolean };

const MESSAGES = {
  invalid: "입력값을 확인해주세요 (이름 1~20자, 메시지 1~500자, 비밀번호 4~20자)",
  "wrong-password": "비밀번호가 일치하지 않습니다",
  "not-found": "이미 삭제된 글입니다",
  removed: "관리자에 의해 삭제된 글입니다",
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
