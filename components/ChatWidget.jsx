"use client";

import { useState } from "react";

export default function ChatWidget() {
  const [messages, setMessages] = useState([
    {
      id: "intro",
      role: "assistant",
      content: "Hi! Ask me about SON tools, policies, or next steps."
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          conversationId: conversationId || undefined
        })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Chat request failed.");
      }
      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.reply
        }
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content:
            error?.message || "I ran into an issue. Please try again shortly."
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-card">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
            Talk to SON AI
          </p>
          <h2 className="font-display text-2xl font-semibold text-[color:var(--nexus-blue)]">
            Ask anything about nursing tools
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setMessages([
                {
                  id: "intro",
                  role: "assistant",
                  content: "Hi! Ask me about SON tools, policies, or next steps."
                }
              ]);
              setConversationId("");
            }}
            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
          >
            New Chat
          </button>
          <span className="hidden rounded-full bg-[color:var(--nexus-ice)] px-4 py-1 text-xs font-semibold text-[color:var(--nexus-blue)] md:inline">
            LiteLLM connected
          </span>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
              message.role === "user"
                ? "ml-auto bg-[color:var(--nexus-blue)] text-white"
                : "bg-[color:var(--nexus-mist)] text-slate-700"
            }`}
          >
            {message.content}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          type="text"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Ask about policies, workflows, or tools..."
          className="flex-1 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm focus:border-[color:var(--nexus-blue)] focus:outline-none focus:ring-2 focus:ring-[color:var(--nexus-ice)]"
          disabled={isLoading}
        />
        <button
          type="submit"
          className="rounded-full bg-[color:var(--nexus-blue)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[color:var(--nexus-blue-light)] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isLoading}
        >
          {isLoading ? "Thinking..." : "Send"}
        </button>
      </form>
    </section>
  );
}
