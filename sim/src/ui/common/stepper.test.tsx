// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { Stepper } from "./Stepper.tsx";

afterEach(cleanup);

function Harness({ blank, max }: { blank?: string; max?: number }) {
  const [v, setV] = useState("");
  return <Stepper label="Guards" value={v} onChange={setV} {...(max === undefined ? {} : { max })} {...(blank === undefined ? {} : { blank })} />;
}

describe("Stepper (UC-5)", () => {
  it("counts up and down by buttons and never below 0", () => {
    render(<Harness />);
    const out = (): string => screen.getByRole("group", { name: "Guards" }).querySelector("output")?.textContent ?? "";
    expect(out()).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "More Guards" }));
    fireEvent.click(screen.getByRole("button", { name: "More Guards" }));
    expect(out()).toBe("2");
    fireEvent.click(screen.getByRole("button", { name: "Less Guards" }));
    fireEvent.click(screen.getByRole("button", { name: "Less Guards" }));
    expect(out()).toBe("0");
    expect(screen.getByRole<HTMLButtonElement>("button", { name: "Less Guards" }).disabled).toBe(true);
  });

  it("shows the blank word, steps to 0 from it and back, and stops at max", () => {
    render(<Harness blank="max" max={1} />);
    const out = (): string => screen.getByRole("group", { name: "Guards" }).querySelector("output")?.textContent ?? "";
    expect(out()).toBe("max");
    fireEvent.click(screen.getByRole("button", { name: "More Guards" }));
    expect(out()).toBe("0");
    fireEvent.click(screen.getByRole("button", { name: "More Guards" }));
    fireEvent.click(screen.getByRole("button", { name: "More Guards" }));
    expect(out()).toBe("1");
    fireEvent.click(screen.getByRole("button", { name: "Less Guards" }));
    fireEvent.click(screen.getByRole("button", { name: "Less Guards" }));
    expect(out()).toBe("max");
  });
});
