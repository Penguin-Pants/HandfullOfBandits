// Classic menu bar (UI simplification): drop-down menus for every non-game feature. ARIA menubar
// pattern: Left and Right move between menus, Up and Down between items, Enter or Space runs an
// item, Esc closes the menu. Keys handled here do not reach the page shortcuts (Esc clears a plan).
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface MenuItem {
  readonly label: string;
  /** Shown at the right of the item, e.g. "Ctrl+Z". The key handler lives with the feature. */
  readonly shortcut?: string;
  /** Set for a checkbox item (or a radio item with `radio`). */
  readonly checked?: boolean;
  readonly radio?: boolean;
  readonly disabled?: boolean;
  readonly onSelect: () => void;
}
export interface Menu {
  readonly label: string;
  readonly items: readonly (MenuItem | "separator")[];
}

const ariaKeys = (shortcut: string): string => shortcut.replace(/^Ctrl\+/, "Control+");

export function MenuBar({ menus, status }: { readonly menus: readonly Menu[]; readonly status?: ReactNode }) {
  const [open, setOpen] = useState<number | null>(null);
  const bar = useRef<HTMLDivElement>(null);
  const tops = useRef<(HTMLButtonElement | null)[]>([]);
  /** Focus the first item after a keyboard open; a click open keeps focus on the menu name. */
  const focusFirst = useRef(false);

  useEffect(() => {
    if (open === null) return;
    const outside = (e: PointerEvent): void => { if (!bar.current?.contains(e.target as Node)) setOpen(null); };
    document.addEventListener("pointerdown", outside);
    return () => { document.removeEventListener("pointerdown", outside); };
  }, [open]);
  useEffect(() => {
    if (open === null || !focusFirst.current) return;
    focusFirst.current = false;
    firstItem()?.focus();
  }, [open]);

  const firstItem = (): HTMLElement | null | undefined => bar.current?.querySelector<HTMLElement>('[role="menu"] [role^="menuitem"]:not([aria-disabled="true"])');
  const openAt = (i: number, withFocus: boolean): void => {
    const n = (i + menus.length) % menus.length;
    // Already open (a click opened it): no new render runs the focus effect, so focus now.
    if (open === n && withFocus) { firstItem()?.focus(); return; }
    focusFirst.current = withFocus;
    setOpen(n);
    if (!withFocus) tops.current[n]?.focus();
  };
  const close = (): void => {
    const at = open;
    setOpen(null);
    if (at !== null) tops.current[at]?.focus();
  };
  const onTopKey = (i: number) => (e: KeyboardEvent): void => {
    if (["ArrowDown", "Enter", " "].includes(e.key)) { e.preventDefault(); e.stopPropagation(); openAt(i, true); }
    else if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault(); e.stopPropagation();
      const next = i + (e.key === "ArrowRight" ? 1 : -1);
      if (open === null) tops.current[(next + menus.length) % menus.length]?.focus();
      else openAt(next, true);
    } else if (e.key === "Escape" && open !== null) { e.stopPropagation(); close(); }
  };
  const onMenuKey = (i: number) => (e: KeyboardEvent<HTMLDivElement>): void => {
    const items = [...e.currentTarget.querySelectorAll<HTMLElement>('[role^="menuitem"]:not([aria-disabled="true"])')];
    const at = items.indexOf(document.activeElement as HTMLElement);
    const step = (by: number): void => { items[(at + by + items.length) % items.length]?.focus(); };
    const keys: Record<string, () => void> = {
      ArrowDown: () => { step(1); },
      ArrowUp: () => { step(-1); },
      Home: () => { items[0]?.focus(); },
      End: () => { items.at(-1)?.focus(); },
      ArrowRight: () => { openAt(i + 1, true); },
      ArrowLeft: () => { openAt(i - 1, true); },
      Escape: close,
      Tab: () => { setOpen(null); },
    };
    const run = keys[e.key];
    if (run === undefined) return;
    if (e.key !== "Tab") e.preventDefault();
    e.stopPropagation();
    run();
  };
  const select = (item: MenuItem): void => {
    if (item.disabled === true) return;
    close();
    item.onSelect();
  };

  return (
    <div ref={bar} className="menubar" role="menubar" aria-label="Menu bar">
      {menus.map((menu, i) => (
        <div key={menu.label} className="menubar-menu">
          <button
            ref={(el) => { tops.current[i] = el; }}
            type="button"
            role="menuitem"
            aria-haspopup="menu"
            aria-expanded={open === i}
            tabIndex={i === 0 ? 0 : -1}
            onClick={() => { if (open === i) setOpen(null); else openAt(i, false); }}
            onPointerEnter={() => { if (open !== null && open !== i) openAt(i, false); }}
            onKeyDown={onTopKey(i)}
          >
            {menu.label}
          </button>
          {open === i && (
            <div className="menu" role="menu" aria-label={menu.label} onKeyDown={onMenuKey(i)}>
              {menu.items.map((item, k) => item === "separator" ? <div key={`s${String(k)}`} role="separator" /> : (
                <button
                  key={item.label}
                  type="button"
                  role={item.checked === undefined ? "menuitem" : item.radio === true ? "menuitemradio" : "menuitemcheckbox"}
                  aria-checked={item.checked}
                  aria-disabled={item.disabled === true ? true : undefined}
                  aria-keyshortcuts={item.shortcut === undefined ? undefined : ariaKeys(item.shortcut)}
                  tabIndex={-1}
                  onClick={() => { select(item); }}
                >
                  <span className="menu-check" aria-hidden="true">{item.checked === true ? (item.radio === true ? "●" : "✓") : ""}</span>
                  <span className="menu-label">{item.label}</span>
                  {item.shortcut !== undefined && <kbd aria-hidden="true">{item.shortcut}</kbd>}
                </button>
              ))}
            </div>
          )}
        </div>
      ))}
      {status !== undefined && <div className="menubar-status">{status}</div>}
    </div>
  );
}
