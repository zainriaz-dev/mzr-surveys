"use client";
import React, { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

type Tone = "en" | "ur" | "roman";

export default function AiRefineControl({
  value,
  onChange,
  tone,
  fieldName,
}: {
  value: string | undefined;
  onChange: (next: string) => void;
  tone: Tone;
  fieldName: string;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refined, setRefined] = useState<string | null>(null);
  const [shortText, setShortText] = useState<string | null>(null);
  const [open, setOpen] = useState(false);

  function sanitize(text: string): string {
    if (!text) return "";
    return text
      .replace(/\*{1,}/g, "")
      .replace(/^\s*["']|["']\s*$/g, "")
      .replace(/\s{2,}/g, " ")
      .trim();
  }

  const closeModal = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [open]);

  async function refine() {
    setLoading(true);
    setError(null);
    setRefined(null);
    setShortText(null);
    try {
      const contextParts: string[] = [];
      if (tone === "ur") contextParts.push("Respond in Urdu script.");
      if (tone === "roman") contextParts.push("Respond in Roman Urdu.");
      const context = contextParts.join(" ");

      const res = await fetch("/api/ai-enhance-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: value || "",
          question: fieldName,
          mode: "improve",
          context,
          questionType: (value || "").length <= 160 ? "short_text" : "text",
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) throw new Error(json?.error || "AI enhancement failed");

      const enhanced: string = sanitize(json.enhancedAnswer || "");
      setRefined(enhanced);
      setShortText(enhanced.length > 160 ? sanitize(enhanced.slice(0, 160)) : enhanced);
      setOpen(true);
    } catch (e: any) {
      setError("Enhancement unavailable right now. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  }

  const modalContent = open && (refined || shortText) && typeof window !== 'undefined' ? (
    createPortal(
      <div className="ai-modal-overlay">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 z-[9999] bg-black/70 backdrop-blur-sm"
          onClick={closeModal}
        />
        
        {/* Bottom Sheet Modal */}
        <div className="fixed inset-x-0 bottom-0 z-[10000] bg-slate-900/95 backdrop-blur-lg rounded-t-3xl border-t border-white/20 shadow-2xl transform transition-transform duration-300 ease-out">
          <div className="p-4 max-h-[80vh] overflow-y-auto">
            {/* Handle bar */}
            <div className="flex justify-center mb-4">
              <div className="w-12 h-1.5 bg-white/40 rounded-full"></div>
            </div>
            
            <div className="space-y-4">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">🤖 AI Suggestions</h3>
                <p className="text-sm text-white/70">Choose which version you prefer</p>
              </div>

              {refined && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-emerald-400">✨ Refined Version</div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-white border border-white/10">
                    {refined}
                  </div>
                  <button 
                    type="button" 
                    className="w-full bg-emerald-600 hover:bg-emerald-500 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all" 
                    onClick={() => { 
                      onChange(refined!); 
                      closeModal(); 
                    }}
                  >
                    Use Refined Version
                  </button>
                </div>
              )}
              
              {shortText && (
                <div className="space-y-3">
                  <div className="text-sm font-medium text-blue-400">🎯 Short Version</div>
                  <div className="bg-slate-800/50 rounded-lg p-4 text-sm text-white border border-white/10">
                    {shortText}
                  </div>
                  <button 
                    type="button" 
                    className="w-full bg-blue-600 hover:bg-blue-500 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all" 
                    onClick={() => { 
                      onChange(shortText!); 
                      closeModal(); 
                    }}
                  >
                    Use Short Version
                  </button>
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                  <div className="text-red-400 text-sm">{error}</div>
                </div>
              )}

              <button 
                type="button" 
                onClick={closeModal}
                className="w-full bg-slate-700/50 hover:bg-slate-600/50 px-4 py-3 rounded-lg text-white/70 text-sm font-medium transition-all border border-white/10"
              >
                Close
              </button>
            </div>
            
            {/* Safe area padding for mobile */}
            <div className="h-[env(safe-area-inset-bottom)] min-h-4"></div>
          </div>
        </div>
      </div>,
      document.body
    )
  ) : null;

  return (
    <>
      <div className="inline-flex items-center gap-2">
        <button 
          type="button" 
          onClick={refine} 
          disabled={loading || !value} 
          className="text-xs px-2 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Refining..." : "Enhance with AI"}
        </button>
      </div>
      
      {modalContent}
    </>
  );
}


