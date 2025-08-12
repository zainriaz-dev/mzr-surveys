"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface PublishModalProps {
  survey: any;
  onClose: () => void;
  onPublish: (survey: any, customUrl?: string, aiEnabled?: boolean, scheduleSettings?: any) => void;
}

export default function PublishModal({ survey, onClose, onPublish }: PublishModalProps) {
  const [customUrl, setCustomUrl] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [useGlobalTiming, setUseGlobalTiming] = useState(true);
  const [customTiming, setCustomTiming] = useState({
    enabled: true,
    startDate: "",
    endDate: "",
    timezone: "Asia/Karachi"
  });

  const generateSuggestion = () => {
    const cleanTitle = survey.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/[\s_-]+/g, '-')
      .substring(0, 30);
    
    return cleanTitle + '-survey';
  };

  const handlePublish = async () => {
    const urlToUse = customUrl.trim() || generateSuggestion();
    
    // Validate URL
    if (!/^[a-z0-9-]+$/.test(urlToUse)) {
      toast.error("URL can only contain lowercase letters, numbers, and hyphens");
      return;
    }

    if (urlToUse.length < 3) {
      toast.error("URL must be at least 3 characters long");
      return;
    }

    // Validate custom timing if not using global
    if (!useGlobalTiming) {
      if (customTiming.startDate && customTiming.endDate) {
        const start = new Date(customTiming.startDate);
        const end = new Date(customTiming.endDate);
        if (start >= end) {
          toast.error("End date must be after start date");
          return;
        }
      }
    }
    
    // Prepare schedule settings
    const scheduleSettings = useGlobalTiming ? null : {
      enabled: customTiming.enabled,
      startDate: customTiming.startDate ? new Date(customTiming.startDate).toISOString() : null,
      endDate: customTiming.endDate ? new Date(customTiming.endDate).toISOString() : null,
      timezone: customTiming.timezone,
      inheritGlobal: false
    };

    setIsPublishing(true);
    try {
      await onPublish(survey, urlToUse, aiEnabled, scheduleSettings);
      onClose();
    } catch (error) {
      console.error("Publish error:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  const previewUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/survey/${customUrl || generateSuggestion()}`;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl max-h-[85vh] bg-slate-900 rounded-2xl border border-white/10 overflow-hidden flex flex-col">
        {/* Header */}
        <div className="border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                🚀 Publish Survey
              </h2>
              <p className="text-white/70 text-sm mt-1">Make your survey live and shareable</p>
            </div>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-2 rounded-lg transition-all"
            >
              ✕ Close
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Survey Info */}
          <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-3">
            <h3 className="text-lg font-semibold text-emerald-400 mb-1">{survey.title}</h3>
            <p className="text-white/70 text-sm mb-2">{survey.description}</p>
            <div className="flex items-center gap-3 text-xs text-white/60">
              <span>📝 {survey.sections?.length || 0} sections</span>
              <span>❓ {survey.sections?.reduce((acc: number, section: any) => acc + (section.questions?.length || 0), 0) || 0} questions</span>
            </div>
          </div>

          {/* Custom URL Section */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Custom Survey URL <span className="text-white/50">(optional)</span>
              </label>
              <div className="space-y-2">
                <div className="flex">
                  <span className="bg-emerald-600/20 text-emerald-400 px-3 py-3 rounded-l-lg text-sm border border-emerald-600/30 border-r-0">
                    {typeof window !== 'undefined' ? window.location.origin : ''}/survey/
                  </span>
                  <input
                    type="text"
                    value={customUrl}
                    onChange={(e) => setCustomUrl(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder={generateSuggestion()}
                    className="flex-1 bg-black/20 border border-white/20 border-l-0 rounded-r-lg px-3 py-3 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                    maxLength={50}
                  />
                </div>
                <p className="text-xs text-white/50">
                  Only lowercase letters, numbers, and hyphens allowed. Leave empty for auto-generated URL.
                </p>
              </div>
            </div>

            {/* URL Preview */}
            <div className="bg-black/20 rounded-lg p-3">
              <div className="text-xs text-white/60 mb-1">Preview:</div>
              <div className="font-mono text-emerald-400 text-xs break-all bg-black/30 rounded px-2 py-1">
                {previewUrl}
              </div>
            </div>

            {/* Quick Suggestions */}
            <div>
              <div className="text-xs text-white/60 mb-1">Quick suggestions:</div>
              <div className="flex gap-1 flex-wrap">
                {[
                  generateSuggestion(),
                  'pakistan-survey-' + Date.now().toString(36).slice(-4)
                ].map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => setCustomUrl(suggestion)}
                    className="text-xs bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-2 py-1 rounded transition-all"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* AI Enhancement Settings */}
          <div className="bg-purple-600/10 border border-purple-600/30 rounded-lg p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span>🤖</span>
                <label htmlFor="aiEnabled" className="font-medium text-purple-400 cursor-pointer">
                  AI Answer Enhancement
                </label>
              </div>
              <input
                type="checkbox"
                id="aiEnabled"
                checked={aiEnabled}
                onChange={(e) => setAiEnabled(e.target.checked)}
                className="text-purple-500 focus:ring-purple-500 rounded"
              />
            </div>
            <p className="text-xs text-white/60 mt-2">
              Let participants enhance their text answers with AI
            </p>
          </div>

          {/* Survey Scheduling */}
          <div className="bg-blue-600/10 border border-blue-600/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-3">
              <span>📅</span>
              <h4 className="font-medium text-blue-400">Survey Scheduling</h4>
            </div>
            
            <div className="space-y-3">
              {/* Use Global vs Custom Timing */}
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timingMode"
                    checked={useGlobalTiming}
                    onChange={() => setUseGlobalTiming(true)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white text-sm">Use global timing settings</span>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="timingMode"
                    checked={!useGlobalTiming}
                    onChange={() => setUseGlobalTiming(false)}
                    className="text-blue-500 focus:ring-blue-500"
                  />
                  <span className="text-white text-sm">Set custom timing for this survey</span>
                </label>
              </div>

              {/* Custom Timing Settings */}
              {!useGlobalTiming && (
                <div className="mt-3 space-y-3 p-3 bg-black/20 rounded-lg border border-white/10">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="checkbox"
                      id="customEnabled"
                      checked={customTiming.enabled}
                      onChange={(e) => setCustomTiming(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="text-blue-500 focus:ring-blue-500 rounded"
                    />
                    <label htmlFor="customEnabled" className="text-white text-sm cursor-pointer">
                      Enable survey timing
                    </label>
                  </div>
                  
                  {customTiming.enabled && (
                    <>
                      <div>
                        <label className="block text-xs text-white/60 mb-1">Start Date & Time (PKT)</label>
                        <input
                          type="datetime-local"
                          value={customTiming.startDate}
                          onChange={(e) => setCustomTiming(prev => ({ ...prev, startDate: e.target.value }))}
                          className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs text-white/60 mb-1">End Date & Time (PKT)</label>
                        <input
                          type="datetime-local"
                          value={customTiming.endDate}
                          onChange={(e) => setCustomTiming(prev => ({ ...prev, endDate: e.target.value }))}
                          className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-blue-500 text-sm"
                        />
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-black/20 rounded-lg p-3">
            <h4 className="font-medium text-white text-sm mb-2">Publishing Settings</h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-white/70">Public access</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-white/70">Analytics</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></div>
                <span className="text-white/70">Social sharing</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${aiEnabled ? 'bg-purple-400' : 'bg-gray-400'}`}></div>
                <span className="text-white/70">AI features</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-white/10 p-6 flex-shrink-0">
          <div className="flex gap-3 justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all"
            >
              Cancel
            </button>
            <button
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-lg transition-all flex items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Publishing...
                </>
              ) : (
                <>
                  🚀 Publish Survey
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
