"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import {
  createAction,
  updateAction,
  deleteAction,
  loginAction,
  logoutAction,
  removeAction,
  restoreAction,
  type ActionResult,
} from "./actions";

// Runs a Server Action from onSubmit instead of <form action>, so a refused
// request keeps what the user typed (React resets forms after form actions).
function useSubmit(
  action: (fd: FormData) => Promise<ActionResult>,
  onOk?: (form: HTMLFormElement) => void,
  confirmText?: string,
) {
  const [error, setError] = useState<string>();
  const [pending, start] = useTransition();
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (confirmText && !confirm(confirmText)) return;
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

const input = "w-full rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900";
const button = "rounded bg-zinc-900 px-3 py-1.5 text-sm text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900";
const link = "text-sm text-zinc-500 underline-offset-2 hover:underline disabled:opacity-50";

function ErrorText({ text }: { text?: string }) {
  return text ? <p role="alert" className="text-sm text-red-600">{text}</p> : null;
}

// A floating [글쓰기] button at the bottom-right that opens the create form in a native <dialog>.
export function CreateForm() {
  const dialog = useRef<HTMLDialogElement>(null);
  const { error, pending, onSubmit } = useSubmit(createAction, (f) => {
    f.reset();
    dialog.current?.close();
  });
  return (
    <>
      <button
        onClick={() => dialog.current?.showModal()}
        className="fixed right-6 bottom-6 rounded-full bg-zinc-900 px-5 py-3 text-white shadow-lg dark:bg-zinc-100 dark:text-zinc-900"
      >
        글쓰기
      </button>
      <dialog
        ref={dialog}
        className="m-auto w-[calc(100%-2rem)] max-w-lg rounded-lg bg-white p-0 backdrop:bg-black/40 dark:bg-zinc-950 dark:text-zinc-100"
      >
        <form onSubmit={onSubmit} className="space-y-2 p-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">방명록 남기기</h2>
            <button type="button" onClick={() => dialog.current?.close()} aria-label="닫기" className={link}>
              닫기
            </button>
          </div>
      <div className="flex gap-2">
        <input name="authorName" placeholder="이름" aria-label="이름" required maxLength={20} className={input} />
        <input name="password" type="password" placeholder="비밀번호 (4~20자)" aria-label="비밀번호" required minLength={4} maxLength={20} className={input} />
      </div>
      <textarea name="message" placeholder="메시지를 남겨주세요" aria-label="메시지" required maxLength={500} rows={3} className={input} />
      <ErrorText text={error} />
      <button disabled={pending} className={button}>{pending ? "저장 중…" : "남기기"}</button>
        </form>
      </dialog>
    </>
  );
}

function PasswordInput() {
  return (
    <input name="password" type="password" placeholder="비밀번호" aria-label="비밀번호" required minLength={4} maxLength={20} autoFocus className={input} />
  );
}

function EditForm({ id, message, onDone }: { id: number; message: string; onDone: () => void }) {
  const { error, pending, onSubmit } = useSubmit(updateAction.bind(null, id), onDone);
  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <textarea name="message" defaultValue={message} aria-label="메시지" required maxLength={500} rows={3} className={input} />
      <PasswordInput />
      <ErrorText text={error} />
      <div className="flex gap-2">
        <button disabled={pending} className={button}>수정하기</button>
        <button type="button" onClick={onDone} className={link}>취소하기</button>
      </div>
    </form>
  );
}

function DeleteForm({ id, onDone }: { id: number; onDone: () => void }) {
  const { error, pending, onSubmit } = useSubmit(deleteAction.bind(null, id), onDone, "정말 삭제할까요?");
  return (
    <form onSubmit={onSubmit} className="mt-3 space-y-2">
      <PasswordInput />
      <ErrorText text={error} />
      <div className="flex gap-2">
        <button disabled={pending} className={button}>삭제</button>
        <button type="button" onClick={onDone} className={link}>취소</button>
      </div>
    </form>
  );
}

export function EntryActions({
  id,
  message,
  removed,
  admin,
}: {
  id: number;
  message: string;
  removed: boolean;
  admin: boolean;
}) {
  const [mode, setMode] = useState<"edit" | "delete" | null>(null);
  const [pending, start] = useTransition();
  const run = (action: (id: number) => Promise<ActionResult>, confirmText?: string) => {
    if (confirmText && !confirm(confirmText)) return;
    start(async () => {
      const r = await action(id);
      if (!r.ok) alert(r.error);
    });
  };
  const close = () => setMode(null);

  return (
    <>
      <div className="mt-3 flex gap-3">
        {!removed && (
          <>
            <button onClick={() => setMode(mode === "edit" ? null : "edit")} className={link}>수정</button>
            {!admin && (
              <button onClick={() => setMode(mode === "delete" ? null : "delete")} className={link}>삭제</button>
            )}
          </>
        )}
        {admin && !removed && (
          <button disabled={pending} onClick={() => run(removeAction, "정말 삭제할까요?")} className={`${link} text-red-600`}>
            관리자 삭제
          </button>
        )}
        {admin && removed && (
          <button disabled={pending} onClick={() => run(restoreAction)} className={`${link} text-blue-600`}>
            복구
          </button>
        )}
      </div>
      {!removed && mode === "edit" && <EditForm id={id} message={message} onDone={close} />}
      {!removed && mode === "delete" && <DeleteForm id={id} onDone={close} />}
    </>
  );
}

export function AdminControl({ admin }: { admin: boolean }) {
  const [open, setOpen] = useState(false);
  const { error, pending, onSubmit } = useSubmit(loginAction, () => setOpen(false));
  const [loggingOut, start] = useTransition();

  if (admin)
    return (
      <button disabled={loggingOut} onClick={() => start(async () => void (await logoutAction()))} className={link}>
        로그아웃
      </button>
    );
  return (
    <div className="flex flex-col items-end gap-2">
      <button onClick={() => setOpen(!open)} className={link}>관리자</button>
      {open && (
        <form onSubmit={onSubmit} className="flex w-56 flex-col gap-2">
          <input name="password" type="password" placeholder="관리자 비밀번호" aria-label="관리자 비밀번호" required autoFocus className={input} />
          <ErrorText text={error} />
          <button disabled={pending} className={button}>로그인</button>
        </form>
      )}
    </div>
  );
}
