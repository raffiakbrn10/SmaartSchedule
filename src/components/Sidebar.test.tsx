import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Sidebar } from "./Sidebar.jsx";
import React from "react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
}));

vi.mock("next/link", () => ({
  default: ({ children, href, onClick, ...rest }: { children: React.ReactNode; href: string; onClick?: () => void; [key: string]: unknown }) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

describe("Sidebar", () => {
  it("renders active menu item and responds to click", () => {
    const onCloseMock = vi.fn();
    render(<Sidebar open={true} onClose={onCloseMock} />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Jadwal Tugas")).toBeInTheDocument();
    expect(screen.getByText("Pengaturan Profil")).toBeInTheDocument();

    const closeBackdrop = screen.getByRole("button", { name: "Tutup menu" });
    fireEvent.click(closeBackdrop);
    expect(onCloseMock).toHaveBeenCalledOnce();

    const dashboardLink = screen.getByText("Dashboard");
    fireEvent.click(dashboardLink);
    expect(onCloseMock).toHaveBeenCalledTimes(2);

    expect(dashboardLink).toHaveAttribute("aria-current", "page");
  });

  it("applies correct hidden class when open is false", () => {
    const { container } = render(<Sidebar open={false} onClose={vi.fn()} />);
    const sidebar = container.querySelector("aside");
    expect(sidebar).toHaveClass("-translate-x-full");
  });
});
