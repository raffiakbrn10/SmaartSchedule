import { z } from "zod";

export const credentialsSchema = z.object({
  displayName: z.string().trim().max(100).optional(),
  username: z.string().trim().min(3, "Username minimal 3 karakter").max(50).regex(/^[\p{L}\p{N}_.-]+$/u, "Username mengandung karakter yang tidak didukung"),
  password: z.string().min(8, "Password minimal 8 karakter").max(128),
});

export type CredentialsInput = z.infer<typeof credentialsSchema>;
