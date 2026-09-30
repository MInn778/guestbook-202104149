# 05: Admin Remove and Restore

**What to build:** While logged in, the Admin sees [관리자 삭제] on every Entry; after confirming "정말 삭제할까요?" the Entry becomes Removed. Everyone who is not the Admin then sees only "관리자에 의해 삭제된 글입니다" in that Entry's original position, with no name, time or Message in the page data, and no [수정]/[삭제] buttons. The Admin instead sees the original content dimmed with a "삭제됨" label and a [복구] button that immediately Restores the Entry to exactly its prior state. The Admin can never edit a Message. See `.scratch/guestbook/spec.md` and ADR 0001.

**Blocked by:** 02 (Author edits Message), 03 (Author deletes Entry), 04 (Admin login and logout)

**Status:** ready-for-agent

- [ ] Entries module exposes `removeEntry(id)` and `restoreEntry(id)` returning `ok` | `not-found`; Remove sets `removed_at`, Restore clears it, no other data changes
- [ ] Remove and Restore Server Actions verify the Admin cookie on the server and refuse otherwise
- [ ] `listEntries({ isAdmin: false })` returns Removed Entries as `{ id, removed: true }` only; `isAdmin: true` includes content plus `removed: true`
- [ ] `updateMessage` and `deleteEntry` return `removed` for a Removed Entry, and the author's buttons are hidden on it
- [ ] Removed Entries keep their original position in the newest-first list
- [ ] Tests: Remove hides content from non-Admin list but not Admin list; Removed Entry refuses update/delete with `removed`; Restore makes the original Password work again
