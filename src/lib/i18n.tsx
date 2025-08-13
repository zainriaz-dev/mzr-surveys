"use client";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

type Language = "en" | "ur";

type I18nContextValue = {
  lang: Language;
  setLang: (l: Language) => void;
  t: (key: string) => string;
};

const I18nContext = createContext<I18nContextValue | undefined>(undefined);

const DICT: Record<Language, Record<string, string>> = {
  en: {
    app_title: "MZR Survey — Pakistan 2025",
    app_tagline: "Help us understand daily problems to build small, helpful AI tools.",
    start_survey: "Start Survey",
    admin: "Admin",
    demographics: "Demographics",
    age_group: "Age group",
    region: "Region",
    province: "Province",
    education: "Education",
    technology: "Technology",
    healthcare: "Healthcare",
    genz: "Gen Z / Youth",
    anything_else: "Anything else?",
    consent: "I agree my anonymous data can be used for research and tool-building.",
    ask_ai: "Ask AI Assistant",
    submit: "Submit",
    submitting: "Submitting...",
    loading: "Loading...",
    no_responses: "No responses yet.",
    admin_dashboard: "Admin Dashboard",
    download_json: "Download JSON",
    download_csv: "Download CSV",
    responses_by_region: "Responses by Region",
    responses_by_age: "Responses by Age",
    responses_by_province: "Responses by Province",
    tool_interest_trends: "Tool Interest Trends",
    login_title: "Admin Login",
    password: "Password",
    login: "Log in",
    // Homepage feature cards
    privacy_first: "Privacy First",
    privacy_first_desc: "Your data stays secure with transparent privacy practices",
    ai_assist: "AI Assist",
    ai_assist_desc: "Smart help to refine and clarify your responses",
    multilingual: "Multilingual",
    multilingual_desc: "Full support for Urdu, Roman Urdu, and English",
    open_data: "Open Data",
    open_data_desc: "Committed to transparency and open research",
    // Homepage tags
    villages: "Villages",
    cities: "Cities",
    youth: "Youth",
    tech_access: "Tech Access",
    learn_more: "Learn more",
    // How it works section
    share_your_reality: "1. Share your reality",
    share_your_reality_desc: "Short, mobile-first questions about daily life and tech.",
    ai_helps_clarify: "2. AI helps clarify",
    ai_helps_clarify_desc: "Optional refine buttons and assistant for Urdu/Roman/English.",
    build_small_tools: "3. Build small tools",
    build_small_tools_desc: "We publish simple tools, guides and insights from results.",
  },
  ur: {
    app_title: "ایم زی آر سروے — پاکستان ۲۰۲۵",
    app_tagline: "روزمرہ مسائل سمجھنے میں ہماری مدد کریں تاکہ چھوٹے مگر مفید اے آئی ٹولز بنا سکیں۔",
    start_survey: "سروے شروع کریں",
    admin: "ایڈمن",
    demographics: "آبادیاتی معلومات",
    age_group: "عمر کا گروپ",
    region: "علاقہ",
    province: "صوبہ",
    education: "تعلیم",
    technology: "ٹیکنالوجی",
    healthcare: "صحت",
    genz: "Gen Z / نوجوان",
    anything_else: "کچھ اور؟",
    consent: "میں رضامند ہوں کہ میرا ڈیٹا تحقیق اور ٹول بنانے کے لئے گمنام طور پر استعمال ہو۔",
    ask_ai: "اے آئی اسسٹنٹ سے پوچھیں",
    submit: "جمع کریں",
    submitting: "جمع ہو رہا ہے...",
    loading: "لوڈنگ...",
    no_responses: "ابھی کوئی جواب نہیں۔",
    admin_dashboard: "ایڈمن ڈیش بورڈ",
    download_json: "JSON ڈاؤن لوڈ کریں",
    download_csv: "CSV ڈاؤن لوڈ کریں",
    responses_by_region: "علاقے کے حساب سے جوابات",
    responses_by_age: "عمر کے حساب سے جوابات",
    responses_by_province: "صوبے کے حساب سے جوابات",
    tool_interest_trends: "ٹول میں دلچسپی کے رجحانات",
    login_title: "ایڈمن لاگ اِن",
    password: "پاس ورڈ",
    login: "لاگ اِن",
    // Homepage feature cards
    privacy_first: "پرائیویسی اول",
    privacy_first_desc: "آپ کا ڈیٹا شفاف رازداری کے طریقوں کے ساتھ محفوظ رہتا ہے",
    ai_assist: "اے آئی مدد",
    ai_assist_desc: "آپ کے جوابات کو بہتر اور واضح بنانے میں ذہین مدد",
    multilingual: "کثیر لسانی",
    multilingual_desc: "اردو، رومن اردو، اور انگریزی کی مکمل سہولت",
    open_data: "کھلا ڈیٹا",
    open_data_desc: "شفافیت اور کھلی تحقیق کے لیے پرعزم",
    // Homepage tags
    villages: "دیہات",
    cities: "شہر",
    youth: "نوجوان",
    tech_access: "ٹیک رسائی",
    learn_more: "مزید جانیں",
    // How it works section
    share_your_reality: "۱. اپنی حقیقت شیئر کریں",
    share_your_reality_desc: "روزمرہ زندگی اور ٹیکنالوجی کے بارے میں مختصر، موبائل فرسٹ سوالات۔",
    ai_helps_clarify: "۲. اے آئی واضح کرنے میں مدد کرتا ہے",
    ai_helps_clarify_desc: "اردو/رومن/انگریزی کے لیے اختیاری بہتر بٹن اور اسسٹنٹ۔",
    build_small_tools: "۳. چھوٹے ٹولز بنائیں",
    build_small_tools_desc: "ہم نتائج سے سادہ ٹولز، گائیڈز اور بصیرت شائع کرتے ہیں۔",
  },
};

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Language>("en");

  useEffect(() => {
    const saved = typeof window !== "undefined" ? (localStorage.getItem("lang") as Language | null) : null;
    if (saved === "en" || saved === "ur") setLang(saved);
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("lang", lang);
  }, [lang]);

  const value = useMemo<I18nContextValue>(() => ({
    lang,
    setLang,
    t: (key: string) => DICT[lang][key] ?? key,
  }), [lang]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}


