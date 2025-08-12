"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function AssistantChat({ initialContext }: { initialContext?: any }) {
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "سلام/Hello! Need help? Ask me anything about the survey." },
  ]);
  const [input, setInput] = useState("");
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text) return;
    setInput("");
    const nextMsg: Msg = { role: "user", content: text };
    setMessages((prev) => [...prev, nextMsg]);

    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: messages }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessages((m) => [...m, { role: "assistant", content: json.text as string }]);
      } else {
        setMessages((m) => [...m, { role: "assistant", content: "Sorry, I couldn't respond right now." }]);
      }
    } catch (e) {
      setMessages((m) => [...m, { role: "assistant", content: "Network error." }]);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 flex flex-col h-80">
      <div ref={listRef} className="flex-1 overflow-auto p-3 space-y-2">
        {messages.map((m, i) => (
          <div key={i} className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${m.role === "assistant" ? "bg-emerald-600/30 border border-emerald-500/30" : "bg-neutral-800/70 border border-white/10 ml-auto"}`}>
            {m.content}
          </div>
        ))}
      </div>
      <div className="p-2 flex gap-2">
        <input className="flex-1 rounded-xl bg-neutral-900 border border-white/10 px-3" placeholder="Type here..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="rounded-xl px-3 bg-emerald-600 hover:bg-emerald-500" onClick={send}>Send</button>
      </div>
    </div>
  );
}


