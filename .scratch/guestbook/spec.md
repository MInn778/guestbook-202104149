# Spec: Mini Guestbook

Status: ready-for-agent

## Problem Statement

Visitors want a simple place to leave a short note with their name, see what others wrote, and later fix or take back their own note, all without creating an account. Because there are no accounts, the only thing proving "this Entry is mine" is a Password chosen when writing it; anyone who does not know it must be refused, and told so clearly. The guestbook operator also needs a way to take down inappropriate Entries (and undo that if it was a mistake) without being able to put words in anyone's mouth.

## Solution

A single-page guestbook. The top of the page shows the title "미니 방명록", the developer credit "개발자: 김민혁-202104149", and an Admin login control in the top-right corner. Below that is a form to leave an Entry (Author name, Message, Password), followed by the full list of Entries, newest first.

Each Entry card shows the Author name, Message, creation time (Asia/Seoul, `YYYY-MM-DD HH:mm`) and "(수정됨)" if it has been Edited. Each card has [수정] and [삭제] buttons that expand an inline form in the card asking for the Password (and, for edit, the new Message). A wrong Password is refused and the card shows "비밀번호가 일치하지 않습니다" while keeping what was typed. Delete additionally asks `confirm("정말 삭제할까요?")`.

The Admin logs in from the top-right with a single Admin password. While logged in, every card shows [관리자 삭제] (with confirm), and Removed Entries show [복구]. Admin can never edit a Message. A Removed Entry appears to everyone else as only "관리자에 의해 삭제된 글입니다", in its original position, with no name, time, or Message, and its author can no longer edit or delete it. Restore returns the Entry to exactly its prior state.

## User Stories

1. As a visitor, I want to write my Author name, a Message and a Password in a form, so that I can leave an Entry without signing up.
2. As a visitor, I want the form to reject an empty (or whitespace-only) Author name, Message or Password, so that meaningless Entries are not created.
3. As a visitor, I want the form to limit the Author name to 20 characters, the Message to 500 and the Password to 4–20, so that Entries stay readable and the Password is not trivially short.
4. As a visitor, I want those limits enforced by the server as well as the browser, so that bypassing the form cannot create invalid Entries.
5. As a visitor, I want my new Entry to appear in the list immediately after submitting, so that I know it was saved.
6. As a visitor, I want to see every Entry on one page, so that I can read the whole guestbook without paging.
7. As a visitor, I want Entries sorted newest first, so that recent notes are at the top.
8. As a visitor, I want each Entry to show its Author name, Message and creation time, so that I know who wrote what and when.
9. As a visitor, I want times shown in Korean time as `YYYY-MM-DD HH:mm`, so that times are not off by nine hours on the deployed site.
10. As a visitor, I want an Edited Entry marked "(수정됨)", so that I can tell the Message was changed after writing.
11. As a visitor, when there are no Entries, I want to see "아직 작성된 글이 없습니다. 첫 글을 남겨보세요!", so that the empty page is not confusing.
12. As a visitor, I want to see the developer credit "개발자: 김민혁-202104149" at the top, so that I know who built the page.
13. As an author, I want to click [수정] on my Entry and edit its Message inline after entering my Password, so that I can fix typos.
14. As an author, I want only the Message to be editable (not Author name or Password), so that an Entry's identity stays stable.
15. As an author, I want edited Messages to obey the same 1–500 character rule, so that edits cannot produce invalid Entries.
16. As an author, if my Password is wrong when editing, I want the edit refused and "비밀번호가 일치하지 않습니다" shown in that card with my input kept, so that I can retry.
17. As an author, I want to click [삭제] on my Entry, enter my Password and confirm "정말 삭제할까요?", so that I don't delete by accident.
18. As an author, if my Password is wrong when deleting, I want the deletion refused and "비밀번호가 일치하지 않습니다" shown in that card, so that I know why nothing happened.
19. As an author, I want my deleted Entry to disappear from the list entirely, so that it is really gone.
20. As an author, if the Entry was already deleted (e.g. in another tab), I want to see "이미 삭제된 글입니다" and a refreshed list, so that I am not confused by a stale card.
21. As any visitor, I want no one to be able to edit or delete an Entry without its Password, so that my Entry is safe from others.
22. As an author, I want my Password stored only as a salted hash, so that a database leak does not reveal it.
23. As a visitor, I want Passwords and their hashes never sent to the browser, so that they cannot be read from the page.
24. As the Admin, I want an [관리자] control in the top-right that asks for the Admin password, so that I can log in without a separate page.
25. As the Admin, if I type the wrong Admin password, I want "관리자 비밀번호가 일치하지 않습니다" shown, so that I know login failed.
26. As the Admin, I want to stay logged in until I close the browser or click [로그아웃], so that I don't re-enter the password for each action.
27. As the Admin, I want a [관리자 삭제] button on every Entry that asks "정말 삭제할까요?", so that I can Remove inappropriate Entries safely.
28. As the Admin, I want no way to edit anyone's Message, so that I can never alter what someone wrote.
29. As a visitor, I want a Removed Entry to show only "관리자에 의해 삭제된 글입니다" in its original position, so that I know something was taken down.
30. As a visitor, I want a Removed Entry's name, time and Message to be absent from the page data itself, so that the removed content cannot be recovered by viewing source.
31. As an author, I want the [수정]/[삭제] buttons hidden on my Removed Entry and those actions refused by the server, so that a Removed Entry stays removed.
32. As the Admin, I want to see Removed Entries' original content dimmed with a "삭제됨" label, so that I can judge whether to Restore them.
33. As the Admin, I want a [복구] button on Removed Entries that works immediately, so that I can undo a mistaken removal.
34. As an author, I want my Restored Entry to be exactly as before (same Message, same Password, same position), so that I can edit or delete it again.
35. As the Admin, I want Admin actions verified on the server on every request, so that hiding buttons is not the only protection.
36. As the operator, I want the Admin password kept only in environment variables, so that it is never in the public repository.

