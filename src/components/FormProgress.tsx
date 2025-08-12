"use client";
import { useState, useEffect } from "react";

interface FormProgressProps {
  currentStep: number;
  totalSteps: number;
  completedSteps: number[];
  stepNames: string[];
  onStepClick: (step: number) => void;
}

export default function FormProgress({ 
  currentStep, 
  totalSteps, 
  completedSteps, 
  stepNames,
  onStepClick 
}: FormProgressProps) {
  const [showAchievement, setShowAchievement] = useState<string | null>(null);
  
  useEffect(() => {
    const completionPercentage = (completedSteps.length / totalSteps) * 100;
    
    if (completionPercentage === 25 && !showAchievement) {
      setShowAchievement("🎯 Quarter Way Done!");
    } else if (completionPercentage === 50 && showAchievement !== "💪 Halfway Champion!") {
      setShowAchievement("💪 Halfway Champion!");
    } else if (completionPercentage === 75 && showAchievement !== "🚀 Almost There!") {
      setShowAchievement("🚀 Almost There!");
    } else if (completionPercentage === 100 && showAchievement !== "✨ Survey Master!") {
      setShowAchievement("✨ Survey Master!");
    }
    
    if (showAchievement) {
      const timer = setTimeout(() => setShowAchievement(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [completedSteps.length, totalSteps, showAchievement]);

  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;
  const completionPercentage = (completedSteps.length / totalSteps) * 100;

  return (
    <div className="space-y-4 relative">
      {/* Achievement Notification */}
      {showAchievement && (
        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium animate-bounce-in shadow-lg">
            {showAchievement}
          </div>
        </div>
      )}

      {/* Progress Header */}
      <div className="flex items-center justify-between text-sm">
        <div className="text-white/80 font-medium">
          Progress: {Math.round(progressPercentage)}% • Completed: {Math.round(completionPercentage)}%
        </div>
        <div className="flex gap-1">
          {completedSteps.length >= 1 && (
            <span className="text-yellow-400" title="Getting Started">🎯</span>
          )}
          {completedSteps.length >= 3 && (
            <span className="text-blue-400" title="Great Progress">💪</span>
          )}
          {completedSteps.length >= 5 && (
            <span className="text-purple-400" title="Almost Done">🚀</span>
          )}
          {completedSteps.length === totalSteps && (
            <span className="text-emerald-400" title="Survey Master">✨</span>
          )}
        </div>
      </div>

      {/* Dual Progress Bars */}
      <div className="space-y-2">
        {/* Current Progress */}
        <div className="h-2 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-700 ease-out" 
            style={{ width: `${progressPercentage}%` }}
          />
          <div className="absolute inset-0 shimmer rounded-full" />
        </div>
        
        {/* Completion Progress */}
        <div className="h-1.5 bg-white/5 rounded-full overflow-hidden relative">
          <div 
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-700 ease-out animate-pulse-glow" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto whitespace-nowrap text-xs pb-2">
        {stepNames.map((name, i) => (
          <div key={name} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onStepClick(i)}
              className={`progress-step px-3 py-2 rounded-full border transition-all duration-300 chip ${
                i === currentStep
                  ? "bg-blue-600 border-blue-500 text-white selected animate-pulse-glow"
                  : completedSteps.includes(i)
                  ? "bg-emerald-600/50 border-emerald-500/50 text-emerald-200"
                  : i < currentStep
                  ? "bg-blue-800/50 border-blue-600/50 text-blue-200"
                  : "bg-black/20 border-white/10 text-white/80 hover:bg-black/30"
              } ${i === currentStep ? 'active' : ''}`}
            >
              <span className="relative z-10">
                {completedSteps.includes(i) ? '✓' : i + 1}. {name}
              </span>
            </button>
            {i < stepNames.length - 1 && <span className="opacity-30">·</span>}
          </div>
        ))}
      </div>
    </div>
  );
}
