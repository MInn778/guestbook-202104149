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

// Each note gets a paper colour and a slight tilt, picked by id so it never changes.
const PAPERS = ["bg-yellow-100", "bg-pink-100", "bg-sky-100", "bg-lime-100", "bg-orange-100"];
const TILTS = ["-rotate-1", "rotate-1", "-rotate-[0.6deg]", "rotate-[0.6deg]"];

export default async function Page() {
  const admin = await isAdmin(); // reads cookies, so the page renders per request
  const entries = await listEntries({ isAdmin: admin });
  return (
    <main className="mx-auto w-full max-w-2xl space-y-8 px-4 pt-10 pb-28">
      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-hand text-5xl font-bold text-amber-900">📖 미니 방명록</h1>
          <p className="mt-1 text-sm text-amber-900/60">개발자: 김민혁-202104149</p>
        </div>
        <AdminControl admin={admin} />
      </header>
      {admin && (
        <p className="rounded-md bg-amber-800 px-3 py-1.5 text-center text-sm text-amber-50">
          관리자 모드로 보고 있습니다
        </p>
      )}
      <CreateForm />
      {entries.length === 0 ? (
        <p className="py-16 text-center font-hand text-2xl text-amber-900/50">
          아직 작성된 글이 없습니다. 첫 글을 남겨보세요!
        </p>
      ) : (
        <ul className="space-y-7">
          {entries.map((e) =>
            "message" in e ? (
              <li
                key={e.id}
                className={`relative rounded-sm p-5 pt-6 shadow-md ${e.byAdmin ? "bg-white ring-2 ring-amber-700/40" : PAPERS[e.id % PAPERS.length]} ${TILTS[e.id % TILTS.length]} ${e.removed ? "opacity-50" : ""}`}
              >
                {e.byAdmin ? (
                  <span aria-hidden className="absolute -top-3 left-1/2 -translate-x-1/2 text-2xl">📌</span>
                ) : (
                  <span aria-hidden className="absolute -top-3 left-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-white/60 shadow-sm" />
                )}
                <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <span className="font-hand text-2xl font-bold">
                    {e.authorName}
                    {e.byAdmin && (
                      <span className="ml-2 rounded-full bg-amber-800 px-2 py-0.5 align-middle font-sans text-xs font-normal text-amber-50">
                        관리자
                      </span>
                    )}
                    {e.removed && (
                      <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 align-middle font-sans text-xs font-normal text-white">
                        삭제됨
                      </span>
                    )}
                  </span>
                  <span className="text-right text-xs text-amber-900/60">
                    작성 {fmt.format(e.createdAt)}
                    {e.updatedAt && (
                      <>
                        <br />
                        수정됨 {fmt.format(e.updatedAt)}
                      </>
                    )}
                  </span>
                </div>
                <p className="mt-3 font-hand text-xl leading-relaxed whitespace-pre-wrap break-words">{e.message}</p>
                <EntryActions id={e.id} message={e.message} removed={e.removed} admin={admin} byAdmin={e.byAdmin} />
              </li>
            ) : (
              <li
                key={e.id}
                className="rounded-sm border-2 border-dashed border-amber-900/25 p-5 text-center text-sm text-amber-900/50"
              >
                관리자에 의해 삭제된 글입니다
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  );
}
