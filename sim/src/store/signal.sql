-- Migration 3 (11 P4-14; 07 s4.4): the category of the optional Propaganda prompt answers.
INSERT OR IGNORE INTO categories (category_id, label, hotkey, sort) VALUES ('legal-politics-signal', 'Legal Space or Offices changed a decision', NULL, 16);
