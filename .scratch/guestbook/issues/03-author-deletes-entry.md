# 03: Author deletes Entry

**What to build:** On any Entry card, the author clicks [삭제], enters the Password, confirms "정말 삭제할까요?", and the Entry disappears from the list entirely. A wrong Password is refused and the card shows "비밀번호가 일치하지 않습니다". If the Entry no longer exists, "이미 삭제된 글입니다" is shown and the list refreshes. See `.scratch/guestbook/spec.md`.

**Blocked by:** 01 (Create and list Entries)

**Status:** ready-for-agent

- [ ] Entries module exposes `deleteEntry(id, password)` returning `ok` | `wrong-password` | `not-found`
- [ ] Delete removes the row (hard delete, per ADR 0001)
- [ ] `confirm("정말 삭제할까요?")` shown before the request; cancelling does nothing
- [ ] Wrong Password leaves the Entry in place and shows the refusal in that card
- [ ] Tests: wrong Password refused and Entry still listed; right Password removes it from the list; unknown id → `not-found`
