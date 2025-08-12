"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface QuestionEnhancerProps {
  questionText: string;
  questionType: string;
  onEnhanced: (enhancedQuestion: string, suggestions?: string[]) => void;
  className?: string;
}

export default function QuestionEnhancer({ 
  questionText, 
  questionType, 
  onEnhanced, 
  className = "" 
}: QuestionEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  const enhanceQuestion = async (mode: 'improve' | 'simplify' | 'cultural') => {
    if (!questionText.trim()) {
      toast.error("Please enter a question first");
      return;
    }

    setIsEnhancing(true);
    const loadingToast = toast.loading("🤖 AI is enhancing your question...");

    try {
      const response = await fetch("/api/admin/ai-question-enhance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: questionText,
          questionType,
          mode,
          context: "Pakistani survey targeting youth and communities"
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        onEnhanced(data.enhancedQuestion, data.optionSuggestions);
        toast.dismiss(loadingToast);
        toast.success("✨ Question enhanced successfully!");
        setShowOptions(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to enhance question: " + data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to enhance question");
      console.error("Question enhancement error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isEnhancing}
        className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-3 py-1 rounded-lg text-white text-sm flex items-center gap-2 transition-all"
      >
        {isEnhancing ? (
          <>
            <div className="w-3 h-3 border border-white/30 border-t-white rounded-full animate-spin"></div>
            Enhancing...
          </>
        ) : (
          <>
            ✨ Enhance with AI
          </>
        )}
      </button>

      {showOptions && !isEnhancing && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40"
            onClick={() => setShowOptions(false)}
          />
          
          {/* Options Menu */}
          <div className="absolute top-full mt-2 right-0 z-50 bg-slate-800 rounded-lg border border-white/20 p-3 min-w-64 shadow-2xl">
            <div className="space-y-2">
              <div className="text-sm font-medium text-white mb-3">Choose enhancement style:</div>
              
              <button
                onClick={() => enhanceQuestion('improve')}
                className="w-full text-left p-3 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="font-medium text-emerald-400 group-hover:text-emerald-300">
                  🚀 Improve & Clarify
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Make the question clearer and more engaging
                </div>
              </button>

              <button
                onClick={() => enhanceQuestion('simplify')}
                className="w-full text-left p-3 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="font-medium text-blue-400 group-hover:text-blue-300">
                  📝 Simplify Language
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Use simpler words for better understanding
                </div>
              </button>

              <button
                onClick={() => enhanceQuestion('cultural')}
                className="w-full text-left p-3 hover:bg-white/10 rounded-lg transition-colors group"
              >
                <div className="font-medium text-yellow-400 group-hover:text-yellow-300">
                  🇵🇰 Pakistani Context
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Adapt for Pakistani culture and context
                </div>
              </button>

              <div className="border-t border-white/10 pt-2 mt-2">
                <button
                  onClick={() => setShowOptions(false)}
                  className="w-full text-center text-xs text-white/50 hover:text-white/70 py-1"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
