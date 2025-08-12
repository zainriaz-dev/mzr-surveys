"use client";
import React, { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function FloatingAI() {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [unread, setUnread] = useState(0);
  const [explainMode, setExplainMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! Toggle Explain to click any element and I’ll describe it." },
  ]);
  const [input, setInput] = useState("");
  const panelRef = useRef<HTMLDivElement>(null);
  const lastHighlighted = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const [size, setSize] = useState({ w: Math.min(360, typeof window !== 'undefined' ? Math.round(window.innerWidth * 0.9) : 360), h: 380 });
  const [pos, setPos] = useState({ right: 12, bottom: 120 });
  const [focusRect, setFocusRect] = useState<{ x: number; y: number; w: number; h: number } | null>(null);

  useEffect(() => {
    const isAIWidget = (element: HTMLElement): boolean => {
      // Check if element is part of AI widget
      return element.closest('[data-ai-widget="true"]') !== null ||
             element.closest('.floating-ai-widget') !== null ||
             element.id === 'floating-ai-root' ||
             element.className.includes('z-50') && (
               element.className.includes('rounded-full') || 
               element.className.includes('glass')
             );
    };

    const over = (e: MouseEvent) => {
      if (!explainMode) return;
      const target = e.target as HTMLElement;
      if (!target || isAIWidget(target)) return;
      
      if (lastHighlighted.current && lastHighlighted.current !== target) {
        lastHighlighted.current.classList.remove("explain-highlight");
      }
      target.classList.add("explain-highlight");
      lastHighlighted.current = target;
      const r = target.getBoundingClientRect();
      setFocusRect({ x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height });
    };
    
    const click = async (e: MouseEvent) => {
      if (!explainMode) return;
      const target = e.target as HTMLElement;
      if (!target || isAIWidget(target)) return;
      
      e.preventDefault();
      e.stopPropagation();
      
      const text = target.innerText?.trim() || target.getAttribute("aria-label") || target.tagName;
      if (text) await explain(text);
    };
    
    if (explainMode) {
      document.addEventListener("mouseover", over, true);
      document.addEventListener("click", click, true);
    }
    return () => {
      document.removeEventListener("mouseover", over, true);
      document.removeEventListener("click", click, true);
      if (lastHighlighted.current) lastHighlighted.current.classList.remove("explain-highlight");
      setFocusRect(null);
    };
  }, [explainMode]);

  async function explain(text: string) {
    setOpen(true);
    const prompt = `Explain this UI element briefly in 2-3 short lines (Urdu+English). Keep simple and friendly. Element: "${text}"`;
    await ask(prompt);
  }

  async function ask(message: string) {
    if (loading) return; // prevent concurrent
    if (!message.trim()) return;
    
    setLoading(true);
      const nextMsg: Msg = { role: "user", content: message };
      setMessages((prev) => [...prev, nextMsg]);
    setInput(""); // Clear input after sending
    
    try {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;
      const res = await fetch("/api/assistant?stream=1", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, history: messages }),
        signal: controller.signal,
      });
      const reader = res.body!.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      setMessages((m) => [...m, { role: "assistant", content: "" }]);
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const parts = chunk.split("\n\n");
        for (const part of parts) {
          if (!part.startsWith("data:")) continue;
          const payload = part.slice(5).trim();
          if (!payload || payload === "[DONE]") continue;
          acc += payload;
          setMessages((m) => {
            const out = [...m];
            out[out.length - 1] = { role: "assistant", content: acc };
            return out;
          });
        }
      }
    } catch {
      setMessages((m) => [...m, { role: "assistant", content: "Network error." }]);
    } finally {
      setLoading(false);
      if (minimized) setUnread((u) => u + 1);
    }
  }

  function stop() {
    abortRef.current?.abort();
  }

  return (
    <div data-ai-widget="true" className="floating-ai-widget">
      {/* overlay mask when explainMode is on */}
      {explainMode && (
        <div className="fixed inset-0 z-40 pointer-events-none" data-ai-widget="true">
          <div className="absolute inset-0 bg-black/40" />
          {focusRect && (
            <div
              className="absolute ring-2 ring-amber-300 rounded-lg"
              style={{ left: focusRect.x, top: focusRect.y, width: focusRect.w, height: focusRect.h }}
            />
          )}
          {focusRect && (
            <div
              className="absolute text-xs text-white bg-black/70 px-2 py-1 rounded-md"
              style={{ left: focusRect.x, top: focusRect.y - 28 }}
            >
              Click to get a brief explanation
            </div>
          )}
        </div>
      )}

      {/* minimized pill */}
      {minimized && !open && (
        <button 
          onClick={() => { setMinimized(false); setOpen(true); setUnread(0); }} 
          className="fixed bottom-4 right-4 z-50 rounded-full px-4 py-3 glass border border-white/10 text-white shadow-lg hover:scale-105 transition-transform"
          data-ai-widget="true"
        >
          🤖 AI Assistant {unread > 0 && <span className="ml-2 text-xs bg-emerald-600 rounded-full px-2 animate-pulse">{unread}</span>}
        </button>
      )}

      {!open && !minimized && (
        <div className="fixed right-3 z-50 flex items-center gap-2" style={{ bottom: 'calc(var(--bottom-bar-height, 160px) + 56px)' }} data-ai-widget="true">
          <label className="flex items-center gap-2 text-xs text-white/80 bg-neutral-900/70 rounded-full px-3 py-2 border border-white/10 hover:bg-neutral-800/70 transition-colors">
            <input 
              type="checkbox" 
              checked={explainMode} 
              onChange={(e)=> setExplainMode(e.target.checked)} 
              className="rounded text-emerald-500 focus:ring-emerald-500 focus:ring-2"
            /> 
            Explain elements
          </label>
          <button 
            onClick={() => setOpen(true)} 
            className="rounded-full w-12 h-12 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:scale-105 transition-all"
            title="Open AI Assistant"
          >
            {loading ? "⏳" : "🤖"}
          </button>
        </div>
      )}

      {open && !minimized && (
        <div
          ref={panelRef}
          style={{ width: size.w, height: size.h, right: pos.right, bottom: pos.bottom }}
          className="fixed glass rounded-2xl border border-white/10 p-3 z-50 flex flex-col shadow-2xl"
          data-ai-widget="true"
        >
          <div
            className="flex items-center justify-between pb-2 cursor-move select-none border-b border-white/10"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startRight = pos.right;
              const startBottom = pos.bottom;
              const move = (ev: MouseEvent) => {
                const dx = ev.clientX - startX;
                const dy = ev.clientY - startY;
                setPos({ right: Math.max(8, startRight - dx), bottom: Math.max(60, startBottom - dy) });
              };
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            data-ai-widget="true"
          >
            <div className="text-sm font-medium flex items-center gap-2">
              <span>🤖</span> AI Assistant
            </div>
            <div className="flex items-center gap-2">
              <button 
                className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded hover:bg-white/10 transition-colors" 
                onClick={() => {
                  setMinimized(true);
                  setOpen(false);
                }}
                data-ai-widget="true"
              >
                ➖ Minimize
              </button>
              <button 
                className="text-xs opacity-70 hover:opacity-100 px-2 py-1 rounded hover:bg-white/10 transition-colors" 
                onClick={() => {
                  setOpen(false);
                  setExplainMode(false);
                }}
                data-ai-widget="true"
              >
                ✕ Close
              </button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto space-y-2 py-2">
            {messages.map((m, idx) => (
              <div 
                key={idx} 
                className={`text-sm px-3 py-2 rounded-xl animate-slide-in-up ${
                  m.role === "assistant" 
                    ? "bg-emerald-600/30 border border-emerald-500/30" 
                    : "bg-neutral-800/70 border border-white/10 ml-auto max-w-[80%]"
                }`}
                data-ai-widget="true"
              >
                {m.content}
              </div>
            ))}
            {loading && (
              <div className="text-sm px-3 py-2 rounded-xl bg-emerald-600/30 border border-emerald-500/30 animate-pulse" data-ai-widget="true">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-xs opacity-70">AI is thinking...</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="pt-2 flex gap-2 border-t border-white/10" data-ai-widget="true">
            <input 
              value={input} 
              onChange={(e)=> setInput(e.target.value)} 
              onKeyDown={(e)=> {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  ask(input);
                }
              }} 
              placeholder="Ask anything..." 
              className="flex-1 rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
              disabled={loading}
              data-ai-widget="true"
            />
            <button 
              disabled={loading || !input.trim()} 
              onClick={() => ask(input)} 
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              data-ai-widget="true"
            >
              {loading ? "⏳" : "📤"}
            </button>
            {loading && (
              <button 
                onClick={stop} 
                className="rounded-xl bg-red-600 hover:bg-red-500 px-3 py-2 transition-all text-sm"
                data-ai-widget="true"
              >
                ⏹️
              </button>
            )}
          </div>
          
          {/* resize handle */}
          <div
            className="absolute right-1 bottom-1 w-4 h-4 cursor-se-resize opacity-50 hover:opacity-100 transition-opacity"
            onMouseDown={(e) => {
              const startX = e.clientX;
              const startY = e.clientY;
              const startW = size.w;
              const startH = size.h;
              const move = (ev: MouseEvent) => {
                setSize({ w: Math.max(320, startW + (ev.clientX - startX)), h: Math.max(280, startH + (ev.clientY - startY)) });
              };
              const up = () => { window.removeEventListener("mousemove", move); window.removeEventListener("mouseup", up); };
              window.addEventListener("mousemove", move);
              window.addEventListener("mouseup", up);
            }}
            data-ai-widget="true"
          >
            <svg className="w-4 h-4 text-white/50" fill="currentColor" viewBox="0 0 24 24">
              <path d="M22 22H20V20H22V22ZM22 18H20V16H22V18ZM18 22H16V20H18V22ZM18 18H16V16H18V18ZM14 22H12V20H14V22ZM22 14H20V12H22V14Z"/>
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}


