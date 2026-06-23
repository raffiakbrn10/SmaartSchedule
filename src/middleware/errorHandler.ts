import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";
import { env } from "../config/env";
import { logger } from "../config/logger";
import type { ApiResponse } from "../types/api";
import { AppError, errorMessage } from "../utils/errors";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, message: "Endpoint tidak ditemukan." } satisfies ApiResponse<never>);
};

export const errorHandler: ErrorRequestHandler = (error: unknown, req, res, _next) => {
  let status = 500;
  let message = "Terjadi kesalahan pada server.";
  let errors: Record<string, string[]> | undefined;
  if (error instanceof AppError) { status = error.statusCode; message = error.message; errors = error.errors; }
  else if (error instanceof ZodError) { status = 422; message = "Data tidak valid."; errors = { request: error.issues.map((issue) => issue.message) }; }
  logger[status >= 500 ? "error" : "warn"]({ err: errorMessage(error), method: req.method, path: req.path, status }, "Request failed");
  const body: ApiResponse<never> = { success: false, message, ...(errors ? { errors } : {}) };
  if (env.NODE_ENV !== "production" && status === 500) body.errors = { debug: [errorMessage(error)] };
  res.status(status).json(body);
};



