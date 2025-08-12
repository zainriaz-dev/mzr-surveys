"use client";
import { useState } from "react";
import toast from "react-hot-toast";

interface AnswerEnhancerProps {
  currentAnswer: string;
  questionText: string;
  onEnhanced: (enhancedAnswer: string) => void;
  placeholder?: string;
}

export default function AnswerEnhancer({ 
  currentAnswer, 
  questionText, 
  onEnhanced, 
  placeholder = "Write your answer..." 
}: AnswerEnhancerProps) {
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [showOptions, setShowOptions] = useState(false);

  // Early return after all hooks
  if (!currentAnswer || !currentAnswer.trim()) {
    return null; // Don't show enhance button if no answer
  }

  const enhanceAnswer = async (mode: 'improve' | 'shorten' | 'urdu' | 'english') => {
    if (!currentAnswer.trim()) {
      toast.error("Please write an answer first to enhance it");
      return;
    }

    setIsEnhancing(true);
    const loadingToast = toast.loading("🤖 AI is enhancing your answer...");

    try {
      const response = await fetch("/api/ai-enhance-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          answer: currentAnswer,
          question: questionText,
          mode,
          context: "Pakistani survey response"
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        onEnhanced(data.enhancedAnswer);
        toast.dismiss(loadingToast);
        toast.success("✨ Answer enhanced successfully!");
        setShowOptions(false);
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to enhance answer: " + data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to enhance answer");
      console.error("Answer enhancement error:", error);
    } finally {
      setIsEnhancing(false);
    }
  };

  return (
    <div className="relative mt-2">
      <button
        onClick={() => setShowOptions(!showOptions)}
        disabled={isEnhancing}
        className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 disabled:opacity-50 px-4 py-2 rounded-lg text-white text-sm font-medium flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-purple-500/25 active:scale-95"
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
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={() => setShowOptions(false)}
          />
          
          {/* Options Modal */}
          <div className="relative w-full max-w-md bg-slate-900 border border-white/20 rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
            {/* Header */}
            <div className="bg-purple-600/10 border-b border-purple-600/30 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span>🤖</span>
                  <h3 className="font-semibold text-white">Enhance Your Answer</h3>
                </div>
                <button
                  onClick={() => setShowOptions(false)}
                  className="text-white/60 hover:text-white bg-white/10 hover:bg-white/20 w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
              <p className="text-white/70 text-sm mt-1">Choose how you'd like to improve your response</p>
            </div>
            
            {/* Options */}
            <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
              <button
                onClick={() => enhanceAnswer('improve')}
                className="w-full text-left p-3 hover:bg-emerald-600/10 rounded-lg transition-colors group border border-emerald-600/30 hover:border-emerald-500/50"
              >
                <div className="font-medium text-emerald-400 group-hover:text-emerald-300 flex items-center gap-2">
                  <span>🚀</span> Improve & Expand
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Make your answer more detailed and well-explained
                </div>
              </button>

              <button
                onClick={() => enhanceAnswer('shorten')}
                className="w-full text-left p-3 hover:bg-blue-600/10 rounded-lg transition-colors group border border-blue-600/30 hover:border-blue-500/50"
              >
                <div className="font-medium text-blue-400 group-hover:text-blue-300 flex items-center gap-2">
                  <span>📝</span> Make Concise
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Keep the same meaning but make it shorter and clearer
                </div>
              </button>

              <button
                onClick={() => enhanceAnswer('urdu')}
                className="w-full text-left p-3 hover:bg-yellow-600/10 rounded-lg transition-colors group border border-yellow-600/30 hover:border-yellow-500/50"
              >
                <div className="font-medium text-yellow-400 group-hover:text-yellow-300 flex items-center gap-2">
                  <span>🇵🇰</span> Add Urdu Context
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Include Urdu words and Pakistani cultural context
                </div>
              </button>

              <button
                onClick={() => enhanceAnswer('english')}
                className="w-full text-left p-3 hover:bg-cyan-600/10 rounded-lg transition-colors group border border-cyan-600/30 hover:border-cyan-500/50"
              >
                <div className="font-medium text-cyan-400 group-hover:text-cyan-300 flex items-center gap-2">
                  <span>🌍</span> Professional English
                </div>
                <div className="text-xs text-white/70 mt-1">
                  Convert to clear, professional English
                </div>
              </button>
            </div>

            {/* Footer */}
            <div className="border-t border-white/10 p-3 bg-black/20">
              <button
                onClick={() => setShowOptions(false)}
                className="w-full text-center text-sm text-white/70 hover:text-white py-2 hover:bg-white/5 rounded-lg transition-all"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
