import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { googleCalendarService } from "../src/services/googleCalendarService.js";
import { env } from "../src/config/env.js";

const { mockInsert, mockGenerateAuthUrl, mockGetToken, mockSetCredentials } = vi.hoisted(() => ({
  mockInsert: vi.fn().mockResolvedValue({ data: { id: "event-id-123" } }),
  mockGenerateAuthUrl: vi.fn().mockReturnValue("https://google.com/auth"),
  mockGetToken: vi.fn().mockResolvedValue({ tokens: { refresh_token: "mock-refresh-token" } }),
  mockSetCredentials: vi.fn(),
}));

vi.mock("googleapis", () => {
  const mockCalendar = vi.fn().mockReturnValue({
    events: {
      insert: mockInsert,
    },
  });

  class MockOAuth2 {
    generateAuthUrl = mockGenerateAuthUrl;
    getToken = mockGetToken;
    setCredentials = mockSetCredentials;
  }

  return {
    google: {
      auth: {
        OAuth2: MockOAuth2,
      },
      calendar: mockCalendar,
    },
  };
});

describe("googleCalendarService", () => {
  const originalClientId = env.GOOGLE_CLIENT_ID;
  const originalClientSecret = env.GOOGLE_CLIENT_SECRET;

  beforeEach(() => {
    vi.clearAllMocks();
    env.GOOGLE_CLIENT_ID = "some-id";
    env.GOOGLE_CLIENT_SECRET = "some-secret";
  });

  afterEach(() => {
    env.GOOGLE_CLIENT_ID = originalClientId;
    env.GOOGLE_CLIENT_SECRET = originalClientSecret;
  });

  it("checks if service is configured", () => {
    expect(googleCalendarService.isConfigured()).toBe(true);

    env.GOOGLE_CLIENT_ID = "";
    expect(googleCalendarService.isConfigured()).toBe(false);
  });

  it("generates authorization url if configured", () => {
    const url = googleCalendarService.getAuthorizationUrl("state-token");
    expect(url).toBe("https://google.com/auth");

    env.GOOGLE_CLIENT_ID = "";
    expect(() => googleCalendarService.getAuthorizationUrl("state")).toThrow("Google Calendar integration is not configured");
  });

  it("exchanges code for refresh token", async () => {
    const token = await googleCalendarService.exchangeCode("auth-code");
    expect(token).toBe("mock-refresh-token");
  });

  it("creates calendar event successfully", async () => {
    const eventId = await googleCalendarService.createEvent("refresh-token", {
      title: "Ujian",
      deadline: new Date("2026-06-25T10:00:00.000Z"),
      description: "Tinggi",
    });
    expect(eventId).toBe("event-id-123");
  });

  it("returns null if calendar event creation fails", async () => {
    mockInsert.mockRejectedValueOnce(new Error("API Error"));

    const eventId = await googleCalendarService.createEvent("refresh-token", {
      title: "Ujian",
      deadline: new Date(),
      description: "Tinggi",
    });
    expect(eventId).toBeNull();
  });
});
