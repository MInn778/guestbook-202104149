-- Run once in the Neon SQL Editor.
CREATE TABLE IF NOT EXISTS entries (
  id            serial PRIMARY KEY,
  author_name   text        NOT NULL,
  message       text        NOT NULL,
  password_hash text        NOT NULL, -- "salt:hash" (scrypt, hex)
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz,          -- set when Edited
  removed_at    timestamptz           -- set when Removed by the Admin (ADR 0001)
);
