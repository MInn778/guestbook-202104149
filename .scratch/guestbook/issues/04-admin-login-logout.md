# 04: Admin login and logout

**What to build:** In the top-right of the header there is an [관리자] control. Clicking it reveals an Admin password field; the correct password (from `ADMIN_PASSWORD`) logs the Admin in and the control becomes [로그아웃]. A wrong password shows "관리자 비밀번호가 일치하지 않습니다". The session lasts until logout or the browser closes. See `.scratch/guestbook/spec.md`.

**Blocked by:** 01 (Create and list Entries)

**Status:** ready-for-agent

- [ ] Login compares against `ADMIN_PASSWORD` with a timing-safe comparison
- [ ] Success sets an httpOnly, `sameSite=lax`, `secure`-in-production session cookie (no max-age) holding an HMAC signed with `ADMIN_PASSWORD`
- [ ] The page decides Admin state by verifying the cookie on the server; a forged or stale cookie is treated as not logged in
- [ ] Logout clears the cookie
- [ ] Wrong password shows the refusal and sets no cookie
- [ ] `ADMIN_PASSWORD` documented as required in Vercel env vars (not its value)
