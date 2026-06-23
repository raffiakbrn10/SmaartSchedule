import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ScheduleCard } from "./ScheduleCard.jsx";
import React from "react";

describe("ScheduleCard", () => {
  const mockSchedule = {
    id: 1,
    user_id: 1,
    judul: "Learn React Context",
    prioritas: "Tinggi" as const,
    status: "Sedang Berjalan" as const,
    deadline: "2026-06-25T10:00:00.000Z",
    reminder_level: 0,
  };

  it("renders priority, status, and title", () => {
    render(<ScheduleCard schedule={mockSchedule} onEdit={vi.fn()} onDelete={vi.fn()} />);

    expect(screen.getByText("Tinggi")).toBeInTheDocument();
    expect(screen.getByText("Sedang Berjalan")).toBeInTheDocument();
    expect(screen.getByText("Learn React Context")).toBeInTheDocument();
  });

  it("calls onEdit when edit button is clicked", () => {
    const onEditMock = vi.fn();
    render(<ScheduleCard schedule={mockSchedule} onEdit={onEditMock} onDelete={vi.fn()} />);

    const editBtn = screen.getByRole("button", { name: "Edit Learn React Context" });
    fireEvent.click(editBtn);
    expect(onEditMock).toHaveBeenCalledOnce();
  });

  it("calls onDelete when delete button is clicked", () => {
    const onDeleteMock = vi.fn();
    render(<ScheduleCard schedule={mockSchedule} onEdit={vi.fn()} onDelete={onDeleteMock} />);

    const deleteBtn = screen.getByRole("button", { name: "Hapus Learn React Context" });
    fireEvent.click(deleteBtn);
    expect(onDeleteMock).toHaveBeenCalledOnce();
  });
});
