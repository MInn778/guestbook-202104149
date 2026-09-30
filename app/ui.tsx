"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createAction, type ActionResult } from "./actions";

// Runs a Server Action from onSubmit instead of <form action>, so a refused
// request keeps what the user typed (React resets forms after form actions).
function useSubmit(
  action: (fd: FormData) => Promise<ActionResult>,
  onOk?: (form: HTMLFormElement) => void,
) {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    start(async () => {
      const r = await action(new FormData(form));
      if (r.gone) alert(r.error);
      setError(r.ok || r.gone ? undefined : r.error);
      if (r.ok) onOk?.(form);
    });
  };
  return { error, pending, onSubmit };
}

export const input = "w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
export const button = "rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";

export function CreateForm() {
  const { error, pending, onSubmit } = useSubmit(createAction, (f) => f.reset());
  return (
    <form onSubmit={onSubmit} className="space-y-2 rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
      <div className="flex gap-2">
        <input name="authorName" placeholder="이름" aria-label="이름" required maxLength={20} className={input} />
        <input name="password" type="password" placeholder="비밀번호 (4~20자)" aria-label="비밀번호" required minLength={4} maxLength={20} className={input} />
      </div>
      <textarea name="message" placeholder="메시지를 남겨주세요" aria-label="메시지" required maxLength={500} rows={3} className={input} />
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      <button disabled={pending} className={button}>{pending ? "저장 중…" : "남기기"}</button>
    </form>
  );
}
