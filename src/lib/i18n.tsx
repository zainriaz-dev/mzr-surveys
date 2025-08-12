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


