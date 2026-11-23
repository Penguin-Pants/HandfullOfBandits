-- Migration 5 (docs/23-Nov-26-Feedback-Prompt-Implementation-Plan.md, Phase 1): the category of "Report to Claude" notes.
INSERT OR IGNORE INTO categories (category_id, label, hotkey, sort) VALUES ('feedback', 'Report to Claude', NULL, 17);
