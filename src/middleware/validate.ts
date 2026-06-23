import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { AppError } from "../utils/errors.js";

export function validateBody<T>(schema: ZodType<T>) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errors: Record<string, string[]> = {};
      for (const issue of result.error.issues) (errors[issue.path.join(".") || "body"] ??= []).push(issue.message);
      return next(new AppError(422, "Data tidak valid.", errors));
    }
    req.body = result.data;
    next();
  };
}
