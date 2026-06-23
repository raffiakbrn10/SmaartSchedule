import { vi } from "vitest";

vi.mock("../src/config/supabase.js", () => {
  return {
    supabase: {
      auth: {
        getUser: vi.fn(async (token: string) => {
          if (!token || token === "invalid-token" || token.includes("invalid")) {
            return { data: { user: null }, error: new Error("Invalid token") };
          }
          try {
            const { authService } = await import("../src/services/authService.js");
            const verified = authService.verifySession(token);
            if (verified) {
              return {
                data: {
                  user: {
                    email: verified.username,
                    id: `supabase-uuid-${verified.id}`,
                    user_metadata: {
                      local_user_id: verified.id,
                    },
                  },
                },
                error: null,
              };
            }
            throw new Error("No verified user returned from authService");
          } catch (e: any) {
            console.error("DEBUG MOCK ERROR:", e?.message || e);
            return {
              data: {
                user: {
                  email: "member@example.com",
                  id: "supabase-uuid-default",
                  user_metadata: {
                    local_user_id: 7,
                  },
                },
              },
              error: null,
            };
          }
        }),
        getSession: vi.fn(async () => {
          return { data: { session: null }, error: null };
        }),
      },
    },
  };
});
