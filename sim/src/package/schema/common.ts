// Shared parts of the package schemas (04 s1, s3, s4).
// Objects are strict: an unknown key is an error, so a typo never passes silently.
// Numbers are safe integers only, so the package hash is canonical (05 s8 item 6).
// Cross-file references (V-REF and others) are checked by the loader (P1-05), not here.
import { z } from "zod";

/** Stable element ID (04 s1 item 2), for example `hakkari`, `resources.state`, `DK-001`. */
export const id = z.string().regex(/^[A-Za-z0-9][A-Za-z0-9._-]*$/, "IDs use letters, digits, '.', '_' and '-'");

export const text = z.string().min(1);

export const count = z.int().min(0);

/** Value of a competing option (04 s3 `options`, s4.10 `options`). */
export const optionValue = z.union([text, z.int()]);

/** List of unique items, at least `min` long. */
export function uniqueList<T extends z.ZodType>(item: T, min: number): z.ZodArray<T> {
  return z.array(item).min(min).refine((items) => new Set(items).size === items.length, "Items must be unique");
}

/** List of unique IDs, at least `min` long. */
export function idList(min: number): z.ZodArray<typeof id> {
  return uniqueList(id, min);
}

/** Inventory status (01 s4). `missing` blocks a session that can reach the element (04 s7). */
export const status = z.enum(["approved", "recommended", "tune", "competing", "unresolved", "missing"]);

/** Fields every rule element may carry (04 s1 item 4). */
export const ruleMeta = { source: text.optional(), status: status.optional() };

/** A list of elements with unique `id` fields. A duplicate fails at its own index. */
export function elementList<T extends z.ZodType<{ id: string }>>(element: T): z.ZodArray<T> {
  return z.array(element).superRefine((items, ctx) => {
    const seen = new Set<string>();
    items.forEach((item, index) => {
      if (seen.has(item.id)) {
        ctx.addIssue({ code: "custom", message: `Duplicate ID "${item.id}"`, path: [index, "id"] });
      }
      seen.add(item.id);
    });
  });
}
