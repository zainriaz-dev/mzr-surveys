"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { GhibliFrame } from "@/components/GhibliFrame";
import FaqSection from "@/components/FaqSection";
import GhibliArt from "@/components/GhibliArt";
import BottomActionBar from "@/components/BottomActionBar";
import { Security, AutoAwesome, Language, Storage, People, Settings, Lightbulb } from "@/components/icons/IconMappings";

export default function Home() {
  const { t, lang, setLang } = useI18n();
  return (
    <>
      <main className="text-white" style={{ paddingBottom: 'var(--bottom-bar-height, 160px)' }}>
        {/* HERO */}
        <section className="relative mx-auto max-w-6xl px-[var(--container-pad)] pt-12 md:pt-16 pb-10 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
          {/* Animated Star Field Background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 1200 600" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <radialGradient id="star-gradient" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(16, 185, 129, 0.6)" />
                  <stop offset="70%" stopColor="rgba(16, 185, 129, 0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
                <radialGradient id="purple-star" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="rgba(147, 51, 234, 0.6)" />
                  <stop offset="70%" stopColor="rgba(147, 51, 234, 0.2)" />
                  <stop offset="100%" stopColor="transparent" />
                </radialGradient>
              </defs>
              <circle cx="100" cy="80" r="1" fill="url(#star-gradient)" className="animate-drift">
                <animate attributeName="opacity" values="0.3;1;0.3" dur="4s" repeatCount="indefinite" />
              </circle>
              <circle cx="300" cy="150" r="0.5" fill="url(#purple-star)" className="animate-drift-slow">
                <animate attributeName="opacity" values="0.2;0.8;0.2" dur="6s" repeatCount="indefinite" />
              </circle>
              <circle cx="800" cy="100" r="1.5" fill="url(#star-gradient)" className="animate-drift">
                <animate attributeName="opacity" values="0.4;1;0.4" dur="3s" repeatCount="indefinite" />
              </circle>
              <circle cx="1000" cy="200" r="0.8" fill="url(#purple-star)" className="animate-drift-slow">
                <animate attributeName="opacity" values="0.3;0.9;0.3" dur="5s" repeatCount="indefinite" />
              </circle>
              <circle cx="200" cy="300" r="0.6" fill="url(#star-gradient)" className="animate-drift">
                <animate attributeName="opacity" values="0.2;0.7;0.2" dur="7s" repeatCount="indefinite" />
              </circle>
              <circle cx="600" cy="250" r="1.2" fill="url(#purple-star)" className="animate-drift-slow">
                <animate attributeName="opacity" values="0.5;1;0.5" dur="4.5s" repeatCount="indefinite" />
              </circle>
            </svg>
          </div>

          <div className="relative z-10 space-y-6">
            <h1 className="text-3xl md:text-5xl font-semibold leading-tight">
              {t("app_title")}
            </h1>
            <p className="opacity-85 text-base md:text-lg max-w-2xl">
              {t("app_tagline")}
            </p>
            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">{t("villages")}</span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">{t("cities")}</span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">{t("youth")}</span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">{t("healthcare")}</span>
              <span className="px-3 py-1 rounded-full bg-black/20 border border-white/10 text-xs">{t("tech_access")}</span>
            </div>
            <div className="flex gap-3 pt-1">
              <Link className="btn-primary px-5 py-3 rounded-xl font-medium" href="/survey">{t("start_survey")}</Link>
              <a className="px-5 py-3 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-white/10 transition-all duration-300" href="#faq">{t("learn_more")}</a>
            </div>
          </div>
          
          {/* Full-bleed Glass Card with animated gradient lines */}
          <div className="relative aspect-[4/3] rounded-2xl glass-card border border-white/10 overflow-hidden">
            {/* Animated Gradient Lines */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-emerald-400 to-transparent animate-gradient-x"></div>
              <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-400 to-transparent animate-gradient-x-reverse"></div>
              <div className="absolute top-0 left-0 w-px h-full bg-gradient-to-b from-transparent via-teal-400 to-transparent animate-gradient-y"></div>
              <div className="absolute top-0 right-0 w-px h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent animate-gradient-y-reverse"></div>
            </div>
            
            {/* Enhanced background effects */}
            <div className="absolute -top-10 left-10 w-64 h-64 bg-emerald-400/10 blur-3xl rounded-full animate-pulse-slow" />
            <div className="absolute bottom-0 right-0 w-56 h-56 bg-purple-500/10 blur-3xl rounded-full animate-pulse-slow" />
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-teal-400/10 blur-2xl rounded-full animate-float" />
            
            {/* Content Layer */}
            <div className="absolute inset-0 z-10">
              <GhibliArt className="w-full h-full opacity-80" />
            </div>
            
            {/* Enhanced overlay gradients */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none z-20" />
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/10 via-transparent to-purple-900/10 pointer-events-none z-20" />
          </div>
        </section>

        {/* FEATURES/BENEFITS */}
        <section className="mx-auto max-w-6xl px-[var(--container-pad)] pb-12">
          <div className="grid md:grid-cols-4 gap-4">
            <div className="group">
              <GhibliFrame>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Security sx={{ fontSize: 32, color: '#34d399' }} className="transition-all duration-300 group-hover:scale-110" />
                    {/* Glowing line accent on hover */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent transition-all duration-300 group-hover:w-16 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 mb-1">{t("privacy_first")}</h4>
                    <p className="text-xs text-white/70">{t("privacy_first_desc")}</p>
                  </div>
                </div>
              </GhibliFrame>
            </div>
            
            <div className="group">
              <GhibliFrame>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <AutoAwesome sx={{ fontSize: 32, color: '#c084fc' }} className="transition-all duration-300 group-hover:scale-110" />
                    {/* Glowing line accent on hover */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent transition-all duration-300 group-hover:w-16 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 mb-1">{t("ai_assist")}</h4>
                    <p className="text-xs text-white/70">{t("ai_assist_desc")}</p>
                  </div>
                </div>
              </GhibliFrame>
            </div>
            
            <div className="group">
              <GhibliFrame>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Language sx={{ fontSize: 32, color: '#2dd4bf' }} className="transition-all duration-300 group-hover:scale-110" />
                    {/* Glowing line accent on hover */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-teal-400 to-transparent transition-all duration-300 group-hover:w-16 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 mb-1">{t("multilingual")}</h4>
                    <p className="text-xs text-white/70">{t("multilingual_desc")}</p>
                  </div>
                </div>
              </GhibliFrame>
            </div>
            
            <div className="group">
              <GhibliFrame>
                <div className="flex flex-col items-center text-center space-y-3">
                  <div className="relative">
                    <Storage sx={{ fontSize: 32, color: '#fbbf24' }} className="transition-all duration-300 group-hover:scale-110" />
                    {/* Glowing line accent on hover */}
                    <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-transparent via-amber-400 to-transparent transition-all duration-300 group-hover:w-16 opacity-0 group-hover:opacity-100"></div>
                  </div>
                  <div>
                    <h4 className="font-medium text-white/90 mb-1">{t("open_data")}</h4>
                    <p className="text-xs text-white/70">{t("open_data_desc")}</p>
                  </div>
                </div>
              </GhibliFrame>
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="survey-section mx-auto max-w-6xl px-[var(--container-pad)] pb-8">
          <div className="grid md:grid-cols-3 gap-4">
            <GhibliFrame title={t("share_your_reality")}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <People sx={{ fontSize: 20, color: '#34d399' }} />
                </div>
                <div className="text-sm">
                  {t("share_your_reality_desc")}
                </div>
              </div>
            </GhibliFrame>
            
            <GhibliFrame title={t("ai_helps_clarify")}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Settings sx={{ fontSize: 20, color: '#c084fc' }} />
                </div>
                <div className="text-sm">
                  {t("ai_helps_clarify_desc")}
                </div>
              </div>
            </GhibliFrame>
            
            <GhibliFrame title={t("build_small_tools")}>
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 mt-1">
                  <Lightbulb sx={{ fontSize: 20, color: '#facc15' }} />
                </div>
                <div className="text-sm">
                  {t("build_small_tools_desc")}
                </div>
              </div>
            </GhibliFrame>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="mx-auto max-w-6xl px-[var(--container-pad)] pb-16">
          <FaqSection />
        </section>
      </main>
      <BottomActionBar
        title={t("app_title")}
        description={t("app_tagline")}
      />
    </>
  );
}
