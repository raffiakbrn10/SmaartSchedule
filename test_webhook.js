import { TelegramClient } from "./src/services/telegram/telegramClient.js";

async function testWebhook() {
  const telegramClient = new TelegramClient(
    "[ISI BOT TOKEN DARI .env]", // bot token from env
    true
  );
  
  const webhookUrl = "[ISI]";
  const secret = "[isi]";
  
  try {
    const success = await telegramClient.setWebhook(webhookUrl, secret);
    console.log("Success?", success);
  } catch (error) {
    console.error("Caught error:", error);
  }
}

testWebhook();
