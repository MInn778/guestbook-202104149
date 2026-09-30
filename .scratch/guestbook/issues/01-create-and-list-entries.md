# 01: Create and list Entries (+ first deploy)

**What to build:** A visitor opens the single guestbook page, sees the title "미니 방명록" and "개발자: 김민혁-202104149" in the header, fills in Author name, Message and Password, submits, and sees their Entry at the top of the list with its creation time in Korean time. With no Entries the list shows "아직 작성된 글이 없습니다. 첫 글을 남겨보세요!". The page works on the deployed Vercel URL. See `.scratch/guestbook/spec.md`.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] A checked-in schema SQL creates the `entries` table with every column in the spec (including `updated_at` and `removed_at`, both nullable), run once in the Neon SQL Editor
- [ ] The Entries module exposes `createEntry` and `listEntries({ isAdmin })`; `listEntries` returns newest first and never includes the password hash
- [ ] Inputs are trimmed; Author name 1–20, Message 1–500, Password 4–20 enforced in the module (`invalid` otherwise) and mirrored by HTML attributes
- [ ] Password is stored as a salted `crypto.scrypt` hash
- [ ] Creation time is shown as `YYYY-MM-DD HH:mm` in `Asia/Seoul`
- [ ] Empty state message shown when there are no Entries
- [ ] `node:test` tests for create/list/invalid-input run against `DATABASE_URL` and clean up after themselves
- [ ] `npm run build` passes; deployed Vercel URL shows the page and creating an Entry works there
