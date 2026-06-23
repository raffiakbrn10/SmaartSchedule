import { google } from "googleapis";
import { env } from "../config/env";
import { logger } from "../config/logger";
import { errorMessage } from "../utils/errors";

export interface CalendarEventInput { title: string; deadline: Date; description: string }

function createOAuthClient() {
  return new google.auth.OAuth2(env.GOOGLE_CLIENT_ID, env.GOOGLE_CLIENT_SECRET, env.GOOGLE_REDIRECT_URI);
}

export const googleCalendarService = {
  isConfigured(): boolean { return Boolean(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET); },
  getAuthorizationUrl(state: string): string {
    if (!this.isConfigured()) throw new Error("Google Calendar integration is not configured");
    return createOAuthClient().generateAuthUrl({ access_type: "offline", prompt: "consent", scope: ["https://www.googleapis.com/auth/calendar.events"], state });
  },
  async exchangeCode(code: string): Promise<string | null> {
    const { tokens } = await createOAuthClient().getToken(code);
    return tokens.refresh_token ?? null;
  },
  async createEvent(refreshToken: string, input: CalendarEventInput): Promise<string | null> {
    try {
      const auth = createOAuthClient();
      auth.setCredentials({ refresh_token: refreshToken });
      const start = input.deadline;
      const end = new Date(start.getTime() + 60 * 60 * 1000);
      const response = await google.calendar({ version: "v3", auth }).events.insert({
        calendarId: "primary",
        requestBody: {
          summary: input.title, description: input.description,
          start: { dateTime: start.toISOString(), timeZone: "Asia/Jakarta" },
          end: { dateTime: end.toISOString(), timeZone: "Asia/Jakarta" },
          reminders: { useDefault: false, overrides: [{ method: "popup", minutes: 30 }] },
        },
      });
      logger.info({ eventId: response.data.id }, "Google Calendar event created");
      return response.data.id ?? null;
    } catch (error) {
      logger.warn({ error: errorMessage(error) }, "Google Calendar event creation failed");
      return null;
    }
  },
};