## Implementation Decisions

- **Stack**: Next.js App Router + TypeScript, Neon Postgres via `@neondatabase/serverless`, deployed on Vercel. Note: this Next.js version may differ from training data; read the bundled Next.js docs before writing code.
- **Single page**: one route renders the header, the create form and the Entry list. It is rendered on the server per request (dynamic), reading the Admin session to decide what to show.
- **Mutations via Server Actions**: create, update Message, delete, Admin login, Admin logout, remove and restore are Server Actions. After each successful mutation the page is revalidated so the list is re-read in newest-first order. Actions return a small result to the client component so the card can show the right message.
- **Entries module (the one seam)**: a server-only module owns all SQL, validation and Password hashing. Server Actions and the page call only this module. Interface:
  - `listEntries({ isAdmin })` → entries newest first; each view has `id`, and either the visible fields (`authorName`, `message`, `createdAt`, `edited`) or, for Removed Entries viewed by non-Admins, only `removed: true`. Admin views of Removed Entries include the content plus `removed: true`. Password hashes are never returned.
  - `createEntry({ authorName, message, password })` → `ok` | `invalid`
  - `updateMessage(id, password, message)` → `ok` | `invalid` | `wrong-password` | `not-found` | `removed`
  - `deleteEntry(id, password)` → `ok` | `wrong-password` | `not-found` | `removed`
  - `removeEntry(id)` → `ok` | `not-found` (Admin only; caller must verify Admin)
  - `restoreEntry(id)` → `ok` | `not-found` (Admin only; caller must verify Admin)
- **Validation**: trim all inputs; Author name 1–20, Message 1–500, Password 4–20 characters. Enforced in the Entries module; HTML `required`/`maxLength`/`minLength` mirror it in the browser.
- **Password hashing**: Node built-in `crypto.scrypt` with a random per-Entry salt; compared with `timingSafeEqual`. No extra dependency.
- **Schema** (single table, created once by running a checked-in SQL file in the Neon SQL Editor):
  - `entries`: `id` (serial PK), `author_name` (text, not null), `message` (text, not null), `password_hash` (text, not null, contains salt), `created_at` (timestamptz, default now), `updated_at` (timestamptz, null until Edited), `removed_at` (timestamptz, null unless Removed).
  - Author Delete = `DELETE` row. Admin Remove = set `removed_at`. Restore = clear `removed_at`. See ADR 0001.
- **Admin session**: a single Admin password in the `ADMIN_PASSWORD` environment variable (local `.env.local` and Vercel). Login compares with `timingSafeEqual`; success sets an httpOnly, `sameSite=lax`, `secure` (in production) session cookie (no max-age) whose value is an HMAC signed with `ADMIN_PASSWORD` as the key. Every Admin-only Server Action and the page re-verify the cookie on the server. Changing `ADMIN_PASSWORD` invalidates existing sessions.
- **Time display**: format `created_at` with `Intl.DateTimeFormat` in `Asia/Seoul`, `YYYY-MM-DD HH:mm`.
- **Messages shown to users**: "비밀번호가 일치하지 않습니다", "이미 삭제된 글입니다", "관리자 비밀번호가 일치하지 않습니다", "관리자에 의해 삭제된 글입니다", "아직 작성된 글이 없습니다. 첫 글을 남겨보세요!", confirm "정말 삭제할까요?" (author delete and Admin remove; not restore).

## Testing Decisions

- A good test drives the Entries module through its public functions and asserts on what callers observe (results and `listEntries` output), never on SQL or internal helpers.
- Only the Entries module is tested, using Node's built-in `node:test` runner against the real Neon database from `DATABASE_URL` (tests clean up the Entries they create).
- Cases: create then list (newest first, no hash exposed); invalid input rejected; update with wrong Password refused and Message unchanged; update with right Password changes Message and marks Edited; delete with wrong Password refused; delete with right Password removes it; unknown id → `not-found`; Remove hides content from non-Admin list but not Admin list; Removed Entry refuses update/delete with `removed`; Restore makes the original Password work again.
- UI and Admin cookie flow are verified manually on the deployed Vercel URL.
- No prior art: the repo is a fresh `create-next-app` scaffold.

## Out of Scope

- User accounts, sign-up, or multiple Admins.
- Admin editing of Messages.
- Changing an Entry's Author name or Password.
- Pagination, search, or infinite scroll.
- Rate limiting, CAPTCHA, or spam filtering.
- Password reset for authors.
- Automated UI / end-to-end tests.

## Further Notes

- Project names must all be `guestbook-202104149` (GitHub, Vercel, Neon). The GitHub repo must be public.
- `DATABASE_URL` and `ADMIN_PASSWORD` must be set in Vercel before the deployment works; redeploy after adding them.
- The table must be created in Neon (run the schema SQL once) before the deployed app can read or write.
- Vocabulary follows `GLOSSARY.md`; the delete/remove split follows `docs/adr/0001-admin-remove-is-soft-author-delete-is-hard.md`.
