"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Mode = "fixed" | "inline";
type Placement = "center" | "left";

export default function OpenSourceFooter({ mode = "inline", placement = "center", offsetPx = 165 }: { mode?: Mode; placement?: Placement; offsetPx?: number }) {
  const [expanded, setExpanded] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Avoid overlap with bottom nav buttons on mobile by lifting the bar higher
  const bottom = useMemo(() => {
    if (typeof window === "undefined") return "24px";
    const isSmall = window.innerWidth < 640; // sm breakpoint
    // Lift higher to clear the Share button and Next nav on mobile
    return isSmall ? `calc(env(safe-area-inset-bottom) + ${offsetPx}px)` : "24px";
  }, [offsetPx]);

  useEffect(() => {
    setMounted(true);
    const dismissed = sessionStorage.getItem("osf_dismissed") === "1";
    if (dismissed) setExpanded(false);
  }, []);

  if (!mounted) return null;

  const Wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    if (mode === "fixed") {
      if (placement === "left") {
        return (
          <div className="pointer-events-auto fixed z-30 px-3" style={{ bottom, left: 16 }} aria-live="polite">
            {children}
          </div>
        );
      }
      return (
        <div className="pointer-events-auto fixed left-1/2 -translate-x-1/2 z-30 px-3" style={{ bottom }} aria-live="polite">
          {children}
        </div>
      );
    }
    // inline: sits inside the flow, docks above bottom controls without overlap
    // Place the bar a bit higher to leave more breathing room above bottom buttons
    const inlineBottom = "calc(env(safe-area-inset-bottom) + 165px)";
    const reservedHeight = expanded ? 64 : 40; // px
    return (
      <div className="pointer-events-none sticky z-20 px-3 mx-auto max-w-5xl" style={{ bottom: inlineBottom }} aria-live="polite">
        {/* reserve space so nothing overlaps */}
        <div className="relative w-full transition-[height] duration-300 ease-out" style={{ height: reservedHeight }}>
          <div className="pointer-events-auto absolute inset-0 flex justify-center items-center">
            {children}
          </div>
        </div>
      </div>
    );
  };

  return (
    <Wrapper>
      {expanded ? (
        <div className="rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-xl text-white p-3 sm:p-4 w-full">
          <div className="flex items-start justify-between gap-3">
            <div className="text-sm sm:text-base">
              <span className="font-semibold">MZR Survey</span> is proudly open‑source. Explore, self‑host, and improve.
            </div>
            <button
              type="button"
              onClick={() => setExpanded(false)}
              aria-label="Collapse"
              className="h-7 w-7 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20"
            >
              ×
            </button>
          </div>
          <div className="mt-3 grid grid-cols-2 sm:flex sm:flex-row gap-2">
            <Link
              href="https://github.com/zainriaz-dev/mzr-surveys"
              target="_blank"
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm font-medium"
            >
              GitHub Repo
            </Link>
            <Link
              href="https://zainriaz.dev"
              target="_blank"
              className="inline-flex items-center justify-center px-3 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-600/80 transition-colors text-sm font-medium"
            >
              Portfolio
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex justify-center">
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="rounded-full bg-white/10 border border-white/15 backdrop-blur-md shadow-xl text-white text-xs sm:text-sm px-3 py-1.5 hover:bg-white/15"
            aria-label="Show open‑source message"
          >
            MZR Survey • open‑source
          </button>
        </div>
      )}
    </Wrapper>
  );
}


