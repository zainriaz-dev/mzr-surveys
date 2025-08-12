"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { GhibliFrame } from "@/components/GhibliFrame";
import FaqSection from "@/components/FaqSection";
import GhibliArt from "@/components/GhibliArt";
import OpenSourceFooter from "@/components/OpenSourceFooter";

export default function Home() {
  const { t, lang, setLang } = useI18n();
  return (
    <main className="text-white">
      {/* HERO */}
      <section className="mx-auto max-w-6xl px-[var(--container-pad)] pt-12 md:pt-16 pb-10 grid md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
            {t("app_title")}
          </h1>
          <p className="opacity-85 text-base md:text-lg max-w-2xl">
            {t("app_tagline")}
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">Villages</span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">Cities</span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">Youth</span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">Healthcare</span>
            <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">Tech Access</span>
          </div>
          <div className="flex gap-3 pt-1">
            <Link className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500" href="/survey">{t("start_survey")}</Link>
            <a className="px-5 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-white/10" href="#faq">Learn more</a>
          </div>
        </div>
        <div className="relative h-64 md:h-80 rounded-2xl glass border border-white/10 overflow-hidden">
          <div className="absolute -top-10 left-10 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full" />
          <div className="absolute bottom-0 right-0 w-56 h-56 bg-amber-400/10 blur-3xl rounded-full" />
          <div className="absolute inset-0">
            <GhibliArt className="w-full h-full opacity-80" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-6xl px-[var(--container-pad)] pb-8">
        <GhibliFrame title="How it works">
          <ol className="grid md:grid-cols-3 gap-4 text-sm">
            <li className="bg-black/10 border border-white/10 rounded-xl p-4">
              <div className="font-medium mb-1">1) Share your reality</div>
              Short, mobile-first questions about daily life and tech.
            </li>
            <li className="bg-black/10 border border-white/10 rounded-xl p-4">
              <div className="font-medium mb-1">2) AI helps clarify</div>
              Optional refine buttons and assistant for Urdu/Roman/English.
          </li>
            <li className="bg-black/10 border border-white/10 rounded-xl p-4">
              <div className="font-medium mb-1">3) Build small tools</div>
              We publish simple tools, guides and insights from results.
          </li>
        </ol>
        </GhibliFrame>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto max-w-6xl px-[var(--container-pad)] pb-16">
        <FaqSection />
      </section>
      <OpenSourceFooter mode="inline" />
      </main>
  );
}
