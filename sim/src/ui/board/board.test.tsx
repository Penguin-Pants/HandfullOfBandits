// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { turnOf } from "../../../test/board.ts";
import { kurdish } from "../../../test/kurdish-package.ts";
import { boardView } from "../../server/view.ts";
import { StatusBar } from "../status/StatusBar.tsx";
import { Board, SpaceDetail } from "./Board.tsx";

// P2-14: the board draws every location from the server view model; selection and detail card.
afterEach(cleanup);
const view = boardView(kurdish.ruleset, kurdish.data, turnOf("pkk"));

describe("Board", () => {
  it("draws all 18 locations with their pieces", () => {
    render(<Board view={view} selected={[]} onSelect={vi.fn()} />);
    expect(screen.getAllByRole("button")).toHaveLength(18);
    expect(screen.getByLabelText("guerrilla underground 3")).toBeTruthy();
  });

  it("selects on click and adds with Shift", () => {
    const onSelect = vi.fn();
    render(<Board view={view} selected={["botan"]} onSelect={onSelect} />);
    fireEvent.click(screen.getByRole("button", { name: "Hakkari" }), { shiftKey: true });
    expect(onSelect).toHaveBeenCalledWith("hakkari", true);
    expect(screen.getByRole("button", { name: "Botan" }).getAttribute("aria-pressed")).toBe("true");
  });

  it("shows the detail card and the status bar", () => {
    const botan = view.spaces.find((s) => s.id === "botan");
    if (botan === undefined) throw new Error("botan");
    render(
      <>
        <SpaceDetail space={botan} />
        <StatusBar view={view} />
      </>,
    );
    expect(screen.getByText(/Level: passiveOpposition/)).toBeTruthy();
    expect(screen.getByText(/score 21\/49 \(-28\)/)).toBeTruthy();
  });
});
