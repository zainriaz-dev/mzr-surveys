"use client";
import React, { useEffect } from "react";

function applyDensity(width: number) {
  const root = document.documentElement;
  if (width < 360) {
    root.style.setProperty("--container-pad", "12px");
    root.style.setProperty("--card-pad", "12px");
    root.style.setProperty("--control-pad-y", "8px");
    root.style.setProperty("--control-pad-x", "10px");
    root.style.setProperty("--font-size-base", "14px");
  } else if (width < 480) {
    root.style.setProperty("--container-pad", "14px");
    root.style.setProperty("--card-pad", "14px");
    root.style.setProperty("--control-pad-y", "10px");
    root.style.setProperty("--control-pad-x", "12px");
    root.style.setProperty("--font-size-base", "15px");
  } else if (width < 640) {
    root.style.setProperty("--container-pad", "16px");
    root.style.setProperty("--card-pad", "16px");
    root.style.setProperty("--control-pad-y", "12px");
    root.style.setProperty("--control-pad-x", "14px");
    root.style.setProperty("--font-size-base", "16px");
  } else {
    root.style.setProperty("--container-pad", "24px");
    root.style.setProperty("--card-pad", "20px");
    root.style.setProperty("--control-pad-y", "12px");
    root.style.setProperty("--control-pad-x", "14px");
    root.style.setProperty("--font-size-base", "16px");
  }
}

export function ResponsiveProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const set = () => applyDensity(window.innerWidth);
    set();
    window.addEventListener("resize", set);
    return () => window.removeEventListener("resize", set);
  }, []);
  return <>{children}</>;
}


