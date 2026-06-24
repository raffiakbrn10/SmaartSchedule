import { TelegramClient } from "./src/services/telegram/telegramClient.js";

async function testWebhook() {
  const telegramClient = new TelegramClient(
    "8948044912:AAG356ZOouBJRmH4D4Q0NxvNvzLMn7y1744", // bot token from env
    true
  );
  
  const webhookUrl = "https://smartschedule-9ntp.onrender.com/integrations/telegram/webhook";
  const secret = "telegrambotsmartscheduleactive";
  
  try {
    const success = await telegramClient.setWebhook(webhookUrl, secret);
    console.log("Success?", success);
  } catch (error) {
    console.error("Caught error:", error);
  }
}

testWebhook();
