"use client";
import { useState, useEffect, useMemo } from "react";
import { GhibliFrame } from "./GhibliFrame";
import ShareButton from "./ShareButton";
import AdvancedAnswerEnhancer from "./AdvancedAnswerEnhancer";
import SurveyStatusDisplay from "./SurveyStatusDisplay";
import { useSurveyScheduling, SurveySchedulingSettings } from "@/hooks/useSurveyScheduling";
import toast from "react-hot-toast";
import confetti from "canvas-confetti";

type Question = {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'short_text' | 'number' | 'rating' | 'yes_no' | 'dropdown';
  question: string;
  required: boolean;
  options?: string[];
  placeholder?: string;
  min?: number;
  max?: number;
};

type Section = {
  id: string;
  title: string;
  description: string;
  questions: Question[];
};

type Survey = {
  id?: string;
  title: string;
  description: string;
  sections: Section[];
  estimatedTime: string;
  tags: string[];
};

interface PublishedSurveyPageProps {
  publishedSurvey: {
    surveyId: string;
    urlSlug: string;
    title: string;
    description: string;
    survey: Survey;
    publishedAt: string;
    views: number;
    responses: number;
    settings?: {
      aiEnabled?: boolean;
      allowAnonymous?: boolean;
      requireLogin?: boolean;
      collectEmails?: boolean;
      maxResponses?: number | null;
      expiresAt?: string | null;
    };
    scheduling?: {
      enabled: boolean;
      startDate?: string | null;
      endDate?: string | null;
      timezone?: string;
      inheritGlobal?: boolean;
    };
  };
}

const PAK_COLORS = { background: "bg-[#0D1B1E]", accent: "text-[#F2C14E]" };

