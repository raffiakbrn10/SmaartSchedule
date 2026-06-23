import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeToggle } from "./ThemeToggle.jsx";
import { useTheme } from "../hooks/useTheme";
import React from "react";

vi.mock("../hooks/useTheme.js", () => ({
  useTheme: vi.fn(),
}));

describe("ThemeToggle", () => {
  it("renders light mode theme button and responds to click", () => {
    const toggleMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue(["light", toggleMock, true]);

    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute("aria-label", "Gunakan tema gelap");
    expect(button.textContent).toBe("🌙");

    fireEvent.click(button);
    expect(toggleMock).toHaveBeenCalledOnce();
  });

  it("renders dark mode theme button", () => {
    const toggleMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue(["dark", toggleMock, true]);

    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button).toHaveAttribute("aria-label", "Gunakan tema terang");
    expect(button.textContent).toBe("☀️");
  });

  it("renders blank or placeholder when not mounted yet", () => {
    const toggleMock = vi.fn();
    vi.mocked(useTheme).mockReturnValue(["dark", toggleMock, false]);

    render(<ThemeToggle />);
    const button = screen.getByRole("button");
    expect(button.textContent).not.toBe("☀️");
  });
});



