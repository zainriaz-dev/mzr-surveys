"use client";
import React from "react";

type Props = {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
};

export function IssueCheckboxes({ label, options, value, onChange }: Props) {
  const toggle = (opt: string) => {
    const set = new Set(value);
    if (set.has(opt)) set.delete(opt);
    else set.add(opt);
    onChange(Array.from(set));
  };
  return (
    <div className="space-y-2">
      <div className="text-sm opacity-80">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <label key={opt} className={`px-3 py-1 rounded-full border text-xs cursor-pointer transition-colors ${value.includes(opt) ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10"}`}>
            <input type="checkbox" className="hidden" checked={value.includes(opt)} onChange={() => toggle(opt)} />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

export const PRESET = {
  technology: [
    "Digital divide",
    "Device access",
    "Internet cost",
    "Slow speed",
    "Online safety",
    "Cyberbullying",
    "Women access gap",
    "Job skills",
    "Repair/service",
  ],
  healthcare: [
    "Clean water",
    "Clinic access",
    "Medicine cost",
    "Maternal health",
    "Mental health",
    "Vaccination",
    "Nutrition",
  ],
  genz: [
    "Study stress",
    "Exam pressure",
    "Jobs",
    "Skill gap",
    "Language barrier",
    "Mobility",
    "Online safety",
  ],
};


