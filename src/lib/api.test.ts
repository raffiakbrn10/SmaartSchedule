import { describe, expect, it, vi, beforeEach } from "vitest";
import { api, ApiError } from "./api";

describe("frontend api client", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("handles successful requests correctly", async () => {
    const mockResponseData = { user: { id: 1, username: "john" } };
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, message: "OK", data: mockResponseData }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await api.me();
    expect(result).toEqual(mockResponseData);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("/auth/me"),
      expect.objectContaining({ credentials: "include" })
    );
  });

  it("throws ApiError if response is not ok", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ success: false, message: "Bad Request", errors: { username: ["Too short"] } }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(api.me()).rejects.toThrow(ApiError);
    try {
      await api.me();
    } catch (e) {
      const apiError = e as ApiError;
      expect(apiError.status).toBe(400);
      expect(apiError.errors).toEqual({ username: ["Too short"] });
    }
  });

  it("throws ApiError if success is false even if status is 200", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: false, message: "Fail" }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await expect(api.me()).rejects.toThrow("Fail");
  });

  it("returns undefined if data is not present in response body", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true }),
    });
    vi.stubGlobal("fetch", mockFetch);

    const result = await api.logout();
    expect(result).toBeUndefined();
  });

  it("sends correct payload for each api function", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ success: true, data: {} }),
    });
    vi.stubGlobal("fetch", mockFetch);

    await api.register({ username: "u", password: "p" });
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/auth/register"), expect.objectContaining({ method: "POST" }));

    await api.login({ username: "u", password: "p" });
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/auth/login"), expect.objectContaining({ method: "POST" }));

    await api.schedules();
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/schedules"), expect.anything());

    await api.createSchedule({ judul: "t", prioritas: "Tinggi", status: "Belum Selesai", deadline: "2026-06-25T10:00:00.000Z" });
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/schedules"), expect.objectContaining({ method: "POST" }));

    await api.updateSchedule(1, { judul: "t", prioritas: "Tinggi", status: "Belum Selesai", deadline: "2026-06-25T10:00:00.000Z" });
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/schedules/1"), expect.objectContaining({ method: "PUT" }));

    await api.deleteSchedule(1);
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/schedules/1"), expect.objectContaining({ method: "DELETE" }));

    await api.integrationStatus();
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/integrations/status"), expect.anything());

    await api.googleAuthUrl();
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/google/auth-url"), expect.anything());

    await api.telegramLink();
    expect(mockFetch).toHaveBeenLastCalledWith(expect.stringContaining("/integrations/telegram/link"), expect.anything());
  });
});



