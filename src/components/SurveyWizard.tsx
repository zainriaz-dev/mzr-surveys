"use client";
import React, { useMemo, useState, useEffect } from "react";
import confetti from "canvas-confetti";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import AiRefineControl from "@/components/AiRefineControl";
import { PRESET, IssueCheckboxes } from "@/components/IssueCheckboxes";
import { GhibliFrame, GhibliButton } from "@/components/GhibliFrame";
import { useSurveyScheduling, SurveySchedulingSettings } from "@/hooks/useSurveyScheduling";

type WizardData = {
  demographics: any;
  topics: any;
  contact?: any;
  consent: boolean;
        digitalHabits?: {
        ageAnswer?: string;
        dailyPhoneHours?: string;
        topApps?: string[];
        topAppsOther?: string;
        usageAffectsProductivity?: string;
        usedAiTools?: string;
        biggestTechProblem?: string;
        helpfulServices?: string[];
        helpfulServicesOther?: string;
        willingToPay?: string;
        internetAccess?: string;
        dataLimits?: string;
        deviceOwnership?: string[];
        onlineEarning?: string;
      };
      techChallenges?: {
        codingExperience?: string;
        learningBarriers?: string[];
        resourceAccess?: string;
        mentorshipNeed?: string;
        skillGaps?: string[];
        techCareerInterest?: string;
      };
      careerFuture?: {
        currentStatus?: string;
        freelancingExperience?: string;
        remoteWorkChallenges?: string[];
        skillDevelopmentPriority?: string[];
        careerGoals?: string;
        financialStruggles?: string[];
        entrepreneurshipInterest?: string;
      };
};

