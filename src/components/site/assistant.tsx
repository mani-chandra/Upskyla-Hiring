"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, X } from "lucide-react";
import { Button } from "@/components/ui";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

const starters = [
  "Which course should I choose?",
  "Do you guarantee a job?",
  "How do payments and enrollment work?",
  "When do jobs unlock on my dashboard?",
];

export function AssistantPanel({
  embedded = false,
  className,
}: {
  embedded?: boolean;
  className?: string;
}) {
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: "Hi — I’m the Upskyla assistant. Ask about courses, fees, eligibility, the dashboard, companies, or anything else on your mind.",
    },
  ]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, pending]);

  async function send(text: string) {
    const content = text.trim();
    if (!content || pending) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setInput("");
    setPending(true);
    setError("");
    try {
      const response = await fetch("/api/assistant/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      const data = (await response.json()) as { reply?: string; error?: string };
      if (!response.ok || !data.reply) {
        setError(data.error ?? "I could not answer just now. Try again.");
        setPending(false);
        return;
      }
      setMessages([...next, { role: "assistant", content: data.reply }]);
    } catch {
      setError("Network issue. Please try again.");
    }
    setPending(false);
  }

  return (
    <div className={cn("flex h-full min-h-[420px] flex-col overflow-hidden rounded-[1.5rem] border border-line bg-white shadow-[0_24px_60px_rgba(11,31,58,0.12)]", className)}>
      <div className="bg-navy px-4 py-3 text-white">
        <p className="text-sm font-semibold">Upskyla Assistant</p>
        <p className="text-xs text-white/65">Ask anything about courses, applications, or how Upskyla works</p>
      </div>
      <div className="flex-1 space-y-3 overflow-y-auto bg-mist/50 px-4 py-4">
        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={cn(
              "max-w-[90%] rounded-2xl px-3.5 py-2.5 text-sm leading-6",
              message.role === "assistant" ? "bg-white text-ink border border-line" : "ml-auto bg-electric text-white",
            )}
          >
            {message.content}
          </div>
        ))}
        {pending ? <p className="text-xs text-muted">Thinking…</p> : null}
        <div ref={endRef} />
      </div>
      {!embedded && messages.length < 3 ? (
        <div className="flex flex-wrap gap-2 border-t border-line px-3 py-3">
          {starters.map((item) => (
            <button
              key={item}
              type="button"
              className="rounded-xl border border-line bg-white px-3 py-1.5 text-left text-xs text-navy hover:border-electric"
              onClick={() => send(item)}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}
      <form
        className="grid gap-2 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(input);
        }}
      >
        {error ? <p className="text-xs text-red-700">{error}</p> : null}
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder="Type your question…"
            aria-label="Ask Upskyla Assistant"
            disabled={pending}
          />
          <Button type="submit" disabled={pending || !input.trim()}>{pending ? "…" : "Ask"}</Button>
        </div>
      </form>
    </div>
  );
}

export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col items-end gap-3">
      {open ? (
        <div className="h-[min(70vh,560px)] w-[min(100vw-1.5rem,380px)]">
          <div className="relative h-full">
            <button
              type="button"
              aria-label="Close assistant"
              className="absolute right-3 top-3 z-10 grid h-8 w-8 place-items-center rounded-full bg-white/15 text-white"
              onClick={() => setOpen(false)}
            >
              <X size={16} />
            </button>
            <AssistantPanel className="h-full" />
          </div>
        </div>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="inline-flex items-center gap-2 rounded-xl bg-electric px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(47,107,255,0.35)] hover:bg-electric-700"
      >
        <MessageCircle size={18} />
        {open ? "Close chat" : "Ask AI"}
      </button>
    </div>
  );
}
