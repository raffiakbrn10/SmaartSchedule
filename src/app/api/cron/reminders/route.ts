import { env } from "@/config/env";
import { runReminderCycle } from "@/jobs/reminderJob";

export async function GET(request: Request) {
  const auth = request.headers.get("authorization");
  const secret = auth?.startsWith("Bearer ") ? auth.slice(7) : new URL(request.url).searchParams.get("secret");
  if (process.env.NODE_ENV === "production" && secret !== process.env.CRON_SECRET) {
    return Response.json({ success: false, message: "Unauthorized" }, { status: 401 });
  }

  if (!env.REMINDER_JOB_ENABLED) {
    return Response.json({ success: true, message: "Reminder job disabled." });
  }

  await runReminderCycle();
  return Response.json({ success: true, message: "Reminder cycle executed." });
}
