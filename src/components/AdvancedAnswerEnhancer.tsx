"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";

interface AdvancedAnswerEnhancerProps {
  currentAnswer: string;
  questionText: string;
  onEnhanced: (enhancedAnswer: string) => void;
  placeholder?: string;
  questionType?: 'text' | 'short_text';
}

type EnhancementMode = 
  | 'improve' 
  | 'shorten' 
  | 'urdu' 
  | 'english' 
  | 'formal' 
  | 'personal' 
  | 'detailed' 
  | 'creative'
  | 'technical'
  | 'emotional';

export default function AdvancedAnswerEnhancer({ 
  currentAnswer, 
  questionText, 
  onEnhanced, 
  placeholder = "Write your answer...",
  questionType = 'text'
}: AdvancedAnswerEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedMode, setSelectedMode] = useState<EnhancementMode>('improve');

  // Early return after all hooks
  if (!currentAnswer || !currentAnswer.trim()) {
    return null;
  }

  // Get AI-powered suggestions
  const generateSuggestions = async () => {
    if (suggestions.length > 0) return; // Don't regenerate if we already have them
    
    setLoadingSuggestions(true);
    try {
      const response = await fetch("/api/ai-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: currentAnswer,
          question: questionText,
          questionType
        })
      });

      const data = await response.json();
      if (data.ok) {
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error("Failed to get suggestions:", error);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  useEffect(() => {
    if (showOptions && currentAnswer.trim().length > 10) {
      generateSuggestions();
    }
  }, [showOptions, currentAnswer]);

  const enhanceAnswer = async (mode: EnhancementMode) => {
    if (!currentAnswer.trim()) {
      toast.error("Please write an answer first to enhance it");
      return;
    }

    setIsEnhancing(true);
    const loadingToast = toast.loading(`🤖 ${getModeLabel(mode)} your answer...`);

    try {
      const response = await fetch("/api/ai-enhance-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: currentAnswer,
          question: questionText,
          mode,
          context: "Pakistani survey response",
          questionType
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        onEnhanced(data.enhancedAnswer);
        toast.dismiss(loadingToast);
        toast.success(`✨ Answer enhanced with ${getModeLabel(mode).toLowerCase()} style!`, {
          duration: 3000,
          style: {
            background: 'rgba(34, 197, 94, 0.1)',
            border: '1px solid rgba(34, 197, 94, 0.3)',
            color: '#22c55e'
          }
        });
        setShowOptions(false);
      } else {
        throw new Error(data.error || "Enhancement failed");
      }
    } catch (error) {
      console.error("Enhancement error:", error);
      toast.dismiss(loadingToast);
      toast.error("Failed to enhance answer. Please try again.", {
        duration: 4000
      });
    } finally {
      setIsEnhancing(false);
    }
  };

  const getModeLabel = (mode: EnhancementMode): string => {
    const labels = {
      improve: "Improving",
      shorten: "Shortening", 
      urdu: "Adding Urdu Context",
      english: "Polishing English",
      formal: "Making Formal",
      personal: "Making Personal",
      detailed: "Adding Details",
      creative: "Making Creative",
      technical: "Making Technical",
      emotional: "Adding Emotion"
    };
    return labels[mode];
  };

  const getModeDescription = (mode: EnhancementMode): string => {
    const descriptions = {
      improve: "Make it better overall",
      shorten: "Make it more concise", 
      urdu: "Add Pakistani context",
      english: "Polish the English",
      formal: "Professional tone",
      personal: "Personal storytelling",
      detailed: "Add more depth",
      creative: "Creative expression",
      technical: "Technical accuracy",
      emotional: "Emotional connection"
    };
    return descriptions[mode];
  };

  const getModeIcon = (mode: EnhancementMode): string => {
    const icons = {
      improve: "✨",
      shorten: "📝", 
      urdu: "🇵🇰",
      english: "🔤",
      formal: "👔",
      personal: "💝",
      detailed: "🔍",
      creative: "🎨",
      technical: "⚙️",
      emotional: "❤️"
    };
    return icons[mode];
  };

  const enhancementModes: EnhancementMode[] = questionType === 'short_text' 
    ? ['improve', 'shorten', 'formal', 'english', 'urdu']
    : ['improve', 'detailed', 'personal', 'formal', 'creative', 'technical', 'emotional', 'shorten', 'english', 'urdu'];

  if (!showOptions) {
    return (
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => setShowOptions(true)}
          className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border border-purple-500/30 rounded-lg sm:rounded-xl text-purple-300 hover:bg-purple-600/30 transition-all duration-200 text-xs sm:text-sm group"
        >
          <span className="text-base sm:text-lg group-hover:scale-110 transition-transform">🤖</span>
          <span className="hidden sm:inline">Enhance with AI</span>
          <span className="sm:hidden">AI</span>
          <span className="text-xs bg-white/10 px-1 sm:px-2 py-0.5 sm:py-1 rounded-full">New!</span>
        </button>
        <div className="text-xs text-white/50">
          {currentAnswer.length} chars
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[9999] flex items-start justify-center p-2 sm:p-4 pt-4">
      <div className="bg-slate-900/98 backdrop-blur-sm border border-white/20 rounded-xl sm:rounded-2xl p-3 sm:p-6 w-full max-w-sm sm:max-w-4xl max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
              <span className="text-xl sm:text-2xl">🤖</span>
              <span className="hidden sm:inline">AI Answer Enhancement Studio</span>
              <span className="sm:hidden">AI Enhancement</span>
            </h3>
            <p className="text-white/60 text-xs sm:text-sm mt-1">Choose how to improve your answer</p>
          </div>
          <button
            onClick={() => setShowOptions(false)}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-all flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Current Answer Preview */}
        <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-600/10 border border-blue-600/30 rounded-lg sm:rounded-xl">
          <h4 className="text-blue-400 font-medium mb-2 text-sm sm:text-base">Current Answer:</h4>
          <div className="text-white/80 text-xs sm:text-sm max-h-24 sm:max-h-32 overflow-y-auto bg-black/20 p-2 sm:p-3 rounded-lg">
            {currentAnswer}
          </div>
          <div className="text-xs text-blue-300 mt-1 sm:mt-2">
            {currentAnswer.length} chars • {currentAnswer.split(' ').length} words
          </div>
        </div>

        {/* Enhancement Modes Grid */}
        <div className="mb-4 sm:mb-6">
          <h4 className="text-white font-medium mb-2 sm:mb-3 text-sm sm:text-base">Choose Enhancement Style:</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
            {enhancementModes.map((mode) => (
              <button
                key={mode}
                onClick={() => setSelectedMode(mode)}
                className={`p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all text-left ${
                  selectedMode === mode
                    ? 'bg-purple-600/30 border-purple-500/50 text-purple-200'
                    : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <div className="text-base sm:text-lg mb-1">{getModeIcon(mode)}</div>
                <div className="text-xs sm:text-sm font-medium capitalize">{mode}</div>
                <div className="text-xs opacity-60 hidden sm:block">{getModeDescription(mode)}</div>
              </button>
            ))}
          </div>
        </div>

        {/* AI Suggestions */}
        {suggestions.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <span>💡</span>
              AI Suggestions:
            </h4>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onEnhanced(suggestion)}
                  className="w-full p-3 bg-amber-600/10 border border-amber-600/30 rounded-lg text-left text-amber-200 hover:bg-amber-600/20 transition-all text-sm"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {loadingSuggestions && (
          <div className="mb-6 p-4 bg-yellow-600/10 border border-yellow-600/30 rounded-xl">
            <div className="flex items-center gap-2 text-yellow-400">
              <div className="w-4 h-4 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
              <span>Generating AI suggestions...</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 sm:gap-3">
          <button
            onClick={() => enhanceAnswer(selectedMode)}
            disabled={isEnhancing}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 px-4 sm:px-6 py-3 rounded-lg sm:rounded-xl text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isEnhancing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm sm:text-base">Enhancing...</span>
              </>
            ) : (
              <>
                <span>{getModeIcon(selectedMode)}</span>
                <span className="text-sm sm:text-base">{getModeLabel(selectedMode)} Answer</span>
              </>
            )}
          </button>
          
          <button
            onClick={() => setShowOptions(false)}
            className="w-full px-4 sm:px-6 py-3 bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg sm:rounded-xl text-white transition-all text-sm sm:text-base"
          >
            Cancel
          </button>
        </div>

        {/* Feature Info */}
        <div className="mt-4 p-3 bg-green-600/10 border border-green-600/30 rounded-lg">
          <div className="text-green-400 text-xs flex items-center gap-2">
            <span>✨</span>
            <span>Powered by advanced AI • Respects your original meaning • Pakistani context aware</span>
          </div>
        </div>
      </div>
    </div>
  );
}
