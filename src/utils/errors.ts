export class AppError extends Error {
  constructor(public readonly statusCode: number, message: string, public readonly errors?: Record<string, string[]>) {
    super(message);
    this.name = "AppError";
  }
}

export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unknown error";
}
