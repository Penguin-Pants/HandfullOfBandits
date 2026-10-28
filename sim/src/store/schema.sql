-- Migration 001: playtest store (06 s3, 07 s3 to s5). Never edit after merge; add a new migration.
-- JSON columns hold canonical JSON text. `content` columns hold gzip of canonical JSON.
-- Timestamps are ISO 8601 UTC text from the store clock.

CREATE TABLE package_versions (
  package_hash TEXT PRIMARY KEY,
  package_id TEXT NOT NULL,
  version TEXT NOT NULL,
  ruleset_version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  parent_version TEXT,
  change_description TEXT,
  content BLOB NOT NULL,
  app_version TEXT NOT NULL,
  stored_at TEXT NOT NULL
) STRICT;

CREATE TABLE sessions (
  session_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  package_hash TEXT NOT NULL REFERENCES package_versions (package_hash),
  scenario_id TEXT NOT NULL,
  seed INTEGER NOT NULL CHECK (seed >= 0),
  options TEXT NOT NULL,
  app_version TEXT NOT NULL,
  code_fingerprint TEXT NOT NULL,
  modules TEXT NOT NULL,
  excluded_cards TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'ended', 'abandoned', 'readOnly')),
  current_branch_id TEXT NOT NULL,
  head_action_id TEXT,
  result TEXT,
  notes TEXT NOT NULL DEFAULT ''
) STRICT;

CREATE TABLE branches (
  branch_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions (session_id),
  forked_from_action_id TEXT,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE states (
  state_hash TEXT PRIMARY KEY,
  content BLOB NOT NULL,
  derived TEXT NOT NULL
) STRICT;

CREATE TABLE actions (
  action_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions (session_id),
  branch_id TEXT NOT NULL REFERENCES branches (branch_id),
  seq INTEGER NOT NULL,
  branch_seq INTEGER NOT NULL,
  kind TEXT NOT NULL CHECK (kind IN ('cardChoice', 'pivotal', 'propagandaChoice', 'advance', 'setup')),
  faction TEXT,
  card_id TEXT,
  campaign TEXT,
  propaganda_round INTEGER NOT NULL,
  card_index INTEGER NOT NULL,
  phase TEXT NOT NULL,
  box TEXT,
  summary TEXT NOT NULL,
  state_hash_before TEXT REFERENCES states (state_hash),
  state_hash_after TEXT NOT NULL REFERENCES states (state_hash),
  status TEXT NOT NULL CHECK (status IN ('committed', 'undone', 'pending')),
  undone_by TEXT,
  created_at TEXT NOT NULL,
  UNIQUE (session_id, seq),
  UNIQUE (branch_id, branch_seq)
) STRICT;

CREATE TABLE commands (
  command_id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL REFERENCES actions (action_id),
  n INTEGER NOT NULL,
  type TEXT NOT NULL,
  payload TEXT NOT NULL,
  validation TEXT NOT NULL,
  rng_before TEXT NOT NULL,
  UNIQUE (action_id, n)
) STRICT;

CREATE TABLE log_entries (
  entry_id TEXT PRIMARY KEY,
  action_id TEXT NOT NULL REFERENCES actions (action_id),
  n INTEGER NOT NULL,
  kind TEXT NOT NULL,
  state_seq INTEGER NOT NULL,
  rule_ref TEXT,
  assumption_ref TEXT,
  data TEXT NOT NULL,
  text TEXT NOT NULL,
  UNIQUE (action_id, n)
) STRICT;

CREATE TABLE categories (
  category_id TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  hotkey TEXT,
  color TEXT,
  sort INTEGER NOT NULL,
  active INTEGER NOT NULL DEFAULT 1 CHECK (active IN (0, 1))
) STRICT;

-- 07 s3 to s5. `context` is the 07 s4 object. `category_ids` is a JSON list; empty means `general`.
CREATE TABLE annotations (
  annotation_id TEXT PRIMARY KEY,
  session_id TEXT NOT NULL REFERENCES sessions (session_id),
  branch_id TEXT NOT NULL REFERENCES branches (branch_id),
  action_id TEXT REFERENCES actions (action_id),
  anchor TEXT NOT NULL CHECK (anchor IN ('executed', 'proposed', 'decision', 'state', 'session', 'debrief')),
  state_hash TEXT REFERENCES states (state_hash),
  decision_id TEXT,
  executed_as TEXT REFERENCES actions (action_id),
  context TEXT NOT NULL,
  category_ids TEXT NOT NULL,
  text TEXT NOT NULL,
  severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'addressed', 'wontfix')),
  addressed_in_version TEXT,
  tags TEXT NOT NULL DEFAULT '[]',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
) STRICT;

