"use client";
import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { GhibliFrame } from "@/components/GhibliFrame";
import SurveyWizard from "@/components/SurveyWizard";
import ShareButton from "@/components/ShareButton";
import BottomActionBar from "@/components/BottomActionBar";
// import BottomActionBar from "@/components/BottomActionBar";
import CountdownTimer from "@/components/CountdownTimer";
import SurveyStatusDisplay from "@/components/SurveyStatusDisplay";
import { useSurveyScheduling, SurveySchedulingSettings } from "@/hooks/useSurveyScheduling";
import OpenSourceFooter from "@/components/OpenSourceFooter";

const PAK_COLORS = { background: "bg-[#0D1B1E]", accent: "text-[#F2C14E]" };

export default function SurveyPage() {
  const { t } = useI18n();
  const [surveySettings, setSurveySettings] = useState<SurveySchedulingSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [participantCount, setParticipantCount] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/admin/survey-settings");
        
        // Check if response is actually JSON
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("API returned non-JSON response");
        }
        
        const json = await res.json();
        if (json.ok) {
          setSurveySettings(json.settings);
        } else {
          // If API fails, use default enabled settings
          setSurveySettings({
            enabled: true,
            title: "Pakistan Tech & Society Survey 2025",
            description: "Advanced survey about technology, healthcare, and youth issues in Pakistan",
            scheduling: {
              startDate: undefined,
              endDate: undefined,
              timezone: "Asia/Karachi"
            }
          });
        }
      } catch (error) {
        console.error("Failed to fetch survey settings:", error);
        // Fallback to default enabled settings if API completely fails
        setSurveySettings({
          enabled: true,
          title: "Pakistan Tech & Society Survey 2025", 
          description: "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          scheduling: {
            startDate: undefined,
            endDate: undefined,
            timezone: "Asia/Karachi"
          }
        });
      } finally {
        setLoading(false);
      }
    };

    const fetchParticipantCount = async () => {
      try {
        const response = await fetch('/api/admin/export');
        const data = await response.json();
        if (data.ok && data.data) {
          setParticipantCount(data.data.length);
        }
      } catch (error) {
        console.error('Failed to fetch participant count:', error);
      }
    };
    
    fetchSettings();
    fetchParticipantCount();
  }, []);

  // Update current time every second for real-time countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const surveyStatus = useSurveyScheduling(surveySettings);

  if (loading) {
    return (
      <div className={`${PAK_COLORS.background} min-h-screen text-white flex items-center justify-center`}>
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-white/70">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Remove the old getSurveyStatus function - now using the hook

  // Show status display if survey is not active
  if (!surveyStatus.active) {
    return (
      <SurveyStatusDisplay 
        status={surveyStatus}
        settings={surveySettings}
        showTimingWarnings={true}
        showCountdown={true}
        showProgressBar={true}
        showParticipantCount={true}
        showStatusDisplay={true}
      />
    );
  }

  return (
    <div className={`${PAK_COLORS.background} min-h-screen text-white`}>
      <div className="max-w-5xl mx-auto p-3 sm:p-6 space-y-4 sm:space-y-6" style={{ paddingBottom: 'var(--bottom-bar-height, 160px)' }}>
        <div className="text-center space-y-3 sm:space-y-4">
          <div className="space-y-2">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold px-2">
              <span className={PAK_COLORS.accent}>MZR</span> {surveySettings?.title || t("app_title")}
            </h1>
            <p className="text-white/70 text-sm sm:text-base px-2">
              {surveySettings?.description || "Advanced survey about technology, healthcare, and youth issues in Pakistan"}
            </p>
          </div>

          {/* Survey Status and Scheduling Info - only show for active surveys */}
          {surveyStatus.active && (
            <div className="p-3 sm:p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg sm:rounded-xl text-xs sm:text-sm mx-2">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 text-blue-400">
                <div className="flex items-center gap-2">
                  <span>✅</span>
                  <span>Survey is Live</span>
                </div>
                {surveyStatus.endDate && (
                  <span className="text-white/70 text-center">
                    • Ends {surveyStatus.endDate.toLocaleString('en-US', {
                      timeZone: 'Asia/Karachi',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })} PKT
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
        
        {/* Only show survey form when survey is truly active and started */}
        {surveyStatus.active && surveyStatus.reason === 'active' ? (
          <div className="mx-2 sm:mx-0">
            <GhibliFrame title="Survey Wizard">
              <SurveyWizard />
            </GhibliFrame>
          </div>
        ) : (
          <div className="flex items-center justify-center min-h-[200px] bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-lg sm:rounded-xl border border-blue-500/30 backdrop-blur-sm mx-2 sm:mx-0">
            <div className="text-center space-y-4 p-8">
              <div className="text-5xl">⏰</div>
              <h3 className="text-xl font-bold text-white">Survey Will Be Available Soon</h3>
              <p className="text-white/80 text-lg">
                The survey form will be available to public in{' '}
                <span className="text-emerald-400 font-bold">
                  {surveyStatus.startDate && (() => {
                    const pakistaniTime = new Date(currentTime.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
                    const start = new Date(surveyStatus.startDate);
                    const diff = start.getTime() - pakistaniTime.getTime();
                    
                    if (diff <= 0) {
                      return 'any moment now';
                    }
                    
                    const totalSeconds = Math.ceil(diff / 1000);
                    const minutes = Math.floor(totalSeconds / 60);
                    const seconds = totalSeconds % 60;
                    
                    if (minutes > 0) {
                      return `${minutes} minute${minutes === 1 ? '' : 's'} ${seconds} second${seconds === 1 ? '' : 's'}`;
                    } else {
                      return `${seconds} second${seconds === 1 ? '' : 's'}`;
                    }
                  })()}
                </span>
              </p>
              <div className="text-white/60 text-sm">
                Please wait, the form will appear automatically when available.
              </div>
            </div>
          </div>
        )}

      </div>
      <BottomActionBar
        title={surveySettings?.title || "Pakistan Tech & Society Survey 2025"}
        description="Help spread awareness - share this important survey with your friends and family!"
      />
    </div>
  );
}


