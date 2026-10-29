// Note bar (07 s2 to s5): `N` opens it anywhere outside a text field; type text, `#category` or
// Alt+1 to Alt+9; Enter saves; Esc cancels; Tab cycles the anchor. It captures keys only while
// focused, so plan entry keeps its keys (11 P2-16 risk). Closed, it is one button (UC-4).
import { useEffect, useRef, useState } from "react";
import type { CategoryRow, NoteInput } from "../api.ts";
import { hashCategories, type defaultAnchor } from "./anchor.ts";

const ANCHORS: readonly NoteInput["anchor"][] = ["executed", "proposed", "state", "session"];

export interface NoteBarProps {
  readonly categories: readonly CategoryRow[];
  /** Anchor at open time. */
  readonly anchor: () => ReturnType<typeof defaultAnchor>;
  readonly focus: () => NoteInput["focus"];
  readonly onSave: (note: NoteInput) => Promise<string>;
}

export function NoteBar({ categories, anchor, focus, onSave }: NoteBarProps) {
  const input = useRef<HTMLTextAreaElement>(null);
  const [open, setOpen] = useState<{ anchor: ReturnType<typeof defaultAnchor>; focus: NoteInput["focus"]; executedId: string | null } | null>(null);
  const [text, setText] = useState("");
  const [picked, setPicked] = useState<string[]>([]);
  const [saved, setSaved] = useState<string | null>(null);

  /** Open at the current anchor; keep its action ID so Tab can return to it. */
  const start = (): void => {
    const at = anchor();
    setOpen({ anchor: at, focus: focus(), executedId: at.actionId });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const t = e.target as HTMLElement | null;
      if (t !== null && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        start();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => { window.removeEventListener("keydown", onKey); };
  }, [anchor, focus]);

  // Collapsed to a button while closed (UC-4); focus the text box once it renders.
  const isOpen = open !== null;
  useEffect(() => {
    if (isOpen) input.current?.focus();
  }, [isOpen]);

  const close = (): void => {
    setOpen(null);
    setText("");
    setPicked([]);
  };
  const save = async (): Promise<void> => {
    if (open === null || text.trim() === "") return;
    const ids = categories.map((c) => c.category_id);
    const categoryIds = [...new Set([...picked, ...hashCategories(text, ids)])];
    const { proposed, ...where } = open.anchor;
    await onSave({ ...where, ...(proposed === undefined ? {} : { proposed }), text, categoryIds, focus: open.focus });
    setSaved(open.anchor.actionId === null ? `Saved (${open.anchor.anchor})` : `Saved, linked to ${open.anchor.actionId}`);
    setTimeout(() => { setSaved(null); }, 2000);
    close();
  };
  const onKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void save();
    } else if (e.key === "Escape") {
      close();
    } else if (e.key === "Tab" && open !== null) {
      e.preventDefault();
      const next = ANCHORS[(ANCHORS.indexOf(open.anchor.anchor) + 1) % ANCHORS.length] ?? "session";
      setOpen({ ...open, anchor: { ...open.anchor, anchor: next, actionId: next === "executed" ? open.executedId : null } });
    } else if (e.altKey && /^[1-9]$/.test(e.key)) {
      e.preventDefault();
      const cat = categories.find((c) => c.hotkey === `Alt+${e.key}`)?.category_id;
      if (cat !== undefined) setPicked(picked.includes(cat) ? picked.filter((c) => c !== cat) : [...picked, cat]);
    }
  };

  if (open === null) {
    return (
      <footer className="note-closed" aria-label="Note bar">
        {saved !== null && <strong role="status">{saved}</strong>}
        <button type="button" onClick={start}>
          Note (N)
        </button>
      </footer>
    );
  }
  return (
    <footer className="panel" aria-label="Note bar">
      <div className="row">
        <span className="muted">{`Note on: ${open.anchor.anchor}${open.anchor.actionId === null ? "" : ` (${open.anchor.actionId})`}`}</span>
        {picked.map((c) => (
          <span key={c}>#{c}</span>
        ))}
      </div>
      <textarea
        ref={input}
        aria-label="Note text"
        rows={2}
        style={{ width: "100%" }}
        value={text}
        onChange={(e) => { setText(e.target.value); }}
        onKeyDown={onKeyDown}
      />
    </footer>
  );
}