export default function SurveyWizard() {
  const { register, handleSubmit, setValue, watch, formState } = useForm<WizardData>({
    defaultValues: {
      demographics: { ageGroup: "18-24", regionType: "city" },
      topics: {
        technology: { issues: [], interestInTools: true, desiredTools: [] },
        healthcare: { issues: [], interestInTools: true, desiredTools: [] },
        genZ: { issues: [], interestInTools: true, desiredTools: [] },
      },
      consent: false,
    },
  });
  const [step, setStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [surveySettings, setSurveySettings] = useState<SurveySchedulingSettings | null>(null);
  const [surveyForceClosed, setSurveyForceClosed] = useState(false);
  const [warningsShown, setWarningsShown] = useState<{fiveMinute: boolean, forceClose: boolean, tenMinuteBanner: boolean}>({fiveMinute: false, forceClose: false, tenMinuteBanner: false});
  const steps = useMemo(() => ["Demographics", "Digital Life", "Tech Challenges", "Learning & Skills", "Career & Future", "Summary"], []);

  // Monitor survey status for auto-close
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/survey-settings");
        const contentType = res.headers.get("content-type") || "";
        if (!res.ok || !contentType.includes("application/json")) {
          throw new Error("Non-JSON response");
        }
        const json = await res.json();
        if (json?.ok) {
          setSurveySettings(json.settings);
        } else {
          // Fallback to safe defaults to avoid blocking the form
          setSurveySettings({
            enabled: true,
            title: "Pakistan Tech & Society Survey 2025",
            description: "Advanced survey about technology, healthcare, and youth issues in Pakistan",
            scheduling: { startDate: null, endDate: null },
          } as any);
        }
      } catch (error) {
        console.error("Failed to fetch survey settings:", error);
        // Ensure the wizard still works even if the API returns HTML/login
        setSurveySettings({
          enabled: true,
          title: "Pakistan Tech & Society Survey 2025",
          description: "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          scheduling: { startDate: null, endDate: null },
        } as any);
      }
    };
    
    fetchSettings();
  }, []);

  const surveyStatus = useSurveyScheduling(surveySettings);

  // Auto-close survey if it becomes inactive while user is filling it
  useEffect(() => {
    if (!surveyStatus.active && surveySettings && !submitted && !surveyForceClosed && !warningsShown.forceClose) {
      setSurveyForceClosed(true);
      setWarningsShown(prev => ({ ...prev, forceClose: true }));
      // Removed red warning toast - survey will just close gracefully
    }
  }, [surveyStatus.active, surveySettings, submitted, surveyForceClosed, warningsShown.forceClose]);

  // Warning when survey is about to close (5 minutes remaining)
  useEffect(() => {
    if (surveyStatus.active && surveyStatus.endDate && !submitted && !warningsShown.fiveMinute) {
      const now = new Date();
      const endTime = new Date(surveyStatus.endDate);
      const timeRemaining = endTime.getTime() - now.getTime();
      const fiveMinutes = 5 * 60 * 1000; // 5 minutes in milliseconds
      
      if (timeRemaining <= fiveMinutes && timeRemaining > 0) {
        setWarningsShown(prev => ({ ...prev, fiveMinute: true }));
        toast("⚠️ Survey closes in 5 minutes! Please finish and submit your responses.", {
          duration: 10000,
          style: {
            background: 'rgba(245, 158, 11, 0.2)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            fontSize: '16px',
            fontWeight: '500',
            color: '#f59e0b'
          }
        });
      }
    }
  }, [surveyStatus.active, surveyStatus.endDate, submitted, warningsShown.fiveMinute]);
  
  // Track completion achievements
  const achievements = useMemo(() => {
    const count = completedSteps.length;
    const badges = [];
    if (count >= 1) badges.push({ icon: '🎆', title: 'Getting Started', desc: 'First step completed!' });
    if (count >= 3) badges.push({ icon: '💪', title: 'Halfway There', desc: 'Great progress!' });
    if (count >= 5) badges.push({ icon: '🏆', title: 'Almost Done', desc: 'One more step!' });
    if (count === 6) badges.push({ icon: '✨', title: 'Survey Master', desc: 'All sections completed!' });
    return badges;
  }, [completedSteps]);

  const onFinish = async (data: WizardData) => {
    setIsSubmitting(true);
    const loadingToast = toast.loading("🚀 Submitting your survey responses...");
    
    try {
      const res = await fetch("/api/survey", { method: "POST", body: JSON.stringify(data) });
      
      toast.dismiss(loadingToast);
      
      if (res.ok) {
        setSubmitted(true);
        
        // Multiple confetti bursts for celebration
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }), 200);
        setTimeout(() => confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } }), 400);
        
        // Show success toast
        toast.success("🎉 Amazing! شکریہ! Your responses have been recorded successfully! 🇵🇰", {
          duration: 5000,
          style: {
            background: 'rgba(16, 185, 129, 0.2)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            fontSize: '16px',
            fontWeight: '500',
          }
        });
        
        // Reset form after celebration
        setTimeout(() => {
          setStep(0);
          setSubmitted(false);
          setCompletedSteps([]);
          toast("🔄 Ready for another survey!", {
            icon: '✨',
            duration: 2000
          });
        }, 3000);
      } else {
        let errorMessage = 'Please try again';
        try {
          const errorData = await res.json();
          if (typeof errorData.error === 'string') {
            errorMessage = errorData.error;
          } else if (errorData.message) {
            errorMessage = errorData.message;
          } else if (errorData.error && typeof errorData.error === 'object') {
            errorMessage = JSON.stringify(errorData.error);
          }
        } catch (e) {
          errorMessage = `HTTP ${res.status} - ${res.statusText}`;
        }
        toast.error(`❌ Failed to submit: ${errorMessage}`, {
          duration: 4000
        });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("🚫 Network error. Please check your internet connection and try again.", {
        duration: 4000
      });
      console.error("Survey submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const next = () => {
    setCompletedSteps(prev => {
      if (!prev.includes(step)) {
        // Show encouragement for completing a step
        const stepName = steps[step];
        toast(`✅ ${stepName} completed! Great progress!`, {
          icon: '🎯',
          duration: 2000,
          style: {
            fontSize: '14px',
          }
        });
        return [...prev, step].sort();
      }
      return prev;
    });
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  
  const back = () => setStep((s) => Math.max(s - 1, 0));

  // Calculate time remaining for warning banner
  const timeRemaining = useMemo(() => {
    if (!surveyStatus.endDate) return null;
    const now = new Date();
    const endTime = new Date(surveyStatus.endDate);
    const remaining = endTime.getTime() - now.getTime();
    return remaining > 0 ? remaining : 0;
  }, [surveyStatus.endDate]);

  const showTimeWarning = timeRemaining && timeRemaining <= 10 * 60 * 1000 && !warningsShown.tenMinuteBanner; // 10 minutes

  // Show the 10-minute banner once and mark it as shown
  useEffect(() => {
    if (showTimeWarning && !warningsShown.tenMinuteBanner) {
      setWarningsShown(prev => ({ ...prev, tenMinuteBanner: true }));
    }
  }, [showTimeWarning, warningsShown.tenMinuteBanner]);

  return (
    <div className="space-y-4 survey-wizard">
      {/* Time Warning Banner */}
      {showTimeWarning && (
        <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/40 rounded-xl p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <div className="font-semibold text-amber-400">Survey Closing Soon!</div>
              <div className="text-sm text-amber-200">
                Time remaining: {Math.floor((timeRemaining || 0) / 60000)} minutes. Please complete and submit your responses.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Progress Bar with Achievements */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium text-white/80">
            Progress: {Math.round(((completedSteps.length) / steps.length) * 100)}% Complete
          </div>
          <div className="flex gap-1">
            {achievements.slice(-2).map((badge, i) => (
              <div key={i} className="animate-bounce-in">
                <span className="text-lg" title={`${badge.title}: ${badge.desc}`}>
                  {badge.icon}
                </span>
              </div>
            ))}
          </div>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out animate-pulse-glow" 
            style={{ width: `${((step + 1) / steps.length) * 100}%` }} 
          />
          <div className="absolute inset-0 shimmer rounded-full" />
        </div>
      </div>
      {/* Enhanced Step Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs pb-2">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setStep(i)}
              className={`progress-step px-3 py-2 rounded-full border transition-all duration-300 chip ${
                i === step
                  ? "bg-emerald-600 border-emerald-500 text-white selected animate-pulse-glow"
                  : i < step
                  ? "bg-emerald-800/50 border-emerald-600/50 text-emerald-200"
                  : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"
              } ${i === step ? 'active' : ''}`}
            >
              <span className="relative z-10">
                {i < step ? '✓' : i + 1}. {s}
              </span>
            </button>
            {i < steps.length - 1 && <span className="opacity-30">·</span>}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="📊 Demographics">
          <div className="grid gap-5">
            <div>
              <div className="text-sm opacity-80 mb-2">Age group</div>
              <div className="flex flex-wrap gap-2">
                {(["<18","18-24","25-34","35-44","45-59","60+"] as const).map((v) => {
                  const cur = watch("demographics.ageGroup");
                  return (
                    <button type="button" key={v} onClick={() => setValue("demographics.ageGroup", v)} className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${cur === v ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10 hover:bg-black/30"}`}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80 mb-2">Region</div>
              <div className="flex flex-wrap gap-2">
                {(["village","town","city","remote"] as const).map((v) => {
                  const cur = watch("demographics.regionType");
                  return (
                    <button type="button" key={v} onClick={() => setValue("demographics.regionType", v)} className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${cur === v ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10 hover:bg-black/30"}`}>
                      {v}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80 mb-2">Province</div>
              <div className="flex flex-wrap gap-2">
                {(["Punjab","Sindh","Khyber Pakhtunkhwa","Balochistan","Gilgit-Baltistan","AJK","Islamabad"] as const).map((p) => {
                  const cur = watch("demographics.province");
                  return (
                    <button type="button" key={p} onClick={() => setValue("demographics.province", p)} className={`px-3 py-1.5 rounded-full border text-xs transition-colors ${cur === p ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10 hover:bg-black/30"}`}>
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>
            <div>
              <div className="text-sm opacity-80 mb-2">Education</div>
              <div className="flex flex-wrap gap-2">
                {(["none","primary","secondary","intermediate","bachelor","master","phd"] as const).map((e) => {
                  const cur = watch("demographics.education");
                  return (
                    <button type="button" key={e} onClick={() => setValue("demographics.education", e)} className={`px-3 py-1.5 rounded-full border text-xs transition-colors capitalize ${cur === e ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10 hover:bg-black/30"}`}>
                      {e}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </GhibliFrame>
        </div>
      )}

      {step === 1 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="📱 Digital Life & Access">
          <div className="space-y-5">
            {/* Internet Access Quality */}
            <div>
              <div className="text-sm mb-2 font-medium">🌐 How is your internet access at home?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["High-speed WiFi (fast)","Basic WiFi (slow/unstable)","Only mobile data","Very limited/no internet"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("digitalHabits.internetAccess")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Data Limits */}
            <div>
              <div className="text-sm mb-2 font-medium">📊 Do you worry about mobile data limits?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Yes, always careful about data","Sometimes, depends on month","Rarely worry about it","Have unlimited data"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("digitalHabits.dataLimits")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Device Ownership */}
            <div>
              <div className="text-sm mb-2 font-medium">📱 What devices do you personally own/use? (Select all)</div>
              <div className="flex flex-wrap gap-2">
                {["Android phone","iPhone","Laptop/Computer","Tablet","Smart TV","Gaming console","None (shared devices)"].map((opt) => {
                  const selected = (watch("digitalHabits.deviceOwnership") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("digitalHabits.deviceOwnership", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hours on phone */}
            <div>
              <div className="text-sm mb-2 font-medium">⏰ How many hours do you spend on your phone daily?</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["< 2 hours","2-4 hours","4-6 hours","6+ hours"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("digitalHabits.dailyPhoneHours")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Top apps */}
            <div>
              <div className="text-sm mb-2 font-medium">📱 Which apps do you spend most time on? (Choose up to 3)</div>
              <div className="flex flex-wrap gap-2">
                {(["TikTok","Instagram","YouTube","WhatsApp","Snapchat","Games","Others"] as const).map((opt) => {
                  const selected = (watch("digitalHabits.topApps") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else if (set.size < 3) set.add(opt);
                    setValue("digitalHabits.topApps", Array.from(set));
                  };
                  const disabled = !selected.includes(opt) && selected.length >= 3;
                  return (
                    <button key={opt} type="button" onClick={toggle} disabled={disabled} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"} ${disabled ? "opacity-50" : ""}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {(watch("digitalHabits.topApps") || []).includes("Others") && (
                <input className="mt-2 w-full rounded-lg bg-black/20 p-3 border border-white/10" placeholder="Others (please specify)" {...register("digitalHabits.topAppsOther")} />
              )}
            </div>

            {/* Online Earning */}
            <div>
              <div className="text-sm mb-2 font-medium">💰 Have you ever tried to earn money online?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Yes, actively earning","Tried but stopped","Want to start but don't know how","Not interested"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("digitalHabits.onlineEarning")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Focus impact */}
            <div>
              <div className="text-sm mb-2 font-medium">🎯 Does phone usage affect your focus/productivity?</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Yes, a lot","Sometimes","Not really","Never"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("digitalHabits.usageAffectsProductivity")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 5. Used AI tools */}
            <div>
              <div className="text-sm mb-2">Have you ever used AI tools like ChatGPT or others?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Yes, regularly","Tried once or twice","No, but interested","No, and not interested"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-md px-3 py-2">
                    <input type="radio" value={opt} {...register("digitalHabits.usedAiTools")} /> {opt}
                  </label>
                ))}
              </div>
            </div>

            {/* 6. Biggest tech problem */}
            <div className="relative">
              <div className="text-sm mb-2">What’s your biggest tech or phone problem right now?</div>
              <textarea
                rows={3}
                className="w-full rounded-md bg-black/20 p-2"
                placeholder="Type here..."
                {...register("digitalHabits.biggestTechProblem")}
              />
              <div className="mt-2">
                <AiRefineControl
                  value={watch("digitalHabits.biggestTechProblem")}
                  onChange={(v) => setValue("digitalHabits.biggestTechProblem", v)}
                  fieldName="Biggest Tech Problem"
                  tone="en"
                />
              </div>
            </div>

            {/* 7. Helpful services */}
            <div className="relative">
              <div className="text-sm mb-2">Which of these services would you find helpful? (Select all that apply)</div>
              <div className="flex flex-wrap gap-2">
                {[
                  "Help with reducing screen time",
                  "Setting up AI tools for study or work",
                  "Phone optimization (cleaning, speeding up)",
                  "Social media tips and tricks",
                  "Help with freelancing or earning online",
                  "Help with creating cool content (captions, bios)",
                  "Coding help or tutorials",
                  "Other",
                ].map((opt) => {
                  const selected = (watch("digitalHabits.helpfulServices") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("digitalHabits.helpfulServices", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1 rounded-full border text-xs ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500" : "bg-black/20 border-white/10"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
              {(watch("digitalHabits.helpfulServices") || []).includes("Other") && (
                <div className="mt-2">
                  <input
                    className="w-full rounded-md bg-black/20 p-2"
                    placeholder="Other (please specify)"
                    {...register("digitalHabits.helpfulServicesOther")}
                  />
                  <div className="mt-2">
                    <AiRefineControl
                      value={watch("digitalHabits.helpfulServicesOther")}
                      onChange={(v) => setValue("digitalHabits.helpfulServicesOther", v)}
                      fieldName="Other Helpful Service"
                      tone="en"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* 8. Willing to pay */}
            <div>
              <div className="text-sm mb-2">Would you be willing to pay around Rs. 250 (~$1) per month for a monthly “Tech Help Club” that gives you support and tips?</div>
              <div className="grid sm:grid-cols-3 gap-2">
                {["Yes, definitely","Maybe, depends on the benefits","No, I’m not interested"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-md px-3 py-2">
                    <input type="radio" value={opt} {...register("digitalHabits.willingToPay")} /> {opt}
                  </label>
                ))}
              </div>
            </div>
          </div>
        </GhibliFrame>
        </div>
      )}

      {step === 2 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="💻 Tech Challenges & Skills">
          <div className="space-y-5">
            {/* Coding Experience */}
            <div>
              <div className="text-sm mb-2 font-medium">💼 What's your coding/programming experience?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Expert (can build apps)","Intermediate (know basics)","Beginner (learning)","Never tried but interested","Not interested in coding"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("techChallenges.codingExperience")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Learning Barriers */}
            <div>
              <div className="text-sm mb-2 font-medium">🚧 What stops you from learning tech skills? (Select all)</div>
              <div className="flex flex-wrap gap-2">
                {["No time","Too expensive","No proper internet","No computer/laptop","Hard to understand","No guidance/mentor","Language barrier (English)","Don't know where to start"].map((opt) => {
                  const selected = (watch("techChallenges.learningBarriers") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("techChallenges.learningBarriers", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resource Access */}
            <div>
              <div className="text-sm mb-2 font-medium">📚 How do you usually learn new tech skills?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["YouTube videos","Online courses (free)","Online courses (paid)","Books/PDFs","Friends/family help","Institution/college","Haven't tried learning"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("techChallenges.resourceAccess")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Mentorship Need */}
            <div>
              <div className="text-sm mb-2 font-medium">👥 Would you benefit from a tech mentor/guide?</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Yes, desperately","Yes, helpful","Maybe","No need"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("techChallenges.mentorshipNeed")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Skill Gaps */}
            <div>
              <div className="text-sm mb-2 font-medium">🎯 Which skills do you want to improve? (Select all)</div>
              <div className="flex flex-wrap gap-2">
                {["Basic computer skills","English (technical)","Programming/coding","Graphic design","Video editing","Digital marketing","Data entry","AI tools usage","Freelancing skills"].map((opt) => {
                  const selected = (watch("techChallenges.skillGaps") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("techChallenges.skillGaps", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Tech Career Interest */}
            <div>
              <div className="text-sm mb-2 font-medium">🚀 Are you interested in a tech career?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Yes, it's my dream","Yes, but seems hard","Maybe, need to learn more","No, prefer other fields"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("techChallenges.techCareerInterest")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </GhibliFrame>
        </div>
      )}

      {step === 3 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="🎓 Learning & Education">
          <div className="space-y-5">
            <IssueCheckboxes
              label="📚 What are your biggest learning challenges?"
              options={[
                "Poor internet for online classes",
                "Can't afford good courses",
                "Hard to focus while studying",
                "No proper study space at home",
                "Language barrier (English content)",
                "No guidance on career path",
                "Outdated curriculum in school/college",
                "No access to latest learning tools"
              ]}
              value={watch("topics.learning.issues") || []}
              onChange={(v) => setValue("topics.learning.issues", v)}
            />
            
            <div className="relative">
              <div className="text-sm mb-2 font-medium">📝 What other learning challenges do you face?</div>
              <textarea
                rows={3}
                className="w-full rounded-lg bg-black/20 p-3 border border-white/10"
                placeholder="Describe your learning struggles..."
                {...register("topics.learning.details")}
              />
              <div className="mt-2">
                <AiRefineControl
                  value={watch("topics.learning.details")}
                  onChange={(v) => setValue("topics.learning.details", v)}
                  fieldName="Learning Challenges"
                  tone="en"
                />
              </div>
            </div>
            
            <label className="flex items-center gap-2 text-sm bg-black/20 rounded-lg p-3">
              <input type="checkbox" {...register("topics.learning.interestInTools")} className="text-emerald-500" /> 
              <span>🤖 I'd be interested in AI tools to help with learning</span>
            </label>
            
            <div>
              <div className="text-sm mb-2 font-medium">🛠️ What learning tools would help you most?</div>
              <input className="w-full rounded-lg bg-black/20 p-3 border border-white/10" placeholder="e.g., AI tutor, practice tests, study planner..." {...register("topics.learning.desiredTools")} />
              <div className="mt-2">
                <AiRefineControl
                  value={watch("topics.learning.desiredTools")}
                  onChange={(v) => setValue("topics.learning.desiredTools", v)}
                  fieldName="Desired Learning Tools"
                  tone="en"
                />
              </div>
            </div>
          </div>
        </GhibliFrame>
        </div>
      )}

      {step === 4 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="🚀 Career & Future Plans">
          <div className="space-y-5">
            {/* Current Status */}
            <div>
              <div className="text-sm mb-2 font-medium">🏁 What's your current situation?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Student (school/college)","Recent graduate","Working (part-time)","Working (full-time)","Unemployed but looking","Taking a break"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("careerFuture.currentStatus")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Freelancing Experience */}
            <div>
              <div className="text-sm mb-2 font-medium">💼 Have you tried freelancing or remote work?</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {["Yes, earning regularly","Tried but struggled","Want to start but confused","Not interested in freelancing"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("careerFuture.freelancingExperience")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Remote Work Challenges */}
            <div>
              <div className="text-sm mb-2 font-medium">🏠 What challenges do you face with remote work? (Select all)</div>
              <div className="flex flex-wrap gap-2">
                {["Unreliable internet","No quiet workspace","Client communication issues","Payment problems","Finding good clients","Skill competition","Time management","Family doesn't understand"].map((opt) => {
                  const selected = (watch("careerFuture.remoteWorkChallenges") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("careerFuture.remoteWorkChallenges", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Skill Development Priority */}
            <div>
              <div className="text-sm mb-2 font-medium">🎯 What skills do you want to develop for better career prospects? (Select up to 3)</div>
              <div className="flex flex-wrap gap-2">
                {["Communication skills","Technical skills","Leadership","Marketing/Sales","Financial planning","Language skills","Networking","Problem solving"].map((opt) => {
                  const selected = (watch("careerFuture.skillDevelopmentPriority") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else if (set.size < 3) set.add(opt);
                    setValue("careerFuture.skillDevelopmentPriority", Array.from(set));
                  };
                  const disabled = !selected.includes(opt) && selected.length >= 3;
                  return (
                    <button key={opt} type="button" onClick={toggle} disabled={disabled} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"} ${disabled ? "opacity-50" : ""}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Career Goals */}
            <div className="relative">
              <div className="text-sm mb-2 font-medium">🌟 What are your career goals for the next 2-3 years?</div>
              <textarea
                rows={3}
                className="w-full rounded-lg bg-black/20 p-3 border border-white/10"
                placeholder="Describe your career aspirations..."
                {...register("careerFuture.careerGoals")}
              />
              <div className="mt-2">
                <AiRefineControl
                  value={watch("careerFuture.careerGoals")}
                  onChange={(v) => setValue("careerFuture.careerGoals", v)}
                  fieldName="Career Goals"
                  tone="en"
                />
              </div>
            </div>

            {/* Financial Struggles */}
            <div>
              <div className="text-sm mb-2 font-medium">💰 What are your biggest financial challenges? (Select all)</div>
              <div className="flex flex-wrap gap-2">
                {["No steady income","Student loan burden","Family financial pressure","High living costs","Limited savings","No emergency fund","Investment knowledge lacking"].map((opt) => {
                  const selected = (watch("careerFuture.financialStruggles") || []) as string[];
                  const toggle = () => {
                    const set = new Set(selected);
                    if (set.has(opt)) set.delete(opt);
                    else set.add(opt);
                    setValue("careerFuture.financialStruggles", Array.from(set));
                  };
                  return (
                    <button key={opt} type="button" onClick={toggle} className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${selected.includes(opt) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"}`}>
                      {opt}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Entrepreneurship Interest */}
            <div>
              <div className="text-sm mb-2 font-medium">💡 Are you interested in starting your own business/startup?</div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {["Yes, very much","Maybe someday","Not sure","No interest"].map((opt) => (
                  <label key={opt} className="flex items-center gap-2 bg-black/20 rounded-lg px-3 py-2.5 hover:bg-black/30 transition-colors">
                    <input type="radio" value={opt} {...register("careerFuture.entrepreneurshipInterest")} className="text-emerald-500" /> 
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </GhibliFrame>
        </div>
      )}

      {step === 5 && (
        <div className="survey-section animate-slide-in-up">
        <GhibliFrame title="✅ Summary & Consent">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" {...register("consent", { required: true })} /> I agree my anonymous data can be used for research and tool-building.
          </label>
        </GhibliFrame>
        </div>
      )}

      <div className="mt-2" />
      <div className="mx-auto max-w-6xl px-[var(--container-pad)] pb-3">
        <div className="glass border border-white/10 rounded-2xl p-2 flex items-center justify-between">
            <GhibliButton color="neutral" onClick={back}>Back</GhibliButton>
            {step < steps.length - 1 ? (
              <GhibliButton onClick={next}>
                Next →
              </GhibliButton>
            ) : (
              <GhibliButton 
                onClick={handleSubmit(onFinish)} 
                disabled={isSubmitting || !formState.isValid}
              >
                {isSubmitting ? (
                  <>
                    <span className="inline-block animate-spin mr-2">⏳</span>
                    Submitting...
                  </>
                ) : submitted ? (
                  <>
                    <span className="success-checkmark mr-2">✓</span>
                    Submitted!
                  </>
                ) : (
                  <>✨ Finish Survey</>
                )}
              </GhibliButton>
            )}
        </div>
      </div>
    </div>
  );
}


