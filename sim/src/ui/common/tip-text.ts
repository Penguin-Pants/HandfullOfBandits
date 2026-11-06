// Tooltip text to readable parts (R7): one paragraph per sentence and the trailing rule cite, for
// example `(06 s2.1)`, kept apart as a footer.

export interface TipParts {
  readonly paragraphs: readonly string[];
  /** The closing `(NN sX.Y)` cite without the brackets, or null. */
  readonly cite: string | null;
}

const CITE = /\s*\((\d{2} s[^()]*)\)\.?\s*$/;
const SENTENCE_END = /(?<=[.!?])\s+(?=[A-Z])/;

export function tipParts(text: string): TipParts {
  const cite = CITE.exec(text);
  const head = (cite === null ? text : text.slice(0, cite.index)).trim();
  // Without the cite the last sentence may have lost its full stop: put it back.
  const body = cite === null || head === "" || /[.!?]$/.test(head) ? head : `${head}.`;
  return { paragraphs: body === "" ? [] : body.split(SENTENCE_END), cite: cite?.[1] ?? null };
}
