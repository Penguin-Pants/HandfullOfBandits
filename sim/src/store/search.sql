-- Migration 002 (P3a-08): trigram FTS narrows substring candidates. Triggers keep edits in sync.
CREATE VIRTUAL TABLE annotations_fts USING fts5(text, content='annotations', content_rowid='rowid', tokenize='trigram');
INSERT INTO annotations_fts(annotations_fts) VALUES('rebuild');
CREATE TRIGGER annotations_fts_insert AFTER INSERT ON annotations BEGIN
  INSERT INTO annotations_fts(rowid, text) VALUES (new.rowid, new.text);
END;
CREATE TRIGGER annotations_fts_delete AFTER DELETE ON annotations BEGIN
  INSERT INTO annotations_fts(annotations_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
END;
CREATE TRIGGER annotations_fts_update AFTER UPDATE OF text ON annotations BEGIN
  INSERT INTO annotations_fts(annotations_fts, rowid, text) VALUES ('delete', old.rowid, old.text);
  INSERT INTO annotations_fts(rowid, text) VALUES (new.rowid, new.text);
END;
