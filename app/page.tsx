import { listEntries } from "@/lib/entries";
import { connection } from "next/server";
import { CreateForm } from "./ui";

const fmt = new Intl.DateTimeFormat("sv-SE", {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
}); // sv-SE gives "YYYY-MM-DD HH:mm"

export default async function Page() {
  await connection(); // render per request, never prerender the list
  const entries = await listEntries({ isAdmin: false });
  return (
    <main className="mx-auto w-full max-w-2xl space-y-6 px-4 py-8">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">미니 방명록</h1>
          <p className="text-sm text-zinc-500">개발자: 김민혁-202104149</p>
        </div>
      </header>
      <CreateForm />
      {entries.length === 0 ? (
        <p className="py-8 text-center text-zinc-500">아직 작성된 글이 없습니다. 첫 글을 남겨보세요!</p>
      ) : (
        <ul className="space-y-3">
          {entries.map((e) =>
            "message" in e ? (
              <li key={e.id} className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">{e.authorName}</span>
                  <span className="text-zinc-500">
                    {fmt.format(e.createdAt)}
                    {e.edited && " (수정됨)"}
                  </span>
                </div>
                <p className="mt-2 whitespace-pre-wrap break-words">{e.message}</p>
              </li>
            ) : null,
          )}
        </ul>
      )}
    </main>
  );
}
