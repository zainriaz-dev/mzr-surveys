"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

type SurveySettings = {
  id: string;
  enabled: boolean;
  title: string;
  description: string;
  scheduling: {
    startDate: string | null;
    endDate: string | null;
    timezone: string;
    autoEnable: boolean;
    autoDisable: boolean;
    notifyBeforeEnd: boolean;
    notifyDays: number;
  };
  display: {
    showCountdown: boolean;
    showParticipantCount: boolean;
    showProgress: boolean;
    customMessage: string;
    thankYouMessage: string;
  };
  limits: {
    maxResponses: number | null;
    dailyLimit: number | null;
    requireUniqueEmail: boolean;
    allowAnonymous: boolean;
  };
  isCurrentlyActive: boolean;
  status: string;
};

interface SurveyScheduleManagerProps {
  onClose: () => void;
  currentSettings: SurveySettings;
  onUpdate: () => void;
}

export default function SurveyScheduleManager({ onClose, currentSettings, onUpdate }: SurveyScheduleManagerProps) {
  const [isClient, setIsClient] = useState(false);
  
  // Initialize with safe defaults
  const [settings, setSettings] = useState<SurveySettings>(currentSettings || {
    id: "main",
    enabled: false,
    title: "",
    description: "",
    scheduling: {
      startDate: null,
      endDate: null,
      timezone: "Asia/Karachi",
      autoEnable: false,
      autoDisable: false,
      notifyBeforeEnd: true,
      notifyDays: 3
    },
    display: {
      showCountdown: true,
      showParticipantCount: true,
      showProgress: true,
      customMessage: "",
      thankYouMessage: "Thank you for participating in our survey!"
    },
    limits: {
      maxResponses: null,
      dailyLimit: null,
      requireUniqueEmail: false,
      allowAnonymous: true
    },
    isCurrentlyActive: false,
    status: "inactive"
  });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'schedule' | 'display' | 'limits'>('schedule');

  useEffect(() => {
    setIsClient(true);
    if (currentSettings) {
      setSettings(prev => ({
        ...prev,
        ...currentSettings,
        scheduling: {
          ...prev.scheduling,
          ...currentSettings.scheduling
        },
        display: {
          ...prev.display,
          ...currentSettings.display
        },
        limits: {
          ...prev.limits,
          ...currentSettings.limits
        }
      }));
    }
  }, [currentSettings]);

  const updateSettings = (section: keyof SurveySettings, updates: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: { ...prev[section], ...updates }
    }));
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
      
      // Subtract 5 hours to convert from PKT to UTC
      const pakistaniOffset = 5 * 60; // Pakistan is UTC+5
      const utcTime = new Date(localDate.getTime() - (pakistaniOffset * 60 * 1000));
      
      return utcTime.toISOString();
    } catch (error) {
      return null;
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    const loadingToast = toast.loading("💾 Saving survey settings...");

    try {
      // Remove MongoDB-specific fields before sending
      const { _id, id, createdAt, updatedAt, isCurrentlyActive, status, ...cleanSettings } = settings;
      
      const response = await fetch("/api/admin/survey-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cleanSettings)
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.dismiss(loadingToast);
        toast.success("⚙️ Survey settings updated successfully!");
        onUpdate();
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to update settings: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update settings: Network error");
      console.error("Settings save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = () => {
    if (settings.isCurrentlyActive) return "text-emerald-400 bg-emerald-600/20";
    return "text-red-400 bg-red-600/20";
  };

  const getStatusText = () => {
    if (!settings || !settings.enabled) return "Disabled";
    
    const now = new Date();
    const startDate = settings.scheduling?.startDate ? new Date(settings.scheduling.startDate) : null;
    const endDate = settings.scheduling?.endDate ? new Date(settings.scheduling.endDate) : null;
    
    if (startDate && now < startDate) return `Scheduled (starts ${startDate.toLocaleDateString()})`;
    if (endDate && now > endDate) return `Ended (${endDate.toLocaleDateString()})`;
    if (settings.isCurrentlyActive) return "Active";
    
    return "Inactive";
  };

  // Prevent SSR mismatch by not rendering until client-side
  if (!isClient) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-600/20 rounded-xl">
                <span className="text-2xl">⚙️</span>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Survey Schedule Manager</h2>
                <p className="text-white/60 text-sm">Control when and how your survey is available</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor()}`}>
                {getStatusText()}
              </div>
              <button
                onClick={onClose}
                className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-white/10 px-6">
          <div className="flex gap-1">
            {[
              { id: 'schedule', label: '📅 Schedule', icon: '📅' },
              { id: 'display', label: '🎨 Display', icon: '🎨' },
              { id: 'limits', label: '🛡️ Limits', icon: '🛡️' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-400 bg-blue-600/10'
                    : 'border-transparent text-white/60 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className="mr-2">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'schedule' && (
            <div className="space-y-6">
              {/* Master Enable/Disable */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-600/20 rounded-lg">
                      <span className="text-emerald-400">🚀</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Survey Status</h3>
                      <p className="text-sm text-white/60">Enable or disable the survey globally</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) => setSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>
                <div className="text-xs text-white/50 bg-black/20 rounded-lg p-3">
                  When disabled, participants will see a "Survey not available" message
                </div>
              </div>

              {/* Date Range Scheduling */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-600/20 rounded-lg">
                    <span className="text-blue-400">📅</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Schedule</h3>
                    <p className="text-sm text-white/60">Set when the survey should be available</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Start Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(settings.scheduling.startDate)}
                      onChange={(e) => updateSettings('scheduling', { 
                        startDate: parseLocalDateTime(e.target.value) 
                      })}
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-white/50 mt-1">Leave empty for no start restriction</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">End Date & Time</label>
                    <input
                      type="datetime-local"
                      value={formatDateTimeLocal(settings.scheduling.endDate)}
                      onChange={(e) => updateSettings('scheduling', { 
                        endDate: parseLocalDateTime(e.target.value) 
                      })}
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                    />
                    <p className="text-xs text-white/50 mt-1">Leave empty for no end restriction</p>
                  </div>
                </div>

                {/* Automation Options */}
                <div className="mt-4 space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Auto-enable at start time</span>
                      <p className="text-xs text-white/60">Automatically enable survey when start time is reached</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.scheduling.autoEnable}
                      onChange={(e) => updateSettings('scheduling', { autoEnable: e.target.checked })}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Auto-disable at end time</span>
                      <p className="text-xs text-white/60">Automatically disable survey when end time is reached</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.scheduling.autoDisable}
                      onChange={(e) => updateSettings('scheduling', { autoDisable: e.target.checked })}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Timezone */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <label className="block text-sm font-medium text-white mb-2">Timezone</label>
                <select
                  value={settings.scheduling.timezone}
                  onChange={(e) => updateSettings('scheduling', { timezone: e.target.value })}
                  className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Asia/Karachi">Pakistan (Asia/Karachi)</option>
                  <option value="UTC">UTC</option>
                  <option value="Asia/Dubai">UAE (Asia/Dubai)</option>
                  <option value="Asia/Riyadh">Saudi Arabia (Asia/Riyadh)</option>
                  <option value="Europe/London">UK (Europe/London)</option>
                  <option value="America/New_York">US Eastern (America/New_York)</option>
                </select>
              </div>
            </div>
          )}

          {activeTab === 'display' && (
            <div className="space-y-6">
              {/* Display Options */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-purple-600/20 rounded-lg">
                    <span className="text-purple-400">🎨</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Display Settings</h3>
                    <p className="text-sm text-white/60">Control what participants see</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Show countdown timer</span>
                      <p className="text-xs text-white/60">Display time remaining until survey ends</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.showCountdown}
                      onChange={(e) => updateSettings('display', { showCountdown: e.target.checked })}
                      className="text-purple-500 focus:ring-purple-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Show participant count</span>
                      <p className="text-xs text-white/60">Display number of people who have participated</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.showParticipantCount}
                      onChange={(e) => updateSettings('display', { showParticipantCount: e.target.checked })}
                      className="text-purple-500 focus:ring-purple-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Show progress indicators</span>
                      <p className="text-xs text-white/60">Display progress bars and step indicators</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.display.showProgress}
                      onChange={(e) => updateSettings('display', { showProgress: e.target.checked })}
                      className="text-purple-500 focus:ring-purple-500 rounded"
                    />
                  </div>
                </div>
              </div>

              {/* Custom Messages */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Custom Welcome Message</label>
                    <textarea
                      value={settings.display.customMessage}
                      onChange={(e) => updateSettings('display', { customMessage: e.target.value })}
                      placeholder="Optional message to show above the survey..."
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-20 resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Thank You Message</label>
                    <textarea
                      value={settings.display.thankYouMessage}
                      onChange={(e) => updateSettings('display', { thankYouMessage: e.target.value })}
                      placeholder="Message to show after survey completion..."
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 h-20 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'limits' && (
            <div className="space-y-6">
              {/* Response Limits */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-orange-600/20 rounded-lg">
                    <span className="text-orange-400">🛡️</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">Response Limits</h3>
                    <p className="text-sm text-white/60">Control participation limits</p>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Maximum Total Responses</label>
                    <input
                      type="number"
                      value={settings.limits.maxResponses || ''}
                      onChange={(e) => updateSettings('limits', { 
                        maxResponses: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="Unlimited"
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-white mb-2">Daily Response Limit</label>
                    <input
                      type="number"
                      value={settings.limits.dailyLimit || ''}
                      onChange={(e) => updateSettings('limits', { 
                        dailyLimit: e.target.value ? parseInt(e.target.value) : null 
                      })}
                      placeholder="Unlimited"
                      className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-orange-500"
                    />
                  </div>
                </div>
              </div>

              {/* Access Control */}
              <div className="glass rounded-xl p-4 border border-white/10">
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Allow anonymous responses</span>
                      <p className="text-xs text-white/60">Participants can submit without providing email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.limits.allowAnonymous}
                      onChange={(e) => updateSettings('limits', { allowAnonymous: e.target.checked })}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between p-3 bg-black/20 rounded-lg">
                    <div>
                      <span className="text-white font-medium">Require unique email addresses</span>
                      <p className="text-xs text-white/60">Prevent multiple submissions from same email</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.limits.requireUniqueEmail}
                      onChange={(e) => updateSettings('limits', { requireUniqueEmail: e.target.checked })}
                      className="text-orange-500 focus:ring-orange-500 rounded"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 bg-black/20">
          <div className="flex items-center justify-between">
            <div className="text-sm text-white/60">
              Last updated: {new Date(settings.updatedAt || '').toLocaleString()}
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-500 text-white rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                onClick={saveSettings}
                disabled={saving}
                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 disabled:opacity-50 text-white rounded-xl flex items-center gap-2 transition-all"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border border-white/30 border-t-white rounded-full animate-spin"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    💾 Save Settings
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
