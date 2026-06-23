import { describe, expect, it, vi, beforeEach } from "vitest";
import { authService } from "../src/services/authService.js";
import { userRepository, type UserRecord } from "../src/repositories/userRepository.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const jwtSecret = process.env.JWT_SECRET || "development-only-secret-change-me-now";

vi.mock("../src/repositories/userRepository.js", () => ({
  userRepository: {
    findByUsername: vi.fn(),
    create: vi.fn(),
  },
}));

describe("authService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("register", () => {
    it("successfully registers a new user", async () => {
      vi.mocked(userRepository.findByUsername).mockResolvedValueOnce(null);
      vi.mocked(userRepository.create).mockResolvedValueOnce(123);

      const result = await authService.register({ username: "newuser", password: "password123" });
      expect(result).toEqual({ id: 123, username: "newuser" });
      expect(userRepository.findByUsername).toHaveBeenCalledWith("newuser");
      expect(userRepository.create).toHaveBeenCalledWith("newuser", expect.any(String));
    });

    it("throws 409 if username is already taken", async () => {
      const mockUser = { id: 1, username: "existing", password: "pwd", google_refresh_token: null, telegram_chat_id: null } as UserRecord;
      vi.mocked(userRepository.findByUsername).mockResolvedValueOnce(mockUser);

      await expect(authService.register({ username: "existing", password: "password123" })).rejects.toThrow("Username sudah digunakan.");
    });
  });

  describe("login", () => {
    it("successfully logs in with valid credentials", async () => {
      const hashedPassword = await bcrypt.hash("correct", 12);
      const mockUser = {
        id: 1,
        username: "user",
        password: hashedPassword,
        google_refresh_token: null,
        telegram_chat_id: null,
      } as UserRecord;
      vi.mocked(userRepository.findByUsername).mockResolvedValueOnce(mockUser);

      const result = await authService.login({ username: "user", password: "correct" });
      expect(result.user).toEqual({ id: 1, username: "user" });
      expect(result.token).toBeDefined();

      const decoded = jwt.verify(result.token, jwtSecret) as jwt.JwtPayload;
      expect(decoded.id).toBe(1);
      expect(decoded.username).toBe("user");
    });

    it("throws 401 on invalid username", async () => {
      vi.mocked(userRepository.findByUsername).mockResolvedValueOnce(null);

      await expect(authService.login({ username: "wrong", password: "pwd" })).rejects.toThrow("Username atau password salah.");
    });

    it("throws 401 on invalid password", async () => {
      const hashedPassword = await bcrypt.hash("correct", 12);
      const mockUser = {
        id: 1,
        username: "user",
        password: hashedPassword,
        google_refresh_token: null,
        telegram_chat_id: null,
      } as UserRecord;
      vi.mocked(userRepository.findByUsername).mockResolvedValueOnce(mockUser);

      await expect(authService.login({ username: "user", password: "wrong" })).rejects.toThrow("Username atau password salah.");
    });
  });

  describe("session and purpose tokens", () => {
    const mockUser = { id: 7, username: "testuser" };

    it("verifies valid session tokens", () => {
      const token = jwt.sign(mockUser, jwtSecret);
      const verified = authService.verifySession(token);
      expect(verified).toEqual(mockUser);
    });

    it("throws 401 on invalid session token structure or signature", () => {
      expect(() => authService.verifySession("invalid-token")).toThrow();

      const badUser = { id: "not-an-int", username: "bad" };
      const token = jwt.sign(badUser, jwtSecret);
      expect(() => authService.verifySession(token)).toThrow("Sesi tidak valid.");
    });


    it("throws 401 if token has a purpose but verifySession is used", () => {
      const token = authService.createPurposeToken(mockUser, "telegram-link");
      expect(() => authService.verifySession(token)).toThrow("Sesi tidak valid.");
    });

    it("creates and verifies purpose tokens successfully", () => {
      const token = authService.createPurposeToken(mockUser, "google-link");
      const verified = authService.verifyPurposeToken(token, "google-link");
      expect(verified).toEqual(mockUser);
    });

    it("throws 400 if purpose token verify fails purpose mismatch or schema check", () => {
      const token = authService.createPurposeToken(mockUser, "google-link");
      expect(() => authService.verifyPurposeToken(token, "telegram-link")).toThrow("Tautan integrasi tidak valid atau kedaluwarsa.");

      expect(() => authService.verifyPurposeToken("invalid", "google-link")).toThrow();
    });
  });
});
