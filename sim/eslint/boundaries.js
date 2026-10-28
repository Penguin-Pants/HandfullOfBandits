// Local ESLint rule: module boundaries from 03-architecture.md s5.
// A layer is the folder under the last `src/` (two levels for `engine/`).
// `values`: layers a file may import at runtime.
// `types`: layers a file may import with `import type` / `export type` only.
import { dirname, resolve, sep } from "node:path";

const core = "engine/core";
const coin = "engine/coin";
const modules = "engine/modules";
const registry = "engine/modules/registry";
const engine = [core, coin, modules];
const services = ["package", "store", "annotate", "export"];

const layers = {
  [core]: { values: [core] },
  [coin]: { values: [core, coin] },
  [modules]: { values: engine },
  package: { values: ["package", core, registry] },
  store: { values: ["store"], types: [core] },
  annotate: { values: ["annotate"], types: [core] },
  export: { values: ["export", "store", "annotate"] },
  server: { values: [...engine, ...services, "server"] },
  cli: { values: [...engine, ...services, "cli"] },
  ui: { values: ["ui"], types: [...services, "server"] },
  root: { values: [...engine, ...services, "server", "cli", "ui"] },
};
// The registry is part of engine/modules. It is separate only so `package` can import it.
layers[registry] = layers[modules];

// Engine purity (05 s8): no package or Node API except hashing from node:crypto.
const engineBareImports = new Set(["node:crypto", "crypto"]);
const hashNames = new Set(["createHash", "hash"]);

function layerOf(file) {
  const parts = file.split(sep);
  const src = parts.lastIndexOf("src");
  if (src === -1) return null;
  const rest = parts.slice(src + 1);
  if (rest.length === 1) return "root";
  if (rest[0] !== "engine") return rest[0];
  if (rest[1] === "modules" && rest[2]?.startsWith("registry")) return registry;
  return `engine/${rest[1]}`;
}

function constantSource(node) {
  if (node.type === "Literal") return node.value;
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) return node.quasis[0].value.cooked;
  return null;
}

function allows(list, target) {
  return list.includes(target) || (target === registry && list.includes(modules));
}

const rule = {
  meta: {
    type: "problem",
    docs: { description: "Enforce module boundaries and engine purity" },
    schema: [],
  },
  create(context) {
    const from = layerOf(context.filename);
    if (from === null) return {};
    const rules = layers[from];
    if (rules === undefined) {
      return {
        Program(node) {
          context.report({ node, message: `Folder "${from}" is not a layer in 03 s5.` });
        },
      };
    }

    function check(node, source, typeOnly, specifiers) {
      if (typeof source !== "string") {
        context.report({ node, message: "Import source must be a constant string so its layer can be checked (03 s5)." });
        return;
      }
      if (!source.startsWith(".")) {
        if (!from.startsWith("engine/")) return;
        if (!engineBareImports.has(source)) {
          context.report({ node, message: `Engine code may not import "${source}" (05 s8).` });
          return;
        }
        for (const spec of specifiers) {
          const name = spec.imported?.name ?? spec.imported?.value;
          if (spec.type !== "ImportSpecifier" || !hashNames.has(name)) {
            context.report({ node, message: `Engine code may import only hash functions from "${source}" (05 s8).` });
          }
        }
        return;
      }
      const target = layerOf(resolve(dirname(context.filename), source));
      if (target === null || layers[target] === undefined) {
        context.report({ node, message: `Import "${source}" is outside the layers in 03 s5.` });
      } else if (target !== from && !allows(rules.values, target)) {
        if (typeOnly && allows(rules.types ?? [], target)) return;
        context.report({ node, message: `Layer "${from}" may not import "${target}" (03 s5).` });
      }
    }

    return {
      ImportDeclaration(node) {
        check(node, node.source.value, node.importKind === "type", node.specifiers);
      },
      ExportNamedDeclaration(node) {
        if (node.source) check(node, node.source.value, node.exportKind === "type", [{ type: "export" }]);
      },
      ExportAllDeclaration(node) {
        check(node, node.source.value, node.exportKind === "type", [{ type: "export" }]);
      },
      ImportExpression(node) {
        check(node, constantSource(node.source), false, [{ type: "dynamic" }]);
      },
    };
  },
};

export default { rules: { boundaries: rule } };
