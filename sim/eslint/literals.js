// Local ESLint rule: handlers hold no game numbers (04 s4.5, 11 P1-08).
// Every numeric literal other than 0, 1 and 2 is an error. A handler reads the value with
// param() instead. An exception needs an allow comment with a reason, either at the end of
// the line or alone on the line above: `// literal-ok: <reason>`.
const ALLOWED = new Set([0, 1, 2]);
const ALLOW = /^\s*literal-ok:(.*)$/;
const FIX = 'Read it with param() (04 s4.5) or allow it with "// literal-ok: <reason>".';

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Ban game numbers in handler code" },
    schema: [],
  },
  create(context) {
    const source = context.sourceCode;
    const allowedLines = new Set();
    for (const comment of source.getAllComments()) {
      const match = ALLOW.exec(comment.value);
      if (match === null) continue;
      if (match[1].trim() === "") {
        context.report({ loc: comment.loc, message: "An allow comment needs a reason: // literal-ok: <reason>." });
        continue;
      }
      const before = source.getTokenBefore(comment);
      const trailing = before !== null && before.loc.end.line === comment.loc.start.line;
      allowedLines.add(trailing ? comment.loc.start.line : comment.loc.end.line + 1);
    }

    return {
      Literal(node) {
        const value = node.bigint === undefined ? node.value : Number(node.bigint);
        if (typeof value !== "number" || ALLOWED.has(value) || allowedLines.has(node.loc.start.line)) return;
        context.report({ node, message: `Numeric literal ${node.raw} in a handler. ${FIX}` });
      },
    };
  },
};

export default { rules: { "no-game-literals": rule } };
