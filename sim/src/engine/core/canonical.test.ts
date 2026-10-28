import { describe, expect, it } from "vitest";
import { canonicalHash, canonicalJson } from "./canonical.ts";

// 05 s8 item 6: sorted keys, no undefined values, integers only, SHA-256 of the text.
// Known-answer hashes computed with Python hashlib over the UTF-8 text.

describe("canonicalJson", () => {
  it("sorts object keys at every level", () => {
    expect(canonicalJson({ b: 1, a: { y: null, x: true } })).toBe(
      '{"a":{"x":true,"y":null},"b":1}',
    );
  });

  it("keeps array order", () => {
    expect(canonicalJson([3, 1, 2])).toBe("[3,1,2]");
  });

  it("gives the same text for objects built in different key order", () => {
    expect(canonicalJson({ a: 1, b: 2 })).toBe(canonicalJson({ b: 2, a: 1 }));
  });

  it("writes strings as JSON with raw UTF-8", () => {
    expect(canonicalJson({ s: 'é "q"\n' })).toBe('{"s":"é \\"q\\"\\n"}');
  });

  it("writes negative zero as 0", () => {
    expect(canonicalJson(-0)).toBe("0");
  });

  it.each([
    ["a float", { a: 1.5 }, "$.a"],
    ["NaN", [Number.NaN], "$[0]"],
    ["Infinity", { a: [Number.POSITIVE_INFINITY] }, "$.a[0]"],
    ["an unsafe integer", { a: 2 ** 53 }, "$.a"],
    ["an undefined value", { a: undefined }, "$.a"],
    ["a sparse array", { a: Object.assign(new Array<number>(3), { 0: 1, 2: 3 }) }, "$.a[1]"],
    ["a bigint", { a: 1n }, "$.a"],
    ["a function", { a: () => 1 }, "$.a"],
    ["a Map", { a: new Map() }, "$.a"],
    ["a Date", { a: new Date(0) }, "$.a"],
    ["a class instance", { a: new (class Point {
      x = 1;
    })() }, "$.a"],
  ])("rejects %s with its path", (_name, value, path) => {
    expect(() => canonicalJson(value)).toThrow(path);
  });
});

describe("canonicalHash", () => {
  it.each([
    ["abc", "6cc43f858fbb763301637b5af970e2a46b46f461f27e5a0f41e009c59b827b25"],
    [{ b: 1, a: [2, "x"] }, "bbb8e7667558a86d3622dafcc40ea84605d1835a87b06ee47ea8adac48be8d7a"],
    [
      { b: [-3, 0, "é"], a: { y: null, x: true } },
      "74611426b92af45de9963bcebdf6928ff3692ae974d1b5459b3222f59cf13e3d",
    ],
  ])("hashes %j to its known SHA-256", (value, hash) => {
    expect(canonicalHash(value)).toBe(hash);
  });
});
