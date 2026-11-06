// Tooltip (UI clarity round R1, R7): Radix Tooltip, opens on hover and keyboard focus, closes with
// Esc. Empty text renders the child only. Each Tip carries its own provider, so it works in any
// tree (tests included). The text shows as short paragraphs under an optional heading, with a
// closing rule cite as a footer (tip-text.ts). A disabled button gets no pointer events: wrap it in
// a span.
import * as Tooltip from "@radix-ui/react-tooltip";
import type { ReactElement } from "react";
import { tipParts } from "./tip-text.ts";

export function Tip({ text, heading, children }: { readonly text: string | null; readonly heading?: string; readonly children: ReactElement }) {
  if (text === null || text === "") return children;
  const { paragraphs, cite } = tipParts(text);
  return (
    <Tooltip.Provider delayDuration={300}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>{children}</Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content className="tip" sideOffset={6} collisionPadding={8}>
            {heading !== undefined && <strong className="tip-heading">{heading}</strong>}
            {paragraphs.map((p, i) => (
              <p key={`${String(i)}-${p}`}>{p}</p>
            ))}
            {cite !== null && <span className="tip-cite">Rule {cite}</span>}
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
  );
}