export default function PublishedSurveyPage({ publishedSurvey }: PublishedSurveyPageProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [surveySettings, setSurveySettings] = useState<SurveySchedulingSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [surveyForceClosed, setSurveyForceClosed] = useState(false);
  const [warningsShown, setWarningsShown] = useState<{fiveMinute: boolean, forceClose: boolean, tenMinuteBanner: boolean}>({fiveMinute: false, forceClose: false, tenMinuteBanner: false});
  const [showWidgetSettings, setShowWidgetSettings] = useState(false);
  const [widgetSettings, setWidgetSettings] = useState({
    showTimingWarnings: true,
    showCountdown: true,
    showParticipantCount: true,
    showProgressBar: true,
    showShareButton: true,
    showStatusDisplay: true
  });

  const { survey } = publishedSurvey;

  // Fetch survey settings (published survey's own settings + global fallback)
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        // Check if this published survey has its own scheduling settings
        if (publishedSurvey.scheduling) {
          console.log("Using published survey's own scheduling settings:", publishedSurvey.scheduling);
          
          // If inheriting global settings, fetch and merge them
          if (publishedSurvey.scheduling.inheritGlobal) {
            try {
              const res = await fetch("/api/admin/survey-settings");
              const json = await res.json();
              if (json.ok && json.settings) {
                // Merge global settings with published survey settings
                setSurveySettings({
                  ...json.settings,
                  title: publishedSurvey.title,
                  description: publishedSurvey.description,
                  scheduling: {
                    ...json.settings.scheduling,
                    ...publishedSurvey.scheduling,
                    inheritGlobal: true
                  }
                });
                console.log("Merged global settings with published survey settings");
              } else {
                // Use published survey's own settings
                setSurveySettings({
                  enabled: publishedSurvey.scheduling.enabled,
                  title: publishedSurvey.title,
                  description: publishedSurvey.description,
                  scheduling: {
                    startDate: publishedSurvey.scheduling.startDate || null,
                    endDate: publishedSurvey.scheduling.endDate || null,
                    timezone: publishedSurvey.scheduling.timezone || "Asia/Karachi"
                  }
                } as any);
              }
            } catch (error) {
              console.warn("Could not fetch global settings, using published survey's own settings");
              setSurveySettings({
                enabled: publishedSurvey.scheduling.enabled,
                title: publishedSurvey.title,
                description: publishedSurvey.description,
                scheduling: {
                  startDate: publishedSurvey.scheduling.startDate || null,
                  endDate: publishedSurvey.scheduling.endDate || null,
                  timezone: publishedSurvey.scheduling.timezone || "Asia/Karachi"
                }
              } as any);
            }
          } else {
            // Use published survey's own independent settings
            setSurveySettings({
              enabled: publishedSurvey.scheduling.enabled,
              title: publishedSurvey.title,
              description: publishedSurvey.description,
              scheduling: {
                startDate: publishedSurvey.scheduling.startDate || null,
                endDate: publishedSurvey.scheduling.endDate || null,
                timezone: publishedSurvey.scheduling.timezone || "Asia/Karachi"
              }
            } as any);
          }
        } else {
          console.log("No scheduling property found on published survey, fetching global settings as fallback");
          // Fallback: fetch global settings
          try {
            const res = await fetch("/api/admin/survey-settings");
            const json = await res.json();
            if (json.ok && json.settings) {
              setSurveySettings({
                ...json.settings,
                title: publishedSurvey.title,
                description: publishedSurvey.description
              });
              console.log("Using global settings for custom survey:", json.settings);
            } else {
              console.warn("No global settings found, using default active settings");
              // Set default ACTIVE settings so timing features work
              setSurveySettings({
                enabled: true,
                title: publishedSurvey.title,
                description: publishedSurvey.description,
                scheduling: {
                  startDate: null,
                  endDate: null,
                  timezone: "Asia/Karachi"
                },
                display: {
                  showCountdown: true,
                  showParticipantCount: true,
                  showProgress: true,
                  customMessage: "",
                  thankYouMessage: "Thank you for participating!"
                }
              } as any);
            }
          } catch (fetchError) {
            console.error("Failed to fetch global settings:", fetchError);
            // Even on error, provide working default settings
            setSurveySettings({
              enabled: true,
              title: publishedSurvey.title,
              description: publishedSurvey.description,
              scheduling: {
                startDate: null,
                endDate: null,
                timezone: "Asia/Karachi"
              },
              display: {
                showCountdown: true,
                showParticipantCount: true,
                showProgress: true
              }
            } as any);
          }
        }
      } catch (error) {
        console.error("Failed to fetch survey settings:", error);
        // Set minimal settings so survey can still function
        setSurveySettings({
          enabled: true,
          title: publishedSurvey.title,
          description: publishedSurvey.description,
          scheduling: { 
            startDate: null, 
            endDate: null, 
            timezone: "Asia/Karachi" 
          }
        } as any);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSettings();
  }, [publishedSurvey]);

  const surveyStatus = useSurveyScheduling(surveySettings);

  // Calculate time remaining for warnings (moved before conditional returns)
  const timeRemaining = useMemo(() => {
    if (!surveyStatus.endDate) return null;
    const now = new Date();
    const endTime = new Date(surveyStatus.endDate);
    const remaining = endTime.getTime() - now.getTime();
    return remaining > 0 ? remaining : 0;
  }, [surveyStatus.endDate]);

  const showTimeWarning = timeRemaining && timeRemaining <= 10 * 60 * 1000 && !warningsShown.tenMinuteBanner; // 10 minutes

  // Track completion achievements (moved before conditional returns)
  const achievements = useMemo(() => {
    const count = completedSteps.length;
    const badges = [];
    if (count >= 1) badges.push({ icon: '🎆', title: 'Getting Started', desc: 'First section completed!' });
    if (count >= Math.floor(survey.sections.length / 2)) badges.push({ icon: '💪', title: 'Halfway There', desc: 'Great progress!' });
    if (count >= survey.sections.length - 1) badges.push({ icon: '🏆', title: 'Almost Done', desc: 'Final stretch!' });
    return badges;
  }, [completedSteps.length, survey.sections.length]);

  // Auto-close survey if it becomes inactive while user is filling it
  useEffect(() => {
    if (!surveyStatus.active && surveySettings && !submitted && !surveyForceClosed && !warningsShown.forceClose && widgetSettings.showTimingWarnings) {
      setSurveyForceClosed(true);
      setWarningsShown(prev => ({ ...prev, forceClose: true }));
      toast.error("⏰ Survey time has ended. Please submit your current responses or come back later.", {
        duration: 8000,
        style: {
          background: 'rgba(239, 68, 68, 0.2)',
          border: '1px solid rgba(239, 68, 68, 0.4)',
          fontSize: '16px',
          fontWeight: '500',
        }
      });
    }
  }, [surveyStatus.active, surveySettings, submitted, surveyForceClosed, warningsShown.forceClose, widgetSettings.showTimingWarnings]);

  // Warning when survey is about to close (5 minutes remaining)
  useEffect(() => {
    if (surveyStatus.active && surveyStatus.endDate && !submitted && !warningsShown.fiveMinute && widgetSettings.showTimingWarnings) {
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
  }, [surveyStatus.active, surveyStatus.endDate, submitted, warningsShown.fiveMinute, widgetSettings.showTimingWarnings]);

  // Show the 10-minute banner once and mark it as shown
  useEffect(() => {
    if (showTimeWarning && !warningsShown.tenMinuteBanner && widgetSettings.showTimingWarnings) {
      setWarningsShown(prev => ({ ...prev, tenMinuteBanner: true }));
    }
  }, [showTimeWarning, warningsShown.tenMinuteBanner, widgetSettings.showTimingWarnings]);

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const validateCurrentSection = () => {
    const currentSectionData = survey.sections[currentSection];
    const sectionPrefix = `${currentSection}_`;
    
    for (const question of currentSectionData.questions) {
      if (question.required) {
        const responseKey = `${currentSection}_${question.id}`;
        const response = responses[responseKey];
        
        if (!response || (Array.isArray(response) && response.length === 0) || response === '') {
          toast.error(`Please answer: ${question.question}`);
          return false;
        }
      }
    }
    return true;
  };

  const nextSection = () => {
    if (!validateCurrentSection()) return;
    
    setCompletedSteps(prev => {
      if (!prev.includes(currentSection)) {
        toast(`✅ ${survey.sections[currentSection].title} completed!`, { 
          icon: '🎯', 
          duration: 2000 
        });
        return [...prev, currentSection].sort();
      }
      return prev;
    });
    
    setCurrentSection(prev => Math.min(prev + 1, survey.sections.length - 1));
  };

  const previousSection = () => {
    setCurrentSection(prev => Math.max(0, prev - 1));
  };

  const submitSurvey = async () => {
    if (!validateCurrentSection()) return;

    setIsSubmitting(true);
    const loadingToast = toast.loading("🚀 Submitting your responses...");

    try {
      // Submit to the published survey response endpoint
      const res = await fetch(`/api/survey/${publishedSurvey.urlSlug}/responses`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surveyId: publishedSurvey.surveyId,
          responses,
          submittedAt: new Date().toISOString()
        })
      });

      toast.dismiss(loadingToast);

      if (res.ok) {
        setSubmitted(true);
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        setTimeout(() => confetti({ particleCount: 50, spread: 60, origin: { y: 0.7 } }), 200);
        setTimeout(() => confetti({ particleCount: 30, spread: 50, origin: { y: 0.8 } }), 400);
        
        toast.success("🎉 Amazing! شکریہ! Your responses have been recorded successfully! 🇵🇰", {
          duration: 5000,
          style: { 
            background: 'rgba(16, 185, 129, 0.2)', 
            border: '1px solid rgba(16, 185, 129, 0.4)', 
            fontSize: '16px', 
            fontWeight: '500' 
          }
        });
      } else {
        const errorData = await res.json();
        toast.error(`❌ Failed to submit: ${errorData.error || 'Please try again'}`, { duration: 4000 });
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("🚫 Network error. Please check your internet connection and try again.", { duration: 4000 });
      console.error("Survey submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = (question: Question, sectionIndex: number) => {
    const responseKey = `${sectionIndex}_${question.id}`;
    const value = responses[responseKey];

    const baseInputClass = "w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500 transition-all";

    switch (question.type) {
      case 'text':
        return (
          <div className="space-y-3">
            <div className="relative">
              <textarea
                value={value || ''}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                placeholder={question.placeholder || 'Enter your answer...'}
                className={`${baseInputClass} h-24 resize-none`}
              />
              {publishedSurvey.settings?.aiEnabled !== false && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 text-xs text-white/50 bg-purple-600/20 px-2 py-1 rounded-md">
                    <span>🤖</span>
                    <span>AI Enhanced</span>
                  </div>
                </div>
              )}
            </div>
            {value && value.trim() && publishedSurvey.settings?.aiEnabled !== false && (
              <AdvancedAnswerEnhancer
                currentAnswer={value}
                questionText={question.question}
                onEnhanced={(enhancedAnswer) => updateResponse(responseKey, enhancedAnswer)}
                placeholder={question.placeholder}
                questionType="text"
              />
            )}
            {publishedSurvey.settings?.aiEnabled !== false && (!value || !value.trim()) && (
              <div className="text-xs text-white/40 italic">
                💡 Type your answer and use AI to improve it
              </div>
            )}
          </div>
        );

      case 'short_text':
        return (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={value || ''}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                placeholder={question.placeholder || 'Enter your answer...'}
                className={baseInputClass}
              />
              {publishedSurvey.settings?.aiEnabled !== false && (
                <div className="absolute top-2 right-2">
                  <div className="flex items-center gap-1 text-xs text-white/50 bg-purple-600/20 px-2 py-1 rounded-md">
                    <span>🤖</span>
                    <span>AI Enhanced</span>
                  </div>
                </div>
              )}
            </div>
            {value && value.trim() && publishedSurvey.settings?.aiEnabled !== false && (
              <AdvancedAnswerEnhancer
                currentAnswer={value}
                questionText={question.question}
                onEnhanced={(enhancedAnswer) => updateResponse(responseKey, enhancedAnswer)}
                placeholder={question.placeholder}
                questionType="short_text"
              />
            )}
            {publishedSurvey.settings?.aiEnabled !== false && (!value || !value.trim()) && (
              <div className="text-xs text-white/40 italic">
                💡 Type your answer and use AI to improve it
              </div>
            )}
          </div>
        );

      case 'single_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/5 rounded-lg transition-colors group">
                <input
                  type="radio"
                  name={responseKey}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateResponse(responseKey, e.target.value)}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white group-hover:text-emerald-300 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-3">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer p-3 hover:bg-white/5 rounded-lg transition-colors group">
                <input
                  type="checkbox"
                  value={option}
                  checked={(value || []).includes(option)}
                  onChange={(e) => {
                    const currentValues = value || [];
                    if (e.target.checked) {
                      updateResponse(responseKey, [...currentValues, option]);
                    } else {
                      updateResponse(responseKey, currentValues.filter((v: string) => v !== option));
                    }
                  }}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
                <span className="text-white group-hover:text-emerald-300 transition-colors">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-4 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg transition-colors flex-1 justify-center">
              <input
                type="radio"
                name={responseKey}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-white font-medium">✅ Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-4 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors flex-1 justify-center">
              <input
                type="radio"
                name={responseKey}
                value="no"
                checked={value === 'no'}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                className="text-red-500 focus:ring-red-500"
              />
              <span className="text-white font-medium">❌ No</span>
            </label>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>{question.min || 1}</span>
              <span>Rating Scale</span>
              <span>{question.max || 10}</span>
            </div>
            <div className="flex gap-2 justify-center flex-wrap">
              {Array.from({ length: (question.max || 10) - (question.min || 1) + 1 }, (_, i) => {
                const rating = (question.min || 1) + i;
                return (
                  <button
                    key={rating}
                    onClick={() => updateResponse(responseKey, rating)}
                    className={`w-12 h-12 rounded-full border-2 transition-all font-medium ${
                      value === rating
                        ? 'bg-emerald-500 border-emerald-500 text-white scale-110'
                        : 'border-white/30 text-white/70 hover:border-emerald-500 hover:text-emerald-500 hover:scale-105'
                    }`}
                  >
                    {rating}
                  </button>
                );
              })}
            </div>
          </div>
        );

      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            min={question.min}
            max={question.max}
            onChange={(e) => updateResponse(responseKey, e.target.value)}
            className={baseInputClass}
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateResponse(responseKey, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select an option...</option>
            {question.options?.map((option, index) => (
              <option key={index} value={option} className="bg-slate-800">
                {option}
              </option>
            ))}
          </select>
        );

      default:
        return null;
    }
  };

  if (submitted) {
    return (
      <div className={`${PAK_COLORS.background} min-h-screen text-white flex items-center justify-center`}>
        <div className="max-w-2xl mx-auto p-6 text-center space-y-6">
          <div className="text-6xl">🎉</div>
          <h1 className="text-3xl font-bold">Thank You!</h1>
          <p className="text-xl text-white/80">
            Your response has been successfully recorded. شکریہ!
          </p>
          <div className="space-y-4">
            <p className="text-white/70">
              Help us reach more people by sharing this survey:
            </p>
            <ShareButton 
              title={survey.title}
              description="Share your voice about important issues in Pakistan"
            />
          </div>
          <button
            onClick={() => window.location.href = '/'}
            className="mt-6 bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl transition-all"
          >
            🏠 Return Home
          </button>
        </div>
      </div>
    );
  }

  // Show loading state while fetching settings
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="text-white/70">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Check survey scheduling before showing survey
  if (!surveyStatus.active && widgetSettings.showStatusDisplay) {
    return (
      <SurveyStatusDisplay 
        status={surveyStatus}
        settings={surveySettings}
        participantCount={0}
      />
    );
  }

  const currentSectionData = survey.sections[currentSection];
  const progress = ((currentSection + 1) / survey.sections.length) * 100;

  return (
    <div className={`${PAK_COLORS.background} min-h-screen text-white`}>
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        {/* Time Warning Banner */}
        {widgetSettings.showTimingWarnings && showTimeWarning && (
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

        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-2xl sm:text-3xl font-bold">
            <span className={PAK_COLORS.accent}>📊</span> {survey.title}
          </h1>
          <p className="text-white/70">{survey.description}</p>
          {widgetSettings.showParticipantCount && (
          <div className="flex items-center justify-center gap-4 text-sm text-white/60">
            <span>⏱️ {survey.estimatedTime}</span>
            <span>📝 {survey.sections.length} sections</span>
            <span>👁️ {publishedSurvey.views} views</span>
          </div>
          )}
          
          {/* Enhanced Progress Bar with Achievements */}
          {widgetSettings.showProgressBar && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-white/80">
                Progress: {Math.round(progress)}% Complete
              </div>
              <div className="text-sm text-white/60">
                Section {currentSection + 1} of {survey.sections.length}
              </div>
            </div>
            
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-emerald-400 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute inset-0 bg-white/20 rounded-full animate-pulse"></div>
              </div>
            </div>

            {/* Achievement Badges */}
            {achievements.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center mt-3">
                {achievements.map((badge, index) => (
                  <div 
                    key={index}
                    className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 rounded-lg px-3 py-2 text-center transform hover:scale-105 transition-transform"
                  >
                    <div className="text-lg">{badge.icon}</div>
                    <div className="text-xs font-medium text-purple-300">{badge.title}</div>
                    <div className="text-xs text-purple-200/70">{badge.desc}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Share Button */}
          {widgetSettings.showShareButton && (
          <div className="flex justify-center">
            <ShareButton 
              title={survey.title}
              description="Help spread awareness - share this important survey!"
            />
          </div>
          )}
        </div>

        {/* Current Section */}
        <GhibliFrame title={currentSectionData.title}>
          <div className="space-y-6">
            <p className="text-white/70 text-center">{currentSectionData.description}</p>
            
            <div className="space-y-8">
              {currentSectionData.questions.map((question, index) => (
                <div key={question.id} className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="text-emerald-400 font-bold text-lg mt-1">{index + 1}.</span>
                    <div className="flex-1">
                      <h3 className="text-white font-medium text-lg leading-relaxed">
                        {question.question}
                        {question.required && <span className="text-red-400 ml-1">*</span>}
                      </h3>
                      <div className="mt-4">
                        {renderQuestion(question, currentSection)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </GhibliFrame>

        {/* Navigation */}
        <div className="sticky bottom-4 bg-slate-900/90 backdrop-blur-sm rounded-xl border border-white/10 p-4">
          <div className="flex justify-between items-center">
            <button
              onClick={previousSection}
              disabled={currentSection === 0}
              className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-6 py-3 rounded-xl transition-all flex items-center gap-2"
            >
              ← Previous
            </button>
            
            <div className="flex gap-2">
              {survey.sections.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-all ${
                    index === currentSection ? 'bg-emerald-500 scale-125' : 
                    completedSteps.includes(index) ? 'bg-emerald-400' : 'bg-white/20'
                  }`}
                />
              ))}
            </div>

            {currentSection === survey.sections.length - 1 ? (
              <button
                onClick={submitSurvey}
                disabled={isSubmitting}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                {isSubmitting ? "🚀 Submitting..." : "✨ Submit Survey"}
              </button>
            ) : (
              <button
                onClick={nextSection}
                className="bg-emerald-600 hover:bg-emerald-500 px-6 py-3 rounded-xl transition-all flex items-center gap-2 font-medium"
              >
                Next →
              </button>
            )}
          </div>
        </div>

        {/* Floating Share Button */}
        {widgetSettings.showShareButton && (
          <div className="fixed bottom-4 left-4 z-40">
            <ShareButton 
              title={survey.title}
              description="Help spread awareness - share this important survey with your friends and family!"
            />
          </div>
        )}

        {/* Floating Widget Settings Button */}
        <div className="fixed bottom-4 right-4 z-50">
          <button
            onClick={() => setShowWidgetSettings(!showWidgetSettings)}
            className="bg-slate-800/90 hover:bg-slate-700/90 border border-white/20 rounded-full w-12 h-12 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all"
            title="Widget Settings"
          >
            ⚙️
          </button>
        </div>

        {/* Widget Settings Panel */}
        {showWidgetSettings && (
          <div className="fixed top-4 right-4 z-50 bg-slate-900/95 backdrop-blur-sm border border-white/20 rounded-xl p-4 w-80 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium flex items-center gap-2">
                <span>🎛️</span>
                Survey Widgets
              </h3>
              <button
                onClick={() => setShowWidgetSettings(false)}
                className="text-white/70 hover:text-white w-6 h-6 rounded bg-white/10 hover:bg-white/20 flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-3 text-sm">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Timing Warnings & Notifications</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showTimingWarnings}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showTimingWarnings: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Countdown Timer</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showCountdown}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showCountdown: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Participant Count</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showParticipantCount}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showParticipantCount: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Progress Bar & Achievements</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showProgressBar}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showProgressBar: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Share Button</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showShareButton}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showShareButton: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
              
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-white/80">Status Display</span>
                <input
                  type="checkbox"
                  checked={widgetSettings.showStatusDisplay}
                  onChange={(e) => setWidgetSettings(prev => ({ ...prev, showStatusDisplay: e.target.checked }))}
                  className="text-emerald-500 focus:ring-emerald-500 rounded"
                />
              </label>
            </div>
            
            <div className="mt-4 pt-3 border-t border-white/10">
              <p className="text-xs text-white/50">
                Toggle survey widgets on/off to customize the user experience
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}