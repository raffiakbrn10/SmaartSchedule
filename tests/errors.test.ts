import { describe, expect, it } from "vitest";
import { AppError, errorMessage } from "../src/utils/errors.js";

describe("errors utility", () => {
  it("creates an AppError instance", () => {
    const err = new AppError(400, "Bad Request", { field: ["invalid"] });
    expect(err.statusCode).toBe(400);
    expect(err.message).toBe("Bad Request");
    expect(err.errors).toEqual({ field: ["invalid"] });
    expect(err.name).toBe("AppError");
  });

  it("handles errorMessage correctly", () => {
    expect(errorMessage(new Error("test error"))).toBe("test error");
    expect(errorMessage("string error")).toBe("Unknown error");
  });
});
