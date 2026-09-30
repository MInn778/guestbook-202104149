import { listEntries } from "@/lib/entries";
import { isAdmin } from "@/lib/admin";
import { AdminControl, CreateForm, EntryActions } from "./ui";

const fmt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
}); // sv-SE gives "YYYY-MM-DD HH:mm"

export default async function Page() {
  const admin = await isAdmin(); // reads cookies, so the page renders per request
  const entries = await listEntries({ isAdmin: admin });
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 pt-8 pb-24">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">미니 방명록</h1>
          <p className="text-sm text-zinc-500">개발자: 김민혁-202104149</p>
        </div>
        <AdminControl admin={admin} />
      </header>
      <CreateForm />
      {entries.length === 0 ? (
        <p className="py-8 text-center text-zinc-500">아직 작성된 글이 없습니다. 첫 글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) =>
            "message" in e ? (
              <li
                key={e.id}
                className={`rounded-lg border p-4 ${e.byAdmin ? "border-blue-300 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30" : "border-zinc-200 dark:border-zinc-800"} ${e.removed ? "opacity-50" : ""}`}
              >
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">
                    {e.authorName}
                    {e.byAdmin && <span className="ml-2 rounded bg-blue-100 px-1.5 text-xs text-blue-700">관리자</span>}
                    {e.removed && <span className="ml-2 rounded bg-red-100 px-1.5 text-xs text-red-700">삭제됨</span>}
                  </span>
                  <span className="text-zinc-500">
                    {fmt.format(e.createdAt)}
                    {e.edited && " (수정됨)"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words">{e.message}</p>
                <EntryActions id={e.id} message={e.message} removed={e.removed} admin={admin} />
              </li>
            ) : (
              <li key={e.id} className="rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500 dark:border-zinc-700">
                관리자에 의해 삭제된 글입니다
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  );
}
