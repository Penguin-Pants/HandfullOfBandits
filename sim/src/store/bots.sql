-- Migration 4 (audit Plan 2 S1): bot seats per session and the decision record behind each bot command.
ALTER TABLE sessions ADD COLUMN seats TEXT NOT NULL DEFAULT '{}';

CREATE TABLE bot_decisions (
  action_id TEXT NOT NULL REFERENCES actions (action_id),
  n INTEGER NOT NULL,
  record TEXT NOT NULL,
  PRIMARY KEY (action_id, n)
) STRICT;
