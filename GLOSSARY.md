# Guestbook

A mini guestbook where anyone can leave an entry without signing up; a per-entry password is the only proof of authorship.

## Language

**Entry**:
One post in the guestbook, made of an author name, a message, a password, and its creation time.
_Avoid_: Post, 글, comment, article

**Message**:
The body text of an Entry; the only part of an Entry that can be edited.
_Avoid_: Content, body, text

**Author name**:
The name the writer types when leaving an Entry; it is not tied to any account.
_Avoid_: User, username, nickname

**Password**:
The secret the writer sets when leaving an Entry; knowing it is what makes someone allowed to edit or delete that Entry.
_Avoid_: PIN, key, token

**Edited**:
The state of an Entry whose Message has been changed at least once after creation.
_Avoid_: Modified, updated

## Moderation

**Admin**:
The single guestbook operator who can remove and restore any Entry but can never change a Message.
_Avoid_: Moderator, manager, superuser

**Delete**:
An author, using the Entry's Password, erasing their own Entry so it disappears from the list entirely.
_Avoid_: Remove (reserved for the Admin action)

**Removed**:
The state of an Entry taken down by the Admin; everyone sees only a "관리자에 의해 삭제된 글입니다" notice in its place, and its author can no longer edit or delete it.
_Avoid_: Deleted, hidden, banned

**Restore**:
The Admin bringing a Removed Entry back to exactly its state before removal, including its author's ability to edit or delete it.
_Avoid_: Undelete, recover
