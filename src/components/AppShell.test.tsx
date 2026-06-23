import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { AppShell } from "./AppShell.jsx";
import { useAuth } from "../context/AuthContext.js";
import { useRouter } from "next/navigation";
import React from "react";

vi.mock("../context/AuthContext.js", () => ({
  useAuth: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

vi.mock("./Loading", () => ({
  Loading: ({ label }: { label?: string }) => <div data-testid="loading">{label}</div>,
}));

vi.mock("./Navbar", () => ({
  Navbar: ({ onMenuClick }: { onMenuClick?: () => void }) => (
    <button data-testid="navbar" onClick={onMenuClick}>
      Navbar
    </button>
  ),
}));

vi.mock("./Sidebar", () => ({
  Sidebar: ({ open, onClose }: { open: boolean; onClose: () => void }) => (
    <div data-testid="sidebar" data-open={open ? "true" : "false"}>
      Sidebar
      <button onClick={onClose}>Close Sidebar</button>
    </div>
  ),
}));

describe("AppShell", () => {
  const replaceMock = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useRouter).mockReturnValue({ replace: replaceMock } as unknown as ReturnType<typeof useRouter>);
  });

  it("renders Loading spinner and redirects to /login when loading", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: true } as unknown as ReturnType<typeof useAuth>);

    render(<AppShell>Content</AppShell>);
    expect(screen.getByTestId("loading")).toHaveTextContent("Memeriksa sesi...");
    expect(replaceMock).not.toHaveBeenCalled();
  });

  it("redirects to /login if not loading and user is null", () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false } as unknown as ReturnType<typeof useAuth>);

    render(<AppShell>Content</AppShell>);
    expect(replaceMock).toHaveBeenCalledWith("/login");
  });

  it("renders children, Navbar, and Sidebar when user is logged in", () => {
    vi.mocked(useAuth).mockReturnValue({ user: { id: 1, username: "john" } as unknown as ReturnType<typeof useAuth>["user"], loading: false } as unknown as ReturnType<typeof useAuth>);

    render(<AppShell><div>Protected Content</div></AppShell>);

    expect(screen.queryByTestId("loading")).not.toBeInTheDocument();
    expect(screen.getByText("Protected Content")).toBeInTheDocument();
    
    const sidebar = screen.getByTestId("sidebar");
    expect(sidebar).toHaveAttribute("data-open", "false");

    fireEvent.click(screen.getByTestId("navbar"));
    expect(sidebar).toHaveAttribute("data-open", "true");

    fireEvent.click(screen.getByText("Close Sidebar"));
    expect(sidebar).toHaveAttribute("data-open", "false");
  });
});
