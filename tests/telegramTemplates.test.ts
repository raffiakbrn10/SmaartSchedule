import { describe, expect, it } from "vitest";
import { escapeHtml, telegramTemplates } from "../src/services/telegram/templates.js";

describe("Telegram templates", () => {
  it("escapes every user-controlled HTML character", () => {
    expect(escapeHtml(`<script a="b">Tom & 'Ada'</script>`)).toBe("&lt;script a=&quot;b&quot;&gt;Tom &amp; &#39;Ada&#39;&lt;/script&gt;");
  });
  it("does not interpolate unescaped schedule titles", () => {
    const output = telegramTemplates.scheduleCreated("A < B & C", new Date("2026-06-23T10:00:00.000Z"));
    expect(output).toContain("A &lt; B &amp; C");
    expect(output).not.toContain("A < B");
  });
});
