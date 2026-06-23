import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ScheduleDialog } from "./ScheduleDialog.jsx";
import React from "react";

describe("ScheduleDialog", () => {


  it("returns null if not open", () => {
    const { container } = render(
      <ScheduleDialog schedule={null} open={false} saving={false} onClose={vi.fn()} onSave={vi.fn()} />
    );
    expect(container.firstChild).toBeNull();
  });

  it("renders new schedule form fields and calls onClose on cancel", () => {
    const onCloseMock = vi.fn();
    render(
      <ScheduleDialog schedule={null} open={true} saving={false} onClose={onCloseMock} onSave={vi.fn()} />
    );

    expect(screen.getByText("Tambah tugas baru")).toBeInTheDocument();
    expect(screen.getByLabelText("Judul tugas")).toBeInTheDocument();
    expect(screen.getByLabelText("Prioritas")).toBeInTheDocument();
    expect(screen.getByLabelText("Status")).toBeInTheDocument();
    expect(screen.getByLabelText("Deadline")).toBeInTheDocument();

    const cancelBtn = screen.getByText("Batal");
    fireEvent.click(cancelBtn);
    expect(onCloseMock).toHaveBeenCalledOnce();
  });

  it("fills form with existing schedule details and calls onSave on submission", async () => {
    const onSaveMock = vi.fn().mockResolvedValue(undefined);
    const mockSchedule = {
      id: 1,
      user_id: 1,
      judul: "Learn React",
      prioritas: "Tinggi" as const,
      status: "Sedang Berjalan" as const,
      deadline: "2026-06-25T10:00:00.000Z",
      reminder_level: 0,
    };

    render(
      <ScheduleDialog schedule={mockSchedule} open={true} saving={false} onClose={vi.fn()} onSave={onSaveMock} />
    );

    expect(screen.getByText("Edit tugas")).toBeInTheDocument();
    
    const titleInput = screen.getByLabelText<HTMLInputElement>("Judul tugas");
    expect(titleInput.value).toBe("Learn React");

    fireEvent.change(titleInput, { target: { value: "Learn Testing" } });
    
    const submitBtn = screen.getByText("Simpan");
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(onSaveMock).toHaveBeenCalledWith(expect.objectContaining({
        judul: "Learn Testing",
        prioritas: "Tinggi",
        status: "Sedang Berjalan",
      }));
    });
  });

  it("displays validation error on invalid input", async () => {
    const { container } = render(
      <ScheduleDialog schedule={null} open={true} saving={false} onClose={vi.fn()} onSave={vi.fn()} />
    );

    const form = container.querySelector("form")!;
    fireEvent.submit(form);

    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Judul wajib diisi");
  });

  it("closes dialog on backdrop click", () => {
    const onCloseMock = vi.fn();
    const { container } = render(
      <ScheduleDialog schedule={null} open={true} saving={false} onClose={onCloseMock} onSave={vi.fn()} />
    );

    const backdrop = container.firstChild as HTMLElement;
    fireEvent.mouseDown(backdrop);
    expect(onCloseMock).toHaveBeenCalledOnce();
  });
});
