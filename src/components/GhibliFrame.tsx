"use client";
import React from "react";

// A simple ornamented frame with organic shapes and soft gradient, inspired by Ghibli vibes
export function GhibliFrame({ children, title, actions }: { children: React.ReactNode; title?: string; actions?: React.ReactNode }) {
  return (
    <div className="relative rounded-2xl p-[1px] bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-amber-300/30">
      <div className="rounded-2xl bg-[#0F2C2C] border border-[#16423C] overflow-hidden">
        {title && (
          <div className="flex items-center justify-between px-[var(--card-pad)] py-3 bg-[radial-gradient(1200px_200px_at_50%_-100px,rgba(255,255,255,0.08),transparent)]">
            <h3 className="text-base sm:text-lg font-medium text-white/90">{title}</h3>
            {actions}
          </div>
        )}
        <div className="px-[var(--card-pad)] py-[calc(var(--card-pad)-4px)]">{children}</div>
      </div>
      {/* floating organic blobs */}
      <div className="pointer-events-none absolute -top-6 -left-6 h-16 w-16 rounded-full bg-emerald-500/20 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-6 -right-10 h-20 w-20 rounded-full bg-amber-400/20 blur-2xl" />
    </div>
  );
}

export function GhibliButton({ children, color = "emerald", onClick, type = "button", disabled }: { children: React.ReactNode; color?: "emerald" | "amber" | "neutral"; onClick?: () => void; type?: "button" | "submit"; disabled?: boolean; }) {
  const colorClasses = {
    emerald: "bg-emerald-600 hover:bg-emerald-500",
    amber: "bg-amber-600 hover:bg-amber-500",
    neutral: "bg-neutral-800 hover:bg-neutral-700",
  } as const;
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-white text-sm sm:text-base transition-colors disabled:opacity-50 min-h-[44px] touch-manipulation ${colorClasses[color]}`}>
      {children}
    </button>
  );
}

export function GhibliChip({ children }: { children: React.ReactNode }) {
  return <span className="inline-block px-3 py-1 rounded-full bg-black/30 border border-white/10 text-xs">{children}</span>;
}


