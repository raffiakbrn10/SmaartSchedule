import request from "supertest";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { createApp } from "../src/app.js";
import { authService } from "../src/services/authService.js";

vi.mock("../src/services/authService.js", () => ({
  authService: {
    register: vi.fn(),
    login: vi.fn(),
    verifySession: vi.fn(),
  },
}));

describe("authController", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const app = createApp();

  describe("POST /auth/register", () => {
    it("returns 201 on successful registration", async () => {
      vi.mocked(authService.register).mockResolvedValueOnce({ id: 1, username: "user1" });

      const response = await request(app)
        .post("/auth/register")
        .send({ username: "user1", password: "password123" });

      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        success: true,
        message: "Registrasi berhasil. Silakan masuk.",
        data: { user: { id: 1, username: "user1" } },
      });
      expect(authService.register).toHaveBeenCalledWith({ username: "user1", password: "password123" });
    });
  });

  describe("POST /auth/login", () => {
    it("returns 200 and sets cookie on successful login", async () => {
      vi.mocked(authService.login).mockResolvedValueOnce({
        user: { id: 1, username: "user1" },
        token: "jwt-token-123",
      });

      const response = await request(app)
        .post("/auth/login")
        .send({ username: "user1", password: "password123" });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Login berhasil.",
        data: { user: { id: 1, username: "user1" } },
      });
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies?.[0]).toContain("smartschedule_session=");
      expect(authService.login).toHaveBeenCalledWith({ username: "user1", password: "password123" });
    });
  });

  describe("POST /auth/logout", () => {
    it("returns 200 and clears the session cookie", async () => {
      const response = await request(app)
        .post("/auth/logout");

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Logout berhasil.",
      });
      const cookies = response.headers["set-cookie"];
      expect(cookies).toBeDefined();
      expect(cookies?.[0]).toContain("smartschedule_session=;");
    });
  });

  describe("GET /auth/me", () => {
    it("returns 200 and active user session info", async () => {
      vi.mocked(authService.verifySession).mockReturnValueOnce({ id: 1, username: "user1" });

      const response = await request(app)
        .get("/auth/me")
        .set("Cookie", ["smartschedule_session=valid-jwt-token"]);

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        success: true,
        message: "Sesi aktif.",
        data: { user: { id: 1, username: "user1" } },
      });
      expect(authService.verifySession).toHaveBeenCalledWith("valid-jwt-token");
    });
  });
});
