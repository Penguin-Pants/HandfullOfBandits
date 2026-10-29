// Tooltip (UI clarity round R7): Radix Tooltip, opens on hover and keyboard focus, closes with
// Esc. Empty text renders the child only. Each Tip carries its own provider, so it works in any
// tree (tests included).
import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";

export function Tip({ text, children }: { readonly text: string | null; readonly children: ReactElement }) {
  if (text === null || text === "") return children;
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tip" sideOffset={4}>
            {text}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
