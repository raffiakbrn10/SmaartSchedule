import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Navbar } from "./Navbar.jsx";
import React from "react";

vi.mock("./ThemeToggle", () => ({
  ThemeToggle: () => <div data-testid="theme-toggle" />,
}));

describe("Navbar", () => {
  it("renders Navbar elements and responds to menu click", () => {
    const onMenuClickMock = vi.fn();
    render(<Navbar onMenuClick={onMenuClickMock} />);

    expect(screen.getByText("SmartSchedule")).toBeInTheDocument();
    expect(screen.getByTestId("theme-toggle")).toBeInTheDocument();

    const menuButton = screen.getByRole("button", { name: "Buka menu" });
    fireEvent.click(menuButton);
    expect(onMenuClickMock).toHaveBeenCalledOnce();
  });
});
