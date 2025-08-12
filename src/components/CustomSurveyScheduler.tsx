"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type CustomSurvey = {
  id: string;
  title: string;
  description: string;
  status: string;
  isPublished: boolean;
  urlSlug?: string;
  publishedAt?: string;
  views?: number;
  responses?: number;
  scheduling?: {
    enabled: boolean;
    startDate?: string | null;
    endDate?: string | null;
    timezone?: string;
    inheritGlobal?: boolean;
  };
};

interface CustomSurveySchedulerProps {
  onClose: () => void;
  onUpdate: () => void;
}

export default function CustomSurveyScheduler({ onClose, onUpdate }: CustomSurveySchedulerProps) {
  const [isClient, setIsClient] = useState(false);
  const [surveys, setSurveys] = useState<CustomSurvey[]>([]);
  const [selectedSurvey, setSelectedSurvey] = useState<CustomSurvey | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [timingSettings, setTimingSettings] = useState({
    enabled: true,
    startDate: "",
    endDate: "",
    timezone: "Asia/Karachi",
    inheritGlobal: true
  });

  useEffect(() => {
    setIsClient(true);
    fetchSurveys();
  }, []);

  const fetchSurveys = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/surveys");
      const data = await response.json();
      
      if (data.ok) {
        // Filter only published surveys
        const publishedSurveys = data.surveys.filter((survey: any) => survey.isPublished);
        setSurveys(publishedSurveys);
      } else {
        toast.error("Failed to fetch surveys");
      }
    } catch (error) {
      console.error("Error fetching surveys:", error);
      toast.error("Failed to fetch surveys");
    } finally {
      setLoading(false);
    }
  };

  const selectSurvey = async (survey: CustomSurvey) => {
    setSelectedSurvey(survey);
    
    // Fetch detailed survey info including current scheduling
    try {
      const response = await fetch(`/api/admin/surveys/published/${survey.urlSlug}`);
      const data = await response.json();
      
      if (data.ok && data.survey.scheduling) {
        const scheduling = data.survey.scheduling;
        setTimingSettings({
          enabled: scheduling.enabled || false,
          startDate: scheduling.startDate ? formatDateTimeLocal(scheduling.startDate) : "",
          endDate: scheduling.endDate ? formatDateTimeLocal(scheduling.endDate) : "",
          timezone: scheduling.timezone || "Asia/Karachi",
          inheritGlobal: scheduling.inheritGlobal || false
        });
      } else {
        // Set default settings if no scheduling exists
        setTimingSettings({
          enabled: true,
          startDate: "",
          endDate: "",
          timezone: "Asia/Karachi",
          inheritGlobal: true
        });
      }
    } catch (error) {
      console.error("Error fetching survey details:", error);
      // Use default settings
      setTimingSettings({
        enabled: true,
        startDate: "",
        endDate: "",
        timezone: "Asia/Karachi",
        inheritGlobal: true
      });
    }
  };

  const formatDateTimeLocal = (dateString: string | null) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      
      // Convert to Pakistani time for display in datetime-local input
      const pakistaniOffset = 5 * 60; // Pakistan is UTC+5
      const pakistaniTime = new Date(date.getTime() + (pakistaniOffset * 60 * 1000));
      
      // Format for datetime-local input (YYYY-MM-DDTHH:MM)
      const year = pakistaniTime.getUTCFullYear();
      const month = String(pakistaniTime.getUTCMonth() + 1).padStart(2, '0');
      const day = String(pakistaniTime.getUTCDate()).padStart(2, '0');
      const hours = String(pakistaniTime.getUTCHours()).padStart(2, '0');
      const minutes = String(pakistaniTime.getUTCMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    } catch (error) {
      return '';
    }
  };

  const parseLocalDateTime = (dateTimeLocal: string) => {
    if (!dateTimeLocal) return null;
    try {
      // Parse the local datetime as Pakistani time and convert to UTC
      const localDate = new Date(dateTimeLocal);
      const pakistaniOffset = 5 * 60; // Pakistan is UTC+5
      const utcTime = new Date(localDate.getTime() - (pakistaniOffset * 60 * 1000));
      return utcTime.toISOString();
    } catch (error) {
      return null;
    }
  };

  const saveScheduling = async () => {
    if (!selectedSurvey) return;

    // Validate dates
    if (timingSettings.enabled && !timingSettings.inheritGlobal) {
      if (timingSettings.startDate && timingSettings.endDate) {
        const start = new Date(timingSettings.startDate);
        const end = new Date(timingSettings.endDate);
        if (start >= end) {
          toast.error("End date must be after start date");
          return;
        }
      }
    }

    setSaving(true);
    const loadingToast = toast.loading("💾 Updating survey scheduling...");

    try {
      const scheduleData = {
        enabled: timingSettings.enabled,
        startDate: timingSettings.startDate ? parseLocalDateTime(timingSettings.startDate) : null,
        endDate: timingSettings.endDate ? parseLocalDateTime(timingSettings.endDate) : null,
        timezone: timingSettings.timezone,
        inheritGlobal: timingSettings.inheritGlobal
      };

      const response = await fetch(`/api/admin/surveys/published/${selectedSurvey.urlSlug}/schedule`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduling: scheduleData })
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.dismiss(loadingToast);
        toast.success("📅 Survey scheduling updated successfully!");
        await fetchSurveys(); // Refresh the surveys list
        onUpdate(); // Notify parent to refresh
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update scheduling: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update scheduling");
      console.error("Scheduling update error:", error);
    } finally {
      setSaving(false);
    }
  };

  const getSurveyStatus = (survey: CustomSurvey) => {
    if (!survey.scheduling?.enabled) return { status: "disabled", color: "text-gray-400", icon: "⏸️" };
    
    const now = new Date();
    const pakistaniTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Karachi"}));
    
    const startDate = survey.scheduling.startDate ? new Date(survey.scheduling.startDate) : null;
    const endDate = survey.scheduling.endDate ? new Date(survey.scheduling.endDate) : null;
    
    if (startDate && pakistaniTime < startDate) {
      return { status: "scheduled", color: "text-blue-400", icon: "⏰" };
    }
    
    if (endDate && pakistaniTime > endDate) {
      return { status: "ended", color: "text-red-400", icon: "📝" };
    }
    
    return { status: "active", color: "text-green-400", icon: "✅" };
  };

  if (!isClient) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl max-h-[90vh] bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex">
        
        {/* Left Panel - Survey List */}
        <div className="w-1/3 border-r border-white/10 flex flex-col">
          <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/10 p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-600/20 rounded-xl">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Custom Surveys</h3>
                <p className="text-white/70 text-sm">Select a survey to manage its timing</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
              </div>
            ) : surveys.length === 0 ? (
              <div className="text-center py-8">
                <span className="text-4xl block mb-2">📝</span>
                <p className="text-white/70">No published surveys yet</p>
                <p className="text-white/50 text-sm">Create and publish surveys to manage their timing</p>
              </div>
            ) : (
              <div className="space-y-2">
                {surveys.map((survey) => {
                  const status = getSurveyStatus(survey);
                  const isSelected = selectedSurvey?.id === survey.id;
                  
                  return (
                    <div
                      key={survey.id}
                      onClick={() => selectSurvey(survey)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        isSelected 
                          ? 'bg-purple-600/20 border-purple-600/40' 
                          : 'bg-black/20 border-white/10 hover:bg-white/5 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-white text-sm truncate">{survey.title}</h4>
                          <p className="text-white/60 text-xs truncate mt-1">{survey.description}</p>
                          
                          <div className="flex items-center gap-4 mt-2 text-xs">
                            <div className="flex items-center gap-1">
                              <span className="text-blue-400">👀</span>
                              <span className="text-white/60">{survey.views || 0}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span className="text-green-400">📊</span>
                              <span className="text-white/60">{survey.responses || 0}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          <div className={`flex items-center gap-1 text-xs ${status.color}`}>
                            <span>{status.icon}</span>
                            <span className="capitalize">{status.status}</span>
                          </div>
                          {survey.scheduling?.inheritGlobal && (
                            <span className="text-xs text-blue-400 bg-blue-600/20 px-2 py-1 rounded">Global</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Settings */}
        <div className="flex-1 flex flex-col">
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/20 rounded-xl">
                  <span className="text-2xl">⚙️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Survey Scheduling</h3>
                  <p className="text-white/70 text-sm">
                    {selectedSurvey ? `Managing: ${selectedSurvey.title}` : "Select a survey to configure timing"}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            {!selectedSurvey ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <span className="text-6xl block mb-4">📅</span>
                  <h3 className="text-xl font-bold text-white mb-2">Select a Survey</h3>
                  <p className="text-white/70">Choose a survey from the left panel to configure its timing settings</p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Survey Info */}
                <div className="bg-black/20 rounded-xl p-4 border border-white/10">
                  <h4 className="font-medium text-white mb-2">Survey Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Title:</span>
                      <span className="text-white">{selectedSurvey.title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">URL:</span>
                      <span className="text-blue-400 font-mono">/survey/{selectedSurvey.urlSlug}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Views:</span>
                      <span className="text-white">{selectedSurvey.views || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-white/60">Responses:</span>
                      <span className="text-white">{selectedSurvey.responses || 0}</span>
                    </div>
                  </div>
                </div>

                {/* Timing Mode */}
                <div className="bg-blue-600/10 border border-blue-600/30 rounded-xl p-4">
                  <h4 className="font-medium text-blue-400 mb-3">Timing Mode</h4>
                  <div className="space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="timingMode"
                        checked={timingSettings.inheritGlobal}
                        onChange={() => setTimingSettings(prev => ({ ...prev, inheritGlobal: true }))}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-white font-medium">Use Global Timing Settings</span>
                        <p className="text-white/60 text-sm">Follow the main survey schedule from admin dashboard</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="radio"
                        name="timingMode"
                        checked={!timingSettings.inheritGlobal}
                        onChange={() => setTimingSettings(prev => ({ ...prev, inheritGlobal: false }))}
                        className="text-blue-500 focus:ring-blue-500"
                      />
                      <div>
                        <span className="text-white font-medium">Custom Timing Settings</span>
                        <p className="text-white/60 text-sm">Set independent schedule for this survey only</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Custom Timing Settings */}
                {!timingSettings.inheritGlobal && (
                  <div className="bg-purple-600/10 border border-purple-600/30 rounded-xl p-4">
                    <h4 className="font-medium text-purple-400 mb-3">Custom Scheduling</h4>
                    
                    <div className="space-y-4">
                      {/* Enable Survey */}
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          id="enableTiming"
                          checked={timingSettings.enabled}
                          onChange={(e) => setTimingSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                          className="text-purple-500 focus:ring-purple-500 rounded"
                        />
                        <label htmlFor="enableTiming" className="text-white font-medium cursor-pointer">
                          Enable Survey Timing
                        </label>
                      </div>

                      {timingSettings.enabled && (
                        <>
                          {/* Start Date */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              Start Date & Time (PKT)
                            </label>
                            <input
                              type="datetime-local"
                              value={timingSettings.startDate}
                              onChange={(e) => setTimingSettings(prev => ({ ...prev, startDate: e.target.value }))}
                              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            <p className="text-xs text-white/50 mt-1">Leave empty for immediate start</p>
                          </div>

                          {/* End Date */}
                          <div>
                            <label className="block text-sm font-medium text-white/80 mb-2">
                              End Date & Time (PKT)
                            </label>
                            <input
                              type="datetime-local"
                              value={timingSettings.endDate}
                              onChange={(e) => setTimingSettings(prev => ({ ...prev, endDate: e.target.value }))}
                              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                            />
                            <p className="text-xs text-white/50 mt-1">Leave empty for no end time</p>
                          </div>

                          {/* Current Status Preview */}
                          <div className="bg-black/20 rounded-lg p-3 border border-white/10">
                            <div className="text-sm">
                              <span className="text-white/60">Current Status: </span>
                              <span className={`font-medium ${getSurveyStatus({...selectedSurvey, scheduling: timingSettings}).color}`}>
                                {getSurveyStatus({...selectedSurvey, scheduling: timingSettings}).icon} {getSurveyStatus({...selectedSurvey, scheduling: timingSettings}).status}
                              </span>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Save Button */}
                <div className="flex gap-3">
                  <button
                    onClick={saveScheduling}
                    disabled={saving || !selectedSurvey}
                    className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 disabled:opacity-50 disabled:cursor-not-allowed py-3 px-4 rounded-xl text-white font-medium transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    {saving ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <span>💾</span>
                        Save Scheduling Settings
                      </>
                    )}
                  </button>
                  
                  <button
                    onClick={onClose}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl text-white transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
