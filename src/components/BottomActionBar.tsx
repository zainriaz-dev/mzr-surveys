"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import ShareButton from "@/components/ShareButton";
import { GitHub, Launch } from "@/components/icons/IconMappings";

export default function BottomActionBar({
  title,
  description,
}: {
  title?: string;
  description?: string;
}) {
  const [openSource, setOpenSource] = useState(false);
  const barRef = useRef<HTMLDivElement | null>(null);

  // Reserve enough space so content never hides behind the fixed bar
  useEffect(() => {
    if (!barRef.current) return;

    const applyPadding = () => {
      const h = barRef.current ? barRef.current.getBoundingClientRect().height : 0;
      const reserve = Math.ceil(h + 16); // a little extra breathing room
      document.documentElement.style.setProperty("--bottom-bar-height", `${reserve}px`);
      document.body.style.paddingBottom = `${reserve}px`;
    };

    applyPadding();
    const ro = new ResizeObserver(() => applyPadding());
    ro.observe(barRef.current);
    window.addEventListener("orientationchange", applyPadding);
    window.addEventListener("resize", applyPadding);
    return () => {
      ro.disconnect();
      window.removeEventListener("orientationchange", applyPadding);
      window.removeEventListener("resize", applyPadding);
      document.body.style.paddingBottom = "";
      document.documentElement.style.removeProperty("--bottom-bar-height");
    };
  }, []);

  return (
    <div ref={barRef} className="fixed inset-x-0 bottom-0 z-50 bg-black/30 backdrop-blur-md border-t border-white/10 bottom-action-bar">
      <div className="mx-auto max-w-5xl px-3 sm:px-4 py-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Share */}
          <ShareButton title={title} description={description} />

          {/* Open Source toggle + content */}
          <div className="flex-1 min-w-[180px]">
            <button
              type="button"
              onClick={() => setOpenSource((v) => !v)}
              className="rounded-full bg-white/10 border border-white/15 text-white text-xs sm:text-sm px-3 py-1.5 hover:bg-white/15"
            >
              MZR Survey • open‑source
            </button>

            {openSource && (
              <div className="mt-2 rounded-xl bg-white/5 border border-white/10 p-3 text-white">
                <div className="text-xs sm:text-sm mb-2">
                  MZR Survey is proudly open‑source. Explore, self‑host, and improve.
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="https://github.com/zainriaz-dev/mzr-survey"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors text-sm font-medium"
                  >
                    <GitHub sx={{ fontSize: 16 }} />
                    GitHub Repo
                  </Link>
                  <Link
                    href="https://zainriaz.dev"
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-slate-700/70 hover:bg-slate-600/80 transition-colors text-sm font-medium"
                  >
                    <Launch sx={{ fontSize: 16 }} />
                    Portfolio
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Flexible spacer so controls push left on wide screens and wrap on small */}
          <div className="grow" />
        </div>
      </div>
    </div>
  );
}


