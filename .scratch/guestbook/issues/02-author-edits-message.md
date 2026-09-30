# 02: Author edits Message

**What to build:** On any Entry card, the author clicks [수정], the card expands to show the Message for editing plus a Password field, and saving with the right Password updates the Message and marks the Entry "(수정됨)". A wrong Password is refused and the card shows "비밀번호가 일치하지 않습니다" while keeping the typed input. If the Entry no longer exists, "이미 삭제된 글입니다" is shown and the list refreshes. See `.scratch/guestbook/spec.md`.

**Blocked by:** 01 (Create and list Entries)

**Status:** ready-for-agent

- [ ] Entries module exposes `updateMessage(id, password, message)` returning `ok` | `invalid` | `wrong-password` | `not-found`
- [ ] Only the Message changes; Author name, Password and `created_at` are untouched; `updated_at` is set
- [ ] Edited Entries show "(수정됨)"
- [ ] Wrong Password leaves the Message unchanged and shows the refusal in that card
- [ ] Edited Message obeys the 1–500 rule
- [ ] Tests: wrong Password refused and unchanged; right Password changes Message and marks Edited; unknown id → `not-found`
