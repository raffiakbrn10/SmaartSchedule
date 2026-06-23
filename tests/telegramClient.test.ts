import { describe, expect, it, vi } from "vitest";
import { TelegramClient } from "../src/services/telegram/telegramClient.js";

describe("TelegramClient", () => {
  it("returns a typed delivered result", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: true, result: { message_id: 42 } }), { status: 200, headers: { "content-type": "application/json" } }));
    const result = await new TelegramClient("test-token", true, request).sendMessage("123", "safe");
    expect(result).toEqual({ ok: true, status: "delivered", attempts: 1, messageId: 42 });
    expect(request).toHaveBeenCalledOnce();
  });
  it("does not call Telegram when disabled", async () => {
    const request = vi.fn<typeof fetch>();
    expect(await new TelegramClient("", false, request).sendMessage("123", "safe")).toEqual({ ok: false, status: "disabled", attempts: 0 });
    expect(request).not.toHaveBeenCalled();
  });
  it("does not retry permanent Telegram failures", async () => {
    const request = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify({ ok: false, description: "Bad Request" }), { status: 400 }));
    const result = await new TelegramClient("test-token", true, request).sendMessage("123", "safe");
    expect(result.ok).toBe(false); expect(result.error).toBe("Bad Request"); expect(request).toHaveBeenCalledOnce();
  });
});
