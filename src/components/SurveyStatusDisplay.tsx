"use client";
import Link from "next/link";
import { SurveySchedulingSettings, SurveyStatus, getStatusMessage } from "@/hooks/useSurveyScheduling";
import { GhibliFrame } from "./GhibliFrame";
import CountdownTimer from "./CountdownTimer";

interface SurveyStatusDisplayProps {
  status: SurveyStatus;
  settings: SurveySchedulingSettings | null;
  showTimingWarnings?: boolean;
  showCountdown?: boolean;
  showProgressBar?: boolean;
  showParticipantCount?: boolean;
  showStatusDisplay?: boolean;
}

export default function SurveyStatusDisplay({ 
  status, 
  settings, 
  showTimingWarnings = true,
  showCountdown = true,
  showProgressBar = true,
  showParticipantCount = true,
  showStatusDisplay = true
}: SurveyStatusDisplayProps) {
  const statusMsg = getStatusMessage(status, settings);

  // If status display is disabled, return null
  if (!showStatusDisplay) {
    return null;
  }

  return (
    <div className="min-h-screen text-white bg-[#0D1B1E] flex items-center justify-center">
      <div className="max-w-md mx-auto p-6">
        <div className="text-center py-12 space-y-6">
          <div className="text-6xl mb-4">{statusMsg.emoji}</div>
          <h1 className="text-2xl font-bold text-white">{statusMsg.title}</h1>
          <p className="text-white/70 max-w-md mx-auto">
            {statusMsg.description}
          </p>

          {/* Countdown for upcoming survey */}
          {showCountdown && status.reason === 'not_started' && status.startDate && (
            <div className="my-6">
              <CountdownTimer
                targetDate={status.startDate}
                type="start"
                onComplete={() => window.location.reload()}
              />
            </div>
          )}

          {/* Buttons based on status */}
          {status.reason === 'ended' && (
            <div className="space-y-4">
              <p className="text-white/60">Want to know when the survey is available?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/" 
                  className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 justify-center"
                >
                  🏠 Return Home
                </Link>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="btn-secondary px-6 py-3 rounded-xl inline-flex items-center gap-2 justify-center"
                >
                  🔄 Check Again
                </button>
              </div>
            </div>
          )}

          {status.reason === 'not_started' && (
            <div className="space-y-4">
              <p className="text-white/60">Want to know when the survey is available?</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  href="/" 
                  className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2 justify-center"
                >
                  🏠 Return Home
                </Link>
                <button 
                  onClick={() => {
                    if (typeof window !== 'undefined') {
                      window.location.reload();
                    }
                  }}
                  className="btn-secondary px-6 py-3 rounded-xl inline-flex items-center gap-2 justify-center"
                >
                  🔄 Check Status
                </button>
              </div>
            </div>
          )}

          {status.reason === 'disabled' && (
            <div className="space-y-4">
              <p className="text-white/60">Want to know when the survey is back online?</p>
              <div className="flex justify-center">
                <Link 
                  href="/" 
                  className="btn-primary px-6 py-3 rounded-xl inline-flex items-center gap-2"
                >
                  🏠 Return Home
                </Link>
              </div>
            </div>
          )}

          {/* Progress and participant info for active surveys */}
          {status.active && showProgressBar && (
            <div className="mt-8 p-4 bg-white/5 rounded-xl border border-white/10">
              <div className="flex items-center justify-between text-sm">
                <span className="text-white/70">Survey Progress</span>
                <span className="text-emerald-400">Active Now</span>
              </div>
              <div className="mt-2 w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full w-full animate-pulse"></div>
              </div>
            </div>
          )}

          {/* Participant count */}
          {showParticipantCount && (
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 rounded-full border border-white/10">
                <span className="text-2xl">👥</span>
                <span className="text-white/80 text-sm">Participants welcome</span>
              </div>
            </div>
          )}

          {/* Status details for active survey ending soon */}
          {showTimingWarnings && status.active && status.endDate && showCountdown && (
            <div className="mt-6">
              <div className="p-4 bg-amber-600/10 border border-amber-600/30 rounded-xl">
                <h3 className="text-amber-400 font-medium mb-2">⏰ Survey Ending Soon</h3>
                <CountdownTimer
                  targetDate={status.endDate}
                  type="end"
                  title="Survey Ends In"
                  onComplete={() => window.location.reload()}
                />
              </div>
            </div>
          )}

          {/* Schedule info */}
          {settings && settings.scheduling && (showTimingWarnings || status.active) && (
            <div className="mt-6 p-4 bg-blue-600/10 border border-blue-600/30 rounded-xl text-sm">
              <h3 className="text-blue-400 font-medium mb-2">📅 Survey Schedule</h3>
              <div className="space-y-1 text-white/70">
                {settings.scheduling.startDate && (
                  <div>
                    <strong>Start:</strong> {new Date(settings.scheduling.startDate).toLocaleString('en-US', {
                      timeZone: 'Asia/Karachi',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })} PKT
                  </div>
                )}
                {settings.scheduling.endDate && (
                  <div>
                    <strong>End:</strong> {new Date(settings.scheduling.endDate).toLocaleString('en-US', {
                      timeZone: 'Asia/Karachi',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true
                    })} PKT
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Custom message from settings */}
          {settings?.display?.customMessage && (
            <div className="mt-6 p-4 bg-purple-600/10 border border-purple-600/30 rounded-xl">
              <div className="text-purple-300 text-sm">
                💬 {settings.display.customMessage}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}