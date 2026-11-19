import "server-only";
import { answerFromKnowledge, buildSystemPrompt, retrieveKnowledge } from "@/server/assistant/knowledge";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string };

function openAiKey() {
  return process.env.OPENAI_API_KEY?.trim() || process.env.AI_API_KEY?.trim() || "";
}

async function answerWithOpenAi(messages: ChatMessage[]) {
  const key = openAiKey();
  if (!key) return null;
  const model = process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
  const grounded = retrieveKnowledge(messages.filter((item) => item.role === "user").at(-1)?.content ?? "", 5)
    .map((chunk) => `${chunk.title}: ${chunk.text}`)
    .join("\n");
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.4,
      max_tokens: 700,
      messages: [
        { role: "system", content: buildSystemPrompt() },
        { role: "system", content: `Most relevant dossier excerpts for this turn:\n${grounded || "None matched; stay general and careful."}` },
        ...messages.filter((item) => item.role !== "system").slice(-10),
      ],
    }),
  });
  if (!response.ok) return null;
  const data = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = data.choices?.[0]?.message?.content?.trim();
  return text || null;
}

export async function answerAssistant(messages: ChatMessage[]) {
  const latest = [...messages].reverse().find((item) => item.role === "user")?.content?.trim() ?? "";
  if (!latest) return { reply: "Ask me anything about Upskyla courses, applications, payments, or how the platform works.", mode: "knowledge" as const };

  const llm = await answerWithOpenAi(messages);
  if (llm) return { reply: llm, mode: "llm" as const };

  return { reply: answerFromKnowledge(latest), mode: "knowledge" as const };
}

export function assistantConfigured() {
  return Boolean(openAiKey());
}
