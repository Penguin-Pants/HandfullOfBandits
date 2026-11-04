// A ceasefire breach warning needs a second yes before commit (05 s4 item 6; docs/prototype/30 s1.3).
export function confirmWarnings(warnings: readonly { readonly message: string }[]): boolean {
  return warnings.length === 0 || window.confirm(`${warnings.map((w) => w.message).join("\n")}\nCommit anyway?`);
}
