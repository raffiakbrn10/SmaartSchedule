import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProgressChart } from "./ProgressChart.jsx";
import React from "react";

describe("ProgressChart", () => {
  it("calculates and renders correct progress percentages", () => {
    const schedules = [
      { id: 1, user_id: 1, judul: "Task 1", prioritas: "Tinggi" as const, status: "Selesai" as const, deadline: "2026-06-25T10:00:00.000Z", reminder_level: 0 },
      { id: 2, user_id: 1, judul: "Task 2", prioritas: "Tinggi" as const, status: "Sedang Berjalan" as const, deadline: "2026-06-25T10:00:00.000Z", reminder_level: 0 },
      { id: 3, user_id: 1, judul: "Task 3", prioritas: "Tinggi" as const, status: "Belum Selesai" as const, deadline: "2026-06-25T10:00:00.000Z", reminder_level: 0 },
      { id: 4, user_id: 1, judul: "Task 4", prioritas: "Tinggi" as const, status: "Belum Selesai" as const, deadline: "2026-06-25T10:00:00.000Z", reminder_level: 0 },
    ];

    render(<ProgressChart schedules={schedules} />);
    expect(screen.getByText("Tugas selesai")).toBeInTheDocument();
    expect(screen.getAllByText("25%")).toHaveLength(2);
    expect(screen.getByText("Sedang dikerjakan")).toBeInTheDocument();
    expect(screen.getByText("50%")).toBeInTheDocument();
  });

  it("handles empty schedules array gracefully", () => {
    render(<ProgressChart schedules={[]} />);
    const percentages = screen.getAllByText("0%");
    expect(percentages.length).toBe(3);
  });
});
