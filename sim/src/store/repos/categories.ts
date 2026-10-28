// categories (06 s3.9): seeded by migration 001 with the 07 s5 list.
import type { Db } from "../migrate.ts";

export interface CategoryRow {
  readonly category_id: string;
  readonly label: string;
  readonly hotkey: string | null;
  readonly color: string | null;
  readonly sort: number;
  readonly active: 0 | 1;
}

/** All categories in sort order, inactive ones included: existing notes keep them. */
export function listCategories(db: Db): CategoryRow[] {
  return db.prepare("SELECT * FROM categories ORDER BY sort").all() as CategoryRow[];
}
