import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DeadlineReminder } from "./DeadlineReminder";
import type { Schedule } from "@/types/api";

const base: Schedule = { id: 1, user_id: 1, judul: "Presentasi", prioritas: "Tinggi", status: "Belum Selesai", deadline: "2026-06-23T12:00:00.000Z", reminder_level: 0 };
describe("DeadlineReminder", () => {
  it("shows only incomplete future deadlines", () => {
    render(<DeadlineReminder now={new Date("2026-06-23T10:00:00.000Z")} schedules={[base, { ...base, id: 2, judul: "Selesai", status: "Selesai" }, { ...base, id: 3, judul: "Lampau", deadline: "2026-06-22T10:00:00.000Z" }]} />);
    expect(screen.getByText("Presentasi")).toBeInTheDocument(); expect(screen.queryByText("Selesai")).not.toBeInTheDocument(); expect(screen.queryByText("Lampau")).not.toBeInTheDocument();
  });
});
