import { describe, expect, it, vi } from "vitest";
import { validateBody } from "../src/middleware/validate.js";
import { z } from "zod";
import type { Request, Response } from "express";
import { AppError } from "../src/utils/errors.js";

describe("validate middleware", () => {
  const schema = z.object({
    name: z.string().min(3, "Name too short"),
  });

  it("calls next with no arguments if validation succeeds", () => {
    const middleware = validateBody(schema);
    const req = { body: { name: "John" } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body).toEqual({ name: "John" });
  });

  it("calls next with an AppError containing errors if validation fails", () => {
    const middleware = validateBody(schema);
    const req = { body: { name: "Jo" } } as Request;
    const res = {} as Response;
    const next = vi.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledOnce();
    const error = next.mock.calls[0]![0] as AppError;
    expect(error).toBeInstanceOf(AppError);
    expect(error.statusCode).toBe(422);
    expect(error.message).toBe("Data tidak valid.");
    expect(error.errors).toEqual({ name: ["Name too short"] });
  });
});
