"use client";
import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import QuestionEnhancer from "./QuestionEnhancer";

type Question = {
  id: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'short_text' | 'number' | 'rating' | 'yes_no' | 'dropdown';
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
  createdAt?: string;
  updatedAt?: string;
};

interface SurveyEditorProps {
  onClose: () => void;
  editingSurvey?: Survey | null;
}

export default function SurveyEditor({ onClose, editingSurvey }: SurveyEditorProps) {
  const [survey, setSurvey] = useState<Survey>({
    title: "",
    description: "",
    sections: [{
      id: "section_1",
      title: "General Information",
      description: "Basic questions about the participant",
      questions: []
    }],
    estimatedTime: "5-10 minutes",
    tags: []
  });

  const [activeSection, setActiveSection] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showAIGenerator, setShowAIGenerator] = useState(false);
  const [aiPrompt, setAiPrompt] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (editingSurvey) {
      setSurvey(editingSurvey);
    }
  }, [editingSurvey]);

  const addSection = () => {
    const newSection: Section = {
      id: `section_${Date.now()}`,
      title: "New Section",
      description: "Section description",
      questions: []
    };
    setSurvey(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
    setActiveSection(survey.sections.length);
  };

  const removeSection = (index: number) => {
    if (survey.sections.length <= 1) {
      toast.error("Survey must have at least one section");
      return;
    }
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.filter((_, i) => i !== index)
    }));
    if (activeSection >= survey.sections.length - 1) {
      setActiveSection(Math.max(0, survey.sections.length - 2));
    }
  };

  const updateSection = (index: number, field: keyof Section, value: any) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === index ? { ...section, [field]: value } : section
      )
    }));
  };

  const addQuestion = (sectionIndex: number) => {
    const newQuestion: Question = {
      id: `q_${Date.now()}`,
      type: 'text',
      question: "New question",
      required: false,
      placeholder: "Enter your answer..."
    };

    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    }));
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { ...section, questions: section.questions.filter((_, qi) => qi !== questionIndex) }
          : section
      )
    }));
  };

  const updateQuestion = (sectionIndex: number, questionIndex: number, field: keyof Question, value: any) => {
    setSurvey(prev => ({
      ...prev,
      sections: prev.sections.map((section, i) => 
        i === sectionIndex 
          ? { 
              ...section, 
              questions: section.questions.map((q, qi) => 
                qi === questionIndex ? { ...q, [field]: value } : q
              )
            }
          : section
      )
    }));
  };

  const generateAISurvey = async () => {
    if (!aiPrompt.trim()) {
      toast.error("Please enter a description for your survey");
      return;
    }

    setAiLoading(true);
    const loadingToast = toast.loading("🤖 AI is generating your survey...");

    try {
      const response = await fetch("/api/admin/ai-survey-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: aiPrompt,
          surveyType: "comprehensive",
          targetAudience: "Pakistani youth and communities",
          questionCount: 15
        })
      });

      const data = await response.json();
      
      if (data.ok) {
        setSurvey({
          ...data.survey,
          id: survey.id // Keep existing ID if editing
        });
        setShowAIGenerator(false);
        setAiPrompt("");
        toast.dismiss(loadingToast);
        toast.success("🎉 AI generated your survey successfully!");
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to generate survey: " + data.error);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to generate survey with AI");
      console.error("AI generation error:", error);
    } finally {
      setAiLoading(false);
    }
  };

  const saveSurvey = async () => {
    if (!survey.title.trim()) {
      toast.error("Please enter a survey title");
      return;
    }

    if (!survey.description.trim()) {
      toast.error("Please enter a survey description");
      return;
    }

    if (survey.sections.length === 0) {
      toast.error("Survey must have at least one section");
      return;
    }

    // Check if at least one section has questions
    const hasQuestions = survey.sections.some(section => section.questions.length > 0);
    if (!hasQuestions) {
      toast.error("Survey must have at least one question");
      return;
    }

    setSaving(true);
    const loadingToast = toast.loading("💾 Saving survey...");

    try {
      const method = editingSurvey ? "PUT" : "POST";
      
      // Prepare survey data - ensure id is included for updates
      const surveyData = {
        ...survey,
        // For updates, ensure we have the id from editingSurvey
        ...(editingSurvey && { id: editingSurvey.id })
      };

      const response = await fetch("/api/admin/surveys", {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(surveyData)
      });

      const data = await response.json();
      
      if (data.ok) {
        toast.dismiss(loadingToast);
        toast.success(editingSurvey ? "📝 Survey updated successfully!" : "✨ Survey created successfully!");
        onClose();
      } else {
        toast.dismiss(loadingToast);
        toast.error("Failed to save survey: " + (data.error || "Unknown error"));
        console.error("API Error:", data);
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to save survey: Network error");
      console.error("Save error:", error);
    } finally {
      setSaving(false);
    }
  };

  const questionTypeOptions = [
    { value: 'text', label: '📝 Text Area (AI Enhanced)' },
    { value: 'short_text', label: '📄 Short Text (AI Enhanced)' },
    { value: 'single_choice', label: '⚪ Single Choice' },
    { value: 'multiple_choice', label: '☑️ Multiple Choice' },
    { value: 'yes_no', label: '✅ Yes/No' },
    { value: 'rating', label: '⭐ Rating Scale' },
    { value: 'number', label: '🔢 Number' },
    { value: 'dropdown', label: '📋 Dropdown' }
  ];

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-6xl bg-slate-900 rounded-2xl border border-white/10 my-8">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900/95 backdrop-blur-sm border-b border-white/10 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                📝 Survey Editor
                {editingSurvey && <span className="text-emerald-400 text-sm">(Editing)</span>}
              </h2>
              <p className="text-white/70 text-sm mt-1">Create and customize your survey with AI assistance</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowAIGenerator(!showAIGenerator)}
                className="bg-purple-600 hover:bg-purple-500 px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                🤖 AI Generate
              </button>
              <button
                onClick={saveSurvey}
                disabled={saving}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
              >
                {saving ? "💾 Saving..." : "💾 Save Survey"}
              </button>
              <button
                onClick={onClose}
                className="text-white/70 hover:text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
              >
                ✕ Close
              </button>
            </div>
          </div>
        </div>

        {/* AI Generator Modal */}
        {showAIGenerator && (
          <div className="border-b border-white/10 p-6 bg-purple-600/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              🤖 AI Survey Generator
            </h3>
            <p className="text-white/70 text-sm mb-4">
              Describe what kind of survey you want to create. AI will generate questions, sections, and structure for you.
            </p>
            <div className="space-y-4">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="E.g., 'Create a survey about digital literacy and smartphone usage among Pakistani students, focusing on education apps, online learning challenges, and internet accessibility in rural areas...'"
                className="w-full h-24 bg-black/20 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 resize-none"
                disabled={aiLoading}
              />
              <div className="flex gap-3">
                <button
                  onClick={generateAISurvey}
                  disabled={aiLoading || !aiPrompt.trim()}
                  className="bg-purple-600 hover:bg-purple-500 disabled:opacity-50 px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                  {aiLoading ? "🔄 Generating..." : "✨ Generate Survey"}
                </button>
                <button
                  onClick={() => setShowAIGenerator(false)}
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="flex h-[70vh]">
          {/* Sidebar - Sections */}
          <div className="w-80 border-r border-white/10 flex flex-col">
            <div className="p-4 border-b border-white/10">
              <h3 className="font-semibold text-white mb-3">Survey Sections</h3>
              <button
                onClick={addSection}
                className="w-full bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
              >
                ➕ Add Section
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {survey.sections.map((section, index) => (
                <div
                  key={section.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    activeSection === index
                      ? "bg-emerald-600/20 border-emerald-600/50"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
                  onClick={() => setActiveSection(index)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-white text-sm truncate">
                        {section.title}
                      </div>
                      <div className="text-xs text-white/60">
                        {section.questions.length} questions
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSection(index);
                      }}
                      className="text-red-400 hover:text-red-300 text-xs opacity-60 hover:opacity-100 ml-2"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Main Editor */}
          <div className="flex-1 flex flex-col">
            {/* Survey Basic Info */}
            <div className="p-6 border-b border-white/10 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Survey Title</label>
                  <input
                    type="text"
                    value={survey.title}
                    onChange={(e) => setSurvey(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                    placeholder="Enter survey title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white mb-2">Estimated Time</label>
                  <input
                    type="text"
                    value={survey.estimatedTime}
                    onChange={(e) => setSurvey(prev => ({ ...prev, estimatedTime: e.target.value }))}
                    className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                    placeholder="e.g., 5-10 minutes"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-white mb-2">Description</label>
                <textarea
                  value={survey.description}
                  onChange={(e) => setSurvey(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full h-20 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500 resize-none"
                  placeholder="Enter survey description..."
                />
              </div>
            </div>

            {/* Section Editor */}
            <div className="flex-1 overflow-y-auto p-6">
              {survey.sections[activeSection] && (
                <div className="space-y-6">
                  {/* Section Info */}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Section Title</label>
                      <input
                        type="text"
                        value={survey.sections[activeSection].title}
                        onChange={(e) => updateSection(activeSection, 'title', e.target.value)}
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-white mb-2">Section Description</label>
                      <input
                        type="text"
                        value={survey.sections[activeSection].description}
                        onChange={(e) => updateSection(activeSection, 'description', e.target.value)}
                        className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Questions */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-lg font-semibold text-white">Questions</h4>
                      <button
                        onClick={() => addQuestion(activeSection)}
                        className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg text-sm flex items-center gap-2 transition-all"
                      >
                        ➕ Add Question
                      </button>
                    </div>

                    {survey.sections[activeSection].questions.map((question, questionIndex) => (
                      <div key={question.id} className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-white/70">Question {questionIndex + 1}</div>
                          <button
                            onClick={() => removeQuestion(activeSection, questionIndex)}
                            className="text-red-400 hover:text-red-300 text-sm"
                          >
                            🗑️ Delete
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Question Type</label>
                            <select
                              value={question.type}
                              onChange={(e) => updateQuestion(activeSection, questionIndex, 'type', e.target.value)}
                              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                            >
                              {questionTypeOptions.map(option => (
                                <option key={option.value} value={option.value} className="bg-slate-800">
                                  {option.label}
                                </option>
                              ))}
                            </select>
                          </div>
                          <div className="flex items-center gap-4 pt-6">
                            <label className="flex items-center gap-2 text-sm text-white">
                              <input
                                type="checkbox"
                                checked={question.required}
                                onChange={(e) => updateQuestion(activeSection, questionIndex, 'required', e.target.checked)}
                                className="rounded"
                              />
                              Required
                            </label>
                          </div>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-sm font-medium text-white">Question Text</label>
                            <QuestionEnhancer
                              questionText={question.question}
                              questionType={question.type}
                              onEnhanced={(enhancedQuestion, suggestions) => {
                                updateQuestion(activeSection, questionIndex, 'question', enhancedQuestion);
                                if (suggestions && (question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'dropdown')) {
                                  updateQuestion(activeSection, questionIndex, 'options', suggestions);
                                }
                              }}
                            />
                          </div>
                          <input
                            type="text"
                            value={question.question}
                            onChange={(e) => updateQuestion(activeSection, questionIndex, 'question', e.target.value)}
                            className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                            placeholder="Enter your question..."
                          />
                        </div>

                        {/* Conditional fields based on question type */}
                        {(question.type === 'single_choice' || question.type === 'multiple_choice' || question.type === 'dropdown') && (
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Options (one per line)</label>
                            <textarea
                              value={question.options?.join('\n') || ''}
                              onChange={(e) => updateQuestion(activeSection, questionIndex, 'options', e.target.value.split('\n').filter(o => o.trim()))}
                              className="w-full h-24 bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500 resize-none"
                              placeholder="Option 1&#10;Option 2&#10;Option 3"
                            />
                          </div>
                        )}

                        {(question.type === 'text' || question.type === 'short_text') && (
                          <div>
                            <label className="block text-sm font-medium text-white mb-2">Placeholder Text</label>
                            <input
                              type="text"
                              value={question.placeholder || ''}
                              onChange={(e) => updateQuestion(activeSection, questionIndex, 'placeholder', e.target.value)}
                              className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/50 focus:outline-none focus:border-emerald-500"
                              placeholder="Enter placeholder text..."
                            />
                          </div>
                        )}

                        {(question.type === 'rating' || question.type === 'number') && (
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Minimum Value</label>
                              <input
                                type="number"
                                value={question.min || 1}
                                onChange={(e) => updateQuestion(activeSection, questionIndex, 'min', parseInt(e.target.value))}
                                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-white mb-2">Maximum Value</label>
                              <input
                                type="number"
                                value={question.max || 10}
                                onChange={(e) => updateQuestion(activeSection, questionIndex, 'max', parseInt(e.target.value))}
                                className="w-full bg-black/20 border border-white/20 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-emerald-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}

                    {survey.sections[activeSection].questions.length === 0 && (
                      <div className="text-center py-8 text-white/50">
                        <div className="text-4xl mb-2">📝</div>
                        <p>No questions in this section yet.</p>
                        <button
                          onClick={() => addQuestion(activeSection)}
                          className="mt-3 bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-lg text-sm transition-all"
                        >
                          ➕ Add First Question
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
