import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createApp } from "../src/app.js";
import { env } from "../src/config/env.js";
import { authService } from "../src/services/authService.js";
import { notificationService } from "../src/services/telegram/notificationService.js";

describe("API validation and authorization", () => {
  beforeEach(() => { env.adminUserIds.clear(); vi.restoreAllMocks(); });
  it("validates registration input before database access", async () => {
    const response = await request(createApp()).post("/auth/register").send({ username: "x", password: "short" });
    expect(response.status).toBe(422); expect(response.body).toMatchObject({ success: false, message: "Data tidak valid." });
  });
  it("protects the Telegram test endpoint", async () => {
    const response = await request(createApp()).post("/admin/notifications/test").send({});
    expect(response.status).toBe(401);
  });
  it("restricts the Telegram test endpoint to configured admins", async () => {
    vi.spyOn(authService, "verifySession").mockReturnValue({ id: 7, username: "member" });
    const response = await request(createApp()).post("/admin/notifications/test").set("authorization", "Bearer test").send({});
    expect(response.status).toBe(403);
  });
  it("allows admins to send a mocked test notification", async () => {
    env.adminUserIds.add(7);
    vi.spyOn(authService, "verifySession").mockReturnValue({ id: 7, username: "admin" });
    vi.spyOn(notificationService, "sendTestNotification").mockResolvedValue({ ok: true, status: "delivered", attempts: 1, messageId: 9 });
    const response = await request(createApp()).post("/admin/notifications/test").set("authorization", "Bearer test").send({});
    expect(response.status).toBe(200); expect(response.body).toMatchObject({ success: true, data: { status: "delivered" } });
  });
});
