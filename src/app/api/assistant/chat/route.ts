import { api, ok } from "@/server/http";
import { AppError, readJson } from "@/server/errors";
import { clientIp } from "@/server/guards";
import { answerAssistant, assistantConfigured, type ChatMessage } from "@/server/assistant/chat";
import { rateLimit } from "@/server/rate-limit";

export const POST = api(async (req) => {
  await rateLimit(`assistant:${clientIp(req)}`, 40, 60 * 60 * 1000);
  const body = await readJson<{ messages?: ChatMessage[] }>(req);
  const messages = Array.isArray(body.messages) ? body.messages : [];
  if (messages.length === 0) throw new AppError("Send at least one message.");
  if (messages.length > 20) throw new AppError("Start a shorter conversation thread.");
  const cleaned: ChatMessage[] = messages
    .filter((item) => item && (item.role === "user" || item.role === "assistant") && typeof item.content === "string")
    .map((item) => ({ role: item.role, content: item.content.trim().slice(0, 2000) }))
    .filter((item) => item.content.length > 0);
  if (cleaned.length === 0) throw new AppError("Your message was empty.");
  const latest = cleaned.at(-1);
  if (!latest || latest.role !== "user") throw new AppError("The last message must come from you.");
  const result = await answerAssistant(cleaned);
  return ok({
    reply: result.reply,
    mode: result.mode,
    llmReady: assistantConfigured(),
  });
});
