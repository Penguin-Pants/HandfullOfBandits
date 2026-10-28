// UI focus store (07 s4.1 ui_focus): what the user looks at when a note opens. The note bar
// freezes a copy at open time (07 s2 step 1).
import type { UiFocus } from "./api.ts";

export interface FocusStore {
  get(): UiFocus;
  set(patch: Partial<UiFocus>): void;
}

export function createFocusStore(): FocusStore {
  let focus: UiFocus = { panel: "board", selectedSpace: null, selectedPieces: [], hoveredActionId: null };
  return {
    get: () => focus,
    set(patch) {
      focus = { ...focus, ...patch };
    },
  };
}