-- 07 s3: one debrief per session.
CREATE UNIQUE INDEX annotations_one_debrief ON annotations (session_id) WHERE anchor = 'debrief';
CREATE INDEX annotations_by_action ON annotations (action_id);

-- 06 s5 item 3: each edit keeps the previous text.
CREATE TABLE annotation_revisions (
  annotation_id TEXT NOT NULL REFERENCES annotations (annotation_id),
  n INTEGER NOT NULL,
  text TEXT NOT NULL,
  replaced_at TEXT NOT NULL,
  PRIMARY KEY (annotation_id, n)
) STRICT;

CREATE TABLE regression_cases (
  case_id TEXT PRIMARY KEY,
  source_session_id TEXT REFERENCES sessions (session_id),
  source_action_id TEXT REFERENCES actions (action_id),
  source_annotation_id TEXT REFERENCES annotations (annotation_id),
  package_hash TEXT NOT NULL REFERENCES package_versions (package_hash),
  seed INTEGER NOT NULL,
  scenario_id TEXT NOT NULL,
  options TEXT NOT NULL,
  command_range TEXT NOT NULL,
  expectations TEXT NOT NULL,
  label TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

CREATE TABLE regression_runs (
  run_id TEXT PRIMARY KEY,
  case_id TEXT NOT NULL REFERENCES regression_cases (case_id),
  target_package_hash TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('same', 'changed', 'incompatible', 'error')),
  first_failure TEXT,
  diff TEXT NOT NULL,
  created_at TEXT NOT NULL
) STRICT;

-- 06 s3.12: one row per session, branch and Propaganda round. Rebuilt from states.
CREATE TABLE metrics (
  session_id TEXT NOT NULL REFERENCES sessions (session_id),
  branch_id TEXT NOT NULL REFERENCES branches (branch_id),
  propaganda_round INTEGER NOT NULL,
  action_id TEXT NOT NULL REFERENCES actions (action_id),
  data TEXT NOT NULL,
  PRIMARY KEY (session_id, branch_id, propaganda_round)
) STRICT;

-- 07 s5 seed list.
INSERT INTO categories (category_id, label, hotkey, sort) VALUES
  ('balance', 'Balance concern', 'Alt+1', 1),
  ('rule-ambiguity', 'Rule ambiguity', 'Alt+2', 2),
  ('historical', 'Unrealistic historical behavior', 'Alt+3', 3),
  ('dull-decision', 'Uninteresting decision', 'Alt+4', 4),
  ('overpowered', 'Overpowered action', 'Alt+5', 5),
  ('underpowered', 'Underpowered action', 'Alt+6', 6),
  ('missing-mechanic', 'Missing mechanic', 'Alt+7', 7),
  ('pacing', 'Game pacing', 'Alt+8', 8),
  ('event-card', 'Event-card issue', 'Alt+9', 9),
  ('victory', 'Victory-condition issue', NULL, 10),
  ('ui', 'User interface issue', NULL, 11),
  ('bug', 'Software bug', NULL, 12),
  ('idea', 'Improvement idea', NULL, 13),
  ('general', 'General observation', NULL, 14),
  ('alternative', 'Best alternative and why', NULL, 15);
