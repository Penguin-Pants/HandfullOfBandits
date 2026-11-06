// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { Tip } from "./Tip.tsx";

afterEach(cleanup);

describe("Tip layout", () => {
  it("shows the heading, one paragraph per sentence and the rule cite as a footer", async () => {
    render(<Tip heading="Train" text="Pick one option per space. Place up to 3 Troops. In one space you may pay for Civic Action (06 s2.1)."><button type="button">Train</button></Tip>);
    fireEvent.focus(screen.getByRole("button", { name: "Train" }));
    await waitFor(() => { expect(document.querySelector(".tip")).not.toBeNull(); });
    const tip = document.querySelector(".tip") as HTMLElement;
    expect(tip.querySelector(".tip-heading")?.textContent).toBe("Train");
    expect([...tip.querySelectorAll("p")].map((p) => p.textContent)).toEqual(["Pick one option per space.", "Place up to 3 Troops.", "In one space you may pay for Civic Action."]);
    expect(tip.querySelector(".tip-cite")?.textContent).toBe("Rule 06 s2.1");
  });

  it("opens from a span around a disabled button", async () => {
    render(<Tip text="No legal plan."><span className="tip-target"><button type="button" disabled>Sweep</button></span></Tip>);
    fireEvent.focus(document.querySelector(".tip-target") as HTMLElement);
    await waitFor(() => { expect(document.querySelector(".tip")?.textContent).toContain("No legal plan."); });
  });
});
