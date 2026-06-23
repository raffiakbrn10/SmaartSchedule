import { credentialsSchema } from "@/schemas/auth";
import { authService } from "@/services/authService";
import { AppError } from "@/utils/errors";

export async function POST(request: Request) {
  try {
    const body = credentialsSchema.parse(await request.json());
    const user = await authService.register(body);
    return Response.json({ success: true, message: "Registrasi berhasil. Silakan masuk.", data: { user } }, { status: 201 });
  } catch (error) {
    const message = error instanceof AppError ? error.message : error instanceof Error ? error.message : "Registrasi gagal.";
    const status = error instanceof AppError ? error.statusCode : 400;
    return Response.json({ success: false, message }, { status });
  }
}
