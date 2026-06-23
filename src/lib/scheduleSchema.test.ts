import { describe, expect, it } from "vitest";
import { scheduleSchema } from "./scheduleSchema";
describe("scheduleSchema", () => { it("rejects empty and invalid schedules", () => { expect(scheduleSchema.safeParse({ judul: "", prioritas: "Darurat", status: "Baru", deadline: "" }).success).toBe(false); }); });


