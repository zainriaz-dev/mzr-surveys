"use client";
import { useState } from "react";
import { GhibliFrame } from "./GhibliFrame";
import toast from "react-hot-toast";

type Question = {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'number' | 'rating' | 'yes_no' | 'dropdown';
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
  status?: string;
};

interface SurveyPreviewProps {
  survey: Survey;
  onClose: () => void;
  onPublish?: (survey: Survey) => void;
}

export default function SurveyPreview({ survey, onClose, onPublish }: SurveyPreviewProps) {
  const [currentSection, setCurrentSection] = useState(0);
  const [responses, setResponses] = useState<Record<string, any>>({});
  const [isPublishing, setIsPublishing] = useState(false);

  const updateResponse = (questionId: string, value: any) => {
    setResponses(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const handlePublish = async () => {
    setIsPublishing(true);
    const loadingToast = toast.loading("🚀 Publishing survey...");
    
    try {
      if (onPublish) {
        await onPublish({
          ...survey,
          status: 'published'
        });
        toast.dismiss(loadingToast);
        toast.success("✨ Survey published successfully!");
        onClose();
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to publish survey");
    } finally {
      setIsPublishing(false);
    }
  };

  const renderQuestion = (question: Question, sectionIndex: number) => {
    const responseKey = `${sectionIndex}_${question.id}`;
    const value = responses[responseKey];

    switch (question.type) {
      case 'text':
        return (
          <textarea
            value={value || ''}
            onChange={(e) => updateResponse(responseKey, e.target.value)}
            placeholder={question.placeholder || 'Enter your answer...'}
            className="w-full h-24 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500 resize-none"
          />
        );

      case 'single_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
                <input
                  type="radio"
                  name={responseKey}
                  value={option}
                  checked={value === option}
                  onChange={(e) => updateResponse(responseKey, e.target.value)}
                  className="text-emerald-500 focus:ring-emerald-500"
                />
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'multiple_choice':
        return (
          <div className="space-y-2">
            {question.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 cursor-pointer p-2 hover:bg-white/5 rounded-lg transition-colors">
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
                <span className="text-white">{option}</span>
              </label>
            ))}
          </div>
        );

      case 'yes_no':
        return (
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-emerald-600/20 hover:bg-emerald-600/30 rounded-lg transition-colors">
              <input
                type="radio"
                name={responseKey}
                value="yes"
                checked={value === 'yes'}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                className="text-emerald-500 focus:ring-emerald-500"
              />
              <span className="text-white">✅ Yes</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors">
              <input
                type="radio"
                name={responseKey}
                value="no"
                checked={value === 'no'}
                onChange={(e) => updateResponse(responseKey, e.target.value)}
                className="text-red-500 focus:ring-red-500"
              />
              <span className="text-white">❌ No</span>
            </label>
          </div>
        );

      case 'rating':
        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-white/70">
              <span>{question.min || 1}</span>
              <span>Rating</span>
              <span>{question.max || 10}</span>
            </div>
            <div className="flex gap-2 justify-center">
              {Array.from({ length: (question.max || 10) - (question.min || 1) + 1 }, (_, i) => {
                const rating = (question.min || 1) + i;
                return (
                  <button
                    key={rating}
                    onClick={() => updateResponse(responseKey, rating)}
                    className={`w-10 h-10 rounded-full border-2 transition-all ${
                      value === rating
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-white/30 text-white/70 hover:border-emerald-500 hover:text-emerald-500'
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
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
          />
        );

      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => updateResponse(responseKey, e.target.value)}
            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
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

  const currentSectionData = survey.sections[currentSection];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-4xl bg-slate-900 rounded-2xl border border-white/10 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                👁️ Survey Preview
              </h2>
              <p className="text-white/70 text-sm mt-1">Test your survey before publishing</p>
            </div>
            <div className="flex gap-3">
              {onPublish && (
                <button
                  onClick={handlePublish}
                  disabled={isPublishing}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                  {isPublishing ? "🚀 Publishing..." : "🚀 Publish Survey"}
                </button>
              )}
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        {/* Survey Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Survey Header */}
            <div className="text-center space-y-4">
              <h1 className="text-3xl font-bold text-white">{survey.title}</h1>
              <p className="text-white/70">{survey.description}</p>
              <div className="flex items-center justify-center gap-4 text-sm text-white/60">
                <span>⏱️ {survey.estimatedTime}</span>
                <span>📝 {survey.sections.length} sections</span>
                <span>❓ {survey.sections.reduce((acc, section) => acc + section.questions.length, 0)} questions</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-white/70">
                <span>Section {currentSection + 1} of {survey.sections.length}</span>
                <span>{Math.round(((currentSection + 1) / survey.sections.length) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${((currentSection + 1) / survey.sections.length) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Section */}
            {currentSectionData && (
              <GhibliFrame title={currentSectionData.title}>
                <div className="space-y-6">
                  <p className="text-white/70">{currentSectionData.description}</p>
                  
                  <div className="space-y-6">
                    {currentSectionData.questions.map((question, index) => (
                      <div key={question.id} className="space-y-3">
                        <div className="flex items-start gap-2">
                          <span className="text-emerald-400 font-medium">{index + 1}.</span>
                          <div className="flex-1">
                            <h3 className="text-white font-medium">
                              {question.question}
                              {question.required && <span className="text-red-400 ml-1">*</span>}
                            </h3>
                            <div className="mt-3">
                              {renderQuestion(question, currentSection)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </GhibliFrame>
            )}

            {/* Navigation */}
            <div className="flex justify-between items-center pt-4">
              <button
                onClick={() => setCurrentSection(prev => Math.max(0, prev - 1))}
                disabled={currentSection === 0}
                className="bg-white/10 hover:bg-white/20 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                ← Previous
              </button>
              
              <div className="flex gap-2">
                {survey.sections.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSection(index)}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentSection ? 'bg-emerald-500' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSection(prev => Math.min(survey.sections.length - 1, prev + 1))}
                disabled={currentSection === survey.sections.length - 1}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 rounded-xl transition-all flex items-center gap-2"
              >
                Next →
              </button>
            </div>

            {/* Test Complete */}
            {currentSection === survey.sections.length - 1 && (
              <div className="text-center space-y-4 pt-6 border-t border-white/10">
                <div className="text-4xl">🎉</div>
                <h3 className="text-xl font-bold text-white">Preview Complete!</h3>
                <p className="text-white/70">
                  This is how your survey will look to participants. 
                  {onPublish && " Ready to publish?"}
                </p>
                {onPublish && (
                  <button
                    onClick={handlePublish}
                    disabled={isPublishing}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-6 py-3 rounded-xl flex items-center gap-2 mx-auto transition-all"
                  >
                    {isPublishing ? "🚀 Publishing..." : "🚀 Publish This Survey"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
