"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function AppHeader() {
  const { t, lang, setLang } = useI18n();
  return (
    <header className="sticky top-0 z-40 backdrop-blur supports-[backdrop-filter]:bg-black/30 bg-black/20 border-b border-white/10">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-white">
          <span className="inline-block h-3 w-3 rounded-full bg-emerald-500" />
          <span className="font-semibold">MZR Survey</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/survey" className="opacity-80 hover:opacity-100">{t("start_survey")}</Link>
          <select aria-label="Language" className="rounded-xl bg-neutral-900 border border-white/10 px-3 py-1.5" value={lang} onChange={(e)=> setLang(e.target.value as any)}>
            <option value="en">English</option>
            <option value="ur">اردو</option>
          </select>
        </nav>
      </div>
    </header>
  );
}


