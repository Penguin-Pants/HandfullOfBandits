// @vitest-environment jsdom
// Audit Plan 4 V2: the setup editor screen. Edits become an overlay the server checks; issues show
// in their row; totals are live; save, reset, open, import and export work.
import { cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { mockApi, okPackage } from "../../../test/ui/mock-api.ts";
import { ApiError, type SetupBase, type VariantCheck } from "../api.ts";
import type { PackageIssue } from "../../package/validate.ts";
import { changeText, faceCount, rowOf, setKey, Setup, withFace } from "./Setup.tsx";

afterEach(cleanup);

const setup: SetupBase = {
  packageHash: "a".repeat(64),
  scenario: "short",
  spaces: [
    { id: "town", name: "Town", kind: "domestic", hasSupportScale: true },
    { id: "camp", name: "Camp", kind: "external", hasSupportScale: false },
  ],
  pieces: [
    { id: "police", faction: "state", count: 5, faces: [], placedAs: null },
    { id: "guerrilla", faction: "pkk", count: 6, faces: ["underground", "active"], placedAs: "underground" },
  ],
  factions: [{ id: "state", name: "State" }, { id: "pkk", name: "PKK" }],
  tracks: [{ id: "resources.state", display: "State Resources", kind: "numeric", min: 0, max: 40, steps: [] }],
  levelRange: 2,
  values: { thresholds: { state: 10, pkk: 8 }, tracks: { "resources.state": 5 }, spaces: { town: { level: 1, pieces: { police: 2 } }, camp: { pieces: { guerrilla: 3 } } }, outOfPlay: {} },
};
const police = setup.pieces[0] ?? (() => { throw new Error("fixture"); })();
const guerrilla = setup.pieces[1] ?? (() => { throw new Error("fixture"); })();
const pkg = { ...okPackage, variants: [{ name: "saved", ok: true, hash: "c".repeat(64), issues: [] }] };

const result = (overlay: unknown, issues: PackageIssue[] = []): VariantCheck => ({ overlay, yaml: "scenario: short\n", ok: !issues.some((i) => i.level === "error"), hash: "b".repeat(64), issues, changes: [], setup });
const issue = (path: string, id: string, message: string): PackageIssue => ({ level: "error", code: path === "" ? "V-PIECES" : "V-STACK", file: "variants/draft.yaml", path, id, message });

function renderSetup(checkVariant = vi.fn((body: { overlay?: unknown; name?: string; text?: string }) => Promise.resolve(result(body.overlay ?? { scenario: "short", thresholds: { state: 12 } }))), saveVariant = vi.fn()) {
  render(<Setup api={mockApi({ checkVariant, saveVariant })} pkg={pkg} scenarioId="short" onBack={vi.fn()} />);
  return { checkVariant, saveVariant };
}

describe("setup editor helpers", () => {
  it("reads and writes face counts, bare when only the placed face is used", () => {
    expect(faceCount({ pieces: { guerrilla: 3 } }, guerrilla, "underground")).toBe(3);
    expect(faceCount({ pieces: { guerrilla: 3 } }, guerrilla, "active")).toBe(0);
    expect(withFace({ pieces: { guerrilla: 3 } }, guerrilla, "active", 1)).toEqual({ pieces: { guerrilla: { underground: 3, active: 1 } } });
    expect(withFace({ pieces: { guerrilla: { underground: 3, active: 1 } } }, guerrilla, "active", 0)).toEqual({ pieces: { guerrilla: 3 } });
    expect(withFace({ level: 1, pieces: { police: 2 } }, police, "", 0)).toEqual({ level: 1 });
  });

  it("keeps only changes in the overlay", () => {
    expect(setKey({ scenario: "s" }, "thresholds", "state", 12, 10)).toEqual({ scenario: "s", thresholds: { state: 12 } });
    expect(setKey({ scenario: "s", thresholds: { state: 12 } }, "thresholds", "state", 10, 10)).toEqual({ scenario: "s" });
  });

  it("maps each issue to its row", () => {
    expect(rowOf(issue("spaces.town.pieces", "town", "x"), ["police"])).toBe("space:town");
    expect(rowOf(issue("", "police", "x"), ["police"])).toBe("piece:police");
    expect(rowOf({ ...issue("thresholds.state", "state", "x"), code: "V-REF" }, ["police"])).toBe("threshold:state");
    expect(rowOf({ ...issue("base", "draft", "x"), code: "V-VARIANT" }, ["police"])).toBeNull();
  });

  it("writes changes in words", () => {
    expect(changeText({ kind: "piece", space: "town", id: "police", face: null, from: 2, to: 3 }, setup)).toBe("Town: Police 2 to 3");
    expect(changeText({ kind: "threshold", space: null, id: "state", face: null, from: 10, to: 12 }, setup)).toBe("State threshold 10 to 12");
    expect(changeText({ kind: "available", space: null, id: "police", face: null, from: 3, to: 2 }, setup)).toBe("Available Police 3 to 2");
  });
});

describe("Setup editor", () => {
  it("sends each edit as an overlay and shows live totals", async () => {
    const { checkVariant } = renderSetup();
    const cell = await screen.findByLabelText("Town Police");
    expect(screen.getByText("Police: 2 on map + 3 Available + 0 Out of Play = 5 of 5")).toBeTruthy();
    fireEvent.change(cell, { target: { value: "4" } });
    expect(checkVariant).toHaveBeenLastCalledWith({ dir: pkg.dir, overlay: { scenario: "short", spaces: { town: { level: 1, pieces: { police: 4 } } } } });
    expect(screen.getByText("Police: 4 on map + 1 Available + 0 Out of Play = 5 of 5")).toBeTruthy();
    fireEvent.change(screen.getByLabelText("State threshold"), { target: { value: "12" } });
    expect(checkVariant).toHaveBeenLastCalledWith({ dir: pkg.dir, overlay: { scenario: "short", spaces: { town: { level: 1, pieces: { police: 4 } } }, thresholds: { state: 12 } } });
  });

  it("shows each issue in its row and blocks Save on errors", async () => {
    const checkVariant = vi.fn(() => Promise.resolve(result({ scenario: "short" }, [issue("spaces.camp.pieces", "camp", "1 of police exceed the limit of 0"), issue("", "police", "7 on the map + 0 out of play = 7, but pieces.yaml has 5.")])));
    renderSetup(checkVariant);
    const camp = (await screen.findByText("Camp")).closest("tr");
    if (camp === null) throw new Error("no row");
    expect(within(camp).getByText(/exceed the limit of 0/)).toBeTruthy();
    const totals = screen.getByText(/^Police: /).closest("tr");
    if (totals === null) throw new Error("no totals row");
    expect(within(totals).getByText(/pieces.yaml has 5/)).toBeTruthy();
    fireEvent.change(screen.getByLabelText("Variant name"), { target: { value: "mine" } });
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save variant" }).disabled).toBe(true);
  });

  it("saves, offers Replace when the name exists, and resets", async () => {
    const saveVariant = vi.fn()
      .mockRejectedValueOnce(new ApiError(409, "Variant \"mine\" exists. Replace it or choose another name.", null))
      .mockResolvedValueOnce({ name: "mine", ok: true, hash: "d".repeat(64), issues: [] });
    const { checkVariant } = renderSetup(undefined, saveVariant);
    fireEvent.change(await screen.findByLabelText("Town Police"), { target: { value: "3" } });
    fireEvent.change(screen.getByLabelText("Variant name"), { target: { value: "mine" } });
    await waitFor(() => { expect(screen.getByRole<HTMLButtonElement>("button", { name: "Save variant" }).disabled).toBe(false); });
    fireEvent.click(screen.getByRole("button", { name: "Save variant" }));
    fireEvent.click(await screen.findByRole("button", { name: "Replace mine" }));
    await screen.findByText(/Saved variant mine/);
    expect(saveVariant).toHaveBeenLastCalledWith({ dir: pkg.dir, name: "mine", overlay: { scenario: "short", spaces: { town: { level: 1, pieces: { police: 3 } } } }, replace: true });
    fireEvent.click(screen.getByRole("button", { name: "Reset to package setup" }));
    expect(checkVariant).toHaveBeenLastCalledWith({ dir: pkg.dir, overlay: { scenario: "short" } });
  });

  it("opens a saved variant, imports YAML and exports the overlay", async () => {
    const { checkVariant } = renderSetup();
    fireEvent.change(await screen.findByLabelText("Open variant"), { target: { value: "saved" } });
    expect(checkVariant).toHaveBeenCalledWith({ dir: pkg.dir, name: "saved" });
    await waitFor(() => { expect(screen.getByLabelText<HTMLInputElement>("State threshold").value).toBe("12"); });
    expect(screen.getByLabelText<HTMLInputElement>("Variant name").value).toBe("saved");
    const file = new File(["scenario: short\n"], "x.yaml");
    fireEvent.change(screen.getByLabelText("Import YAML"), { target: { files: [file] } });
    await waitFor(() => { expect(checkVariant).toHaveBeenCalledWith({ dir: pkg.dir, text: "scenario: short\n" }); });
    expect(screen.getByRole("link", { name: "Export YAML" }).getAttribute("href")).toBe(`data:text/yaml;charset=utf-8,${encodeURIComponent("scenario: short\n")}`);
  });
});
