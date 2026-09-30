# Admin Remove is a soft delete; author Delete is a hard delete

An author Deleting their own Entry erases the row, because the author chose to take it back and nothing needs to remain. An Admin Removing an Entry only marks it (`removed_at`) and keeps the original data, because Removed Entries must show a "관리자에 의해 삭제된 글입니다" notice in place and must be Restorable to exactly their prior state (same Message, same Password, same position). The server, not the UI, strips author name, Message and time from Removed Entries before they reach non-Admin viewers, so the retained data never leaks.

## Considered Options

- Soft delete for both: rejected, author deletions have no notice to show and nothing to restore.
- Hard delete for Admin too (notice only, no Restore): rejected once Restore became a requirement.
