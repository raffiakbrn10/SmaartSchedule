import { describe, expect, it, vi, beforeEach } from "vitest";
import { errorHandler, notFoundHandler } from "../src/middleware/errorHandler.js";
import { AppError } from "../src/utils/errors.js";
import { z } from "zod";
import { env } from "../src/config/env.js";
import { logger } from "../src/config/logger.js";
import type { Request, Response, NextFunction } from "express";

describe("errorHandler middleware", () => {
  let req: Partial<Request>;
  let res: Response;
  let next: NextFunction;

  beforeEach(() => {
    vi.restoreAllMocks();
    req = { method: "GET", path: "/test" };
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    } as unknown as Response;
    next = vi.fn();
  });

  it("handles 404 not found handler", () => {
    notFoundHandler(req as Request, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ success: false, message: "Endpoint tidak ditemukan." });
  });

  it("handles AppError properly", () => {
    const error = new AppError(403, "Forbidden Action", { scope: ["admin"] });
    errorHandler(error, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Forbidden Action",
      errors: { scope: ["admin"] },
    });
  });

  it("handles ZodError properly", () => {
    const schema = z.object({ age: z.number() });
    const result = schema.safeParse({ age: "invalid" });
    if (result.success) throw new Error("Expected parse failure");
    const error = result.error;

    errorHandler(error, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(422);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Data tidak valid.",
      errors: { request: [expect.stringContaining("expected number")] },
    });
  });

  it("handles general 500 error", () => {
    const error = new Error("Something broke");
    const warnSpy = vi.spyOn(logger, "warn");
    const errorSpy = vi.spyOn(logger, "error");
    
    const oldEnv = env.NODE_ENV;
    env.NODE_ENV = "production";

    errorHandler(error, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan pada server.",
    });
    expect(errorSpy).toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    env.NODE_ENV = oldEnv;
  });

  it("adds debug errors in non-production for 500 errors", () => {
    const error = new Error("Something debug broke");
    const oldEnv = env.NODE_ENV;
    env.NODE_ENV = "development";

    errorHandler(error, req as Request, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      success: false,
      message: "Terjadi kesalahan pada server.",
      errors: { debug: ["Something debug broke"] },
    });

    env.NODE_ENV = oldEnv;
  });
});
