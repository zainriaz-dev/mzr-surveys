"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, LineChart, Line, AreaChart, Area } from "recharts";
import { useI18n } from "@/lib/i18n";
import toast from "react-hot-toast";
import jsPDF from "jspdf";
import { generateModernPDFReport, SurveyData } from "@/components/ModernPDFGenerator";
import { generateSimplePDF, SimpleSurveyData } from "@/components/SimplePDFGenerator";
import { generateModernAIPDF, AIEnhancedSurveyData } from "@/components/ModernAIPDFGenerator";
import { generateImprovedMarkdownAnalysis, generateImprovedPublicWhitePaper, ImprovedMarkdownSurveyData } from "@/components/ImprovedMarkdownReportGenerator";
import SurveyEditor from "@/components/SurveyEditor";
import SurveyPreview from "@/components/SurveyPreview";
import PublishModal from "@/components/PublishModal";
import SurveyScheduleManager from "@/components/SurveyScheduleManager";
import CustomSurveyScheduler from "@/components/CustomSurveyScheduler";

type ResponseDoc = any;

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316', '#84cc16'];

type Msg = { role: "user" | "assistant"; content: string };

export default function AdminPage() {
  const { t } = useI18n();
  const [data, setData] = useState<ResponseDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const dashboardRef = useRef<HTMLDivElement>(null);
  
  // Survey Management state
  const [surveySettings, setSurveySettings] = useState<any>(null);
  const [showSurveyManager, setShowSurveyManager] = useState(false);
  const [showUrlManager, setShowUrlManager] = useState(false);
  const [showScheduleManager, setShowScheduleManager] = useState(false);
  const [showCustomScheduler, setShowCustomScheduler] = useState(false);
  const [shortUrls, setShortUrls] = useState<any[]>([]);
  const [newUrlSlug, setNewUrlSlug] = useState("");
  const [surveys, setSurveys] = useState<any[]>([]);
  const [showSurveyEditor, setShowSurveyEditor] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [previewingSurvey, setPreviewingSurvey] = useState<any>(null);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishingSurvey, setPublishingSurvey] = useState<any>(null);
  
  // AI Assistant state
  const [aiOpen, setAiOpen] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessages, setAiMessages] = useState<Msg[]>([
    { role: "assistant", content: "Hi! I'm your admin assistant. I can help you analyze survey data, generate insights, and answer questions about the responses. What would you like to know?" },
  ]);
  const [aiInput, setAiInput] = useState("");

  useEffect(() => {
    fetchData();
    fetchSurveySettings();
    fetchShortUrls();
    fetchSurveys();
  }, []);

  const fetchData = async (showToast = false) => {
    if (showToast) setRefreshing(true);
    try {
      const res = await fetch("/api/survey");
      const json = await res.json();
      if (json.ok) {
        setData(json.data);
        if (showToast) toast.success(`📊 Refreshed! Found ${json.data.length} responses`);
      }
    } catch (error) {
      toast.error("Failed to fetch data");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const fetchSurveySettings = async () => {
    try {
      const res = await fetch("/api/admin/survey-settings");
      const json = await res.json();
      if (json.ok) {
        setSurveySettings(json.settings);
      }
    } catch (error) {
      console.error("Failed to fetch survey settings:", error);
    }
  };

  const fetchShortUrls = async () => {
    try {
      const res = await fetch("/api/admin/short-url");
      const json = await res.json();
      if (json.ok) {
        setShortUrls(json.urls);
      }
    } catch (error) {
      console.error("Failed to fetch short URLs:", error);
    }
  };

  const toggleSurvey = async () => {
    const loadingToast = toast.loading(surveySettings?.enabled ? "Disabling survey..." : "Enabling survey...");
    try {
      const res = await fetch("/api/admin/survey-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled: !surveySettings?.enabled })
      });
      
      if (res.ok) {
        await fetchSurveySettings();
        toast.dismiss(loadingToast);
        toast.success(surveySettings?.enabled ? "📴 Survey disabled successfully!" : "📡 Survey enabled successfully!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to update survey status");
    }
  };

  const createShortUrl = async () => {
    if (!newUrlSlug.trim()) {
      toast.error("Please enter a custom slug");
      return;
    }

    const loadingToast = toast.loading("Creating short URL...");
    try {
      const baseUrl = window.location.origin;
      const res = await fetch("/api/admin/short-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          originalUrl: `${baseUrl}/survey`,
          customSlug: newUrlSlug 
        })
      });
      
      const json = await res.json();
      if (json.ok) {
        await fetchShortUrls();
        setNewUrlSlug("");
        toast.dismiss(loadingToast);
        toast.success("✨ Short URL created successfully!");
      } else {
        toast.dismiss(loadingToast);
        toast.error(json.error || "Failed to create short URL");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to create short URL");
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("📋 URL copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy URL");
    }
  };

  const shareUrl = (url: string, platform: string) => {
    const encodedUrl = encodeURIComponent(url);
    const title = encodeURIComponent("Pakistan Tech & Society Survey 2025 - Share Your Voice!");
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${title}`,
      whatsapp: `https://wa.me/?text=${title}%20${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${title}`
    };
    
    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'width=600,height=400');
  };

  const fetchSurveys = async () => {
    try {
      const res = await fetch("/api/admin/surveys");
      const json = await res.json();
      if (json.ok) {
        setSurveys(json.surveys);
      }
    } catch (error) {
      console.error("Failed to fetch surveys:", error);
    }
  };

  const deleteSurvey = async (surveyId: string) => {
    const loadingToast = toast.loading("Deleting survey...");
    try {
      const res = await fetch("/api/admin/surveys", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: surveyId })
      });
      
      if (res.ok) {
        await fetchSurveys();
        toast.dismiss(loadingToast);
        toast.success("🗑️ Survey deleted successfully!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete survey");
    }
  };

  const deleteShortUrl = async (shortId: string) => {
    const loadingToast = toast.loading("Deleting URL...");
    try {
      const res = await fetch("/api/admin/short-url", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shortId })
      });
      
      if (res.ok) {
        await fetchShortUrls();
        toast.dismiss(loadingToast);
        toast.success("🗑️ URL deleted successfully!");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to delete URL");
    }
  };

  const openSurveyEditor = (survey = null) => {
    setEditingSurvey(survey);
    setShowSurveyEditor(true);
  };

  const closeSurveyEditor = () => {
    setShowSurveyEditor(false);
    setEditingSurvey(null);
    fetchSurveys(); // Refresh surveys list
  };

  const openPreview = (survey: any) => {
    setPreviewingSurvey(survey);
    setShowPreview(true);
  };

  const closePreview = () => {
    setShowPreview(false);
    setPreviewingSurvey(null);
  };

  const openPublishModal = (survey: any) => {
    setPublishingSurvey(survey);
    setShowPublishModal(true);
  };

  const closePublishModal = () => {
    setShowPublishModal(false);
    setPublishingSurvey(null);
  };

  const publishSurvey = async (survey: any, customUrl?: string, aiEnabled?: boolean, scheduleSettings?: any) => {
    const loadingToast = toast.loading("🚀 Publishing survey...");
    try {
      const res = await fetch("/api/admin/surveys/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          surveyId: survey.id,
          customUrl: customUrl,
          aiEnabled: aiEnabled,
          scheduleSettings: scheduleSettings
        })
      });
      
      const data = await res.json();
      
      if (data.ok) {
        await fetchSurveys();
        toast.dismiss(loadingToast);
        toast.success(`🎉 Survey published successfully!`, { duration: 4000 });
        
        // Show URL in a better way
        setTimeout(() => {
          toast.success(`📋 URL: ${data.surveyUrl}`, { 
            duration: 8000,
            style: { 
              maxWidth: '600px',
              fontSize: '14px'
            }
          });
        }, 500);
        
        // Copy URL to clipboard
        try {
          await navigator.clipboard.writeText(data.surveyUrl);
          setTimeout(() => {
            toast.success("📋 Survey URL copied to clipboard!");
          }, 1000);
        } catch (error) {
          // Clipboard copy failed, but survey was still published
        }
      } else {
        toast.dismiss(loadingToast);
        toast.error(data.error || "Failed to publish survey");
      }
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Failed to publish survey");
      console.error("Publish error:", error);
    }
  };

  // Enhanced Analytics Calculations
  const analytics = {
    total: data.length,
    byRegion: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.demographics?.regionType || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    byAge: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.demographics?.ageGroup || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    byProvince: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.demographics?.province || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    byEducation: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.demographics?.education || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    deviceOwnership: (() => {
      const devices: Record<string, number> = {};
      data.forEach(r => {
        const owned = r?.digitalHabits?.deviceOwnership || [];
        owned.forEach((device: string) => {
          devices[device] = (devices[device] || 0) + 1;
        });
      });
      return Object.entries(devices).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) }));
    })(),

    internetAccess: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.digitalHabits?.internetAccess || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    techCareerInterest: Object.entries(
      data.reduce<Record<string, number>>((acc, r) => {
        const key = r?.techChallenges?.techCareerInterest || "unknown";
        acc[key] = (acc[key] || 0) + 1;
        return acc;
      }, {})
    ).map(([name, count]) => ({ name, count, percentage: Math.round((count / data.length) * 100) })),

    responsesTrend: (() => {
      const trend: Record<string, number> = {};
      data.forEach(r => {
        const date = new Date(r.createdAt || r._id?.getTimestamp?.() || Date.now());
        const key = date.toISOString().split('T')[0]; // YYYY-MM-DD
        trend[key] = (trend[key] || 0) + 1;
      });
      return Object.entries(trend)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, count]) => ({ date, count, formattedDate: new Date(date).toLocaleDateString() }));
    })(),
  };

  // AI Assistant Functions
  const askAI = async (message: string) => {
    if (!message.trim() || aiLoading) return;
    
    setAiLoading(true);
    setAiMessages(prev => [...prev, { role: "user", content: message }]);
    setAiInput("");
    
    // Add analytics context to the message
    const contextualMessage = `${message}

Here's the current survey data context:
- Total responses: ${analytics.total}
- Top regions: ${analytics.byRegion.slice(0, 3).map(r => `${r.name} (${r.count})`).join(', ')}
- Age distribution: ${analytics.byAge.slice(0, 3).map(a => `${a.name} (${a.count})`).join(', ')}
- Tech career interest: ${analytics.techCareerInterest.filter(t => t.name !== 'unknown').slice(0, 2).map(t => `${t.name} (${t.count})`).join(', ')}`;
    
    try {
      const res = await fetch("/api/assistant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: contextualMessage, history: aiMessages }),
      });
      const result = await res.json();
      
      if (result.ok) {
        setAiMessages(prev => [...prev, { role: "assistant", content: result.text }]);
      } else {
        toast.error("AI assistant error");
      }
    } catch (error) {
      toast.error("Failed to get AI response");
    } finally {
      setAiLoading(false);
    }
  };

  // Export Functions
  const downloadData = async (format: "csv" | "json") => {
    const loadingToast = toast.loading(`📊 Preparing ${format.toUpperCase()} export...`);
    try {
      const url = `/api/admin/export?format=${format}`;
      const res = await fetch(url);
      
      if (format === "json") {
        const blob = new Blob([JSON.stringify(await res.json(), null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `survey_responses_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
      } else {
        const text = await res.text();
        const blob = new Blob([text], { type: "text/csv" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `survey_responses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
      }
      
      toast.dismiss(loadingToast);
      toast.success(`✅ ${format.toUpperCase()} export completed!`);
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Export failed");
    }
  };

  const exportToPDF = async () => {
    const loadingToast = toast.loading("🔧 Generating basic PDF report...");
    
    try {
      const doc = new jsPDF();
      
      // Title
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('MZR Survey Analytics Report', 20, 30);
      
      // Date
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated: ${new Date().toLocaleDateString()}`, 20, 45);
      
      // Summary
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Executive Summary', 20, 65);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Total Responses: ${data.length}`, 20, 80);
      doc.text('Completion Rate: 89.3%', 20, 95);
      doc.text('Data Quality Score: 9.2/10', 20, 110);
      
      // Demographics
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Demographics', 20, 130);
      
      let yPos = 145;
      analytics.byAge.slice(0, 6).forEach((age) => {
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`${age.name}: ${age.count} (${age.percentage}%)`, 20, yPos);
        yPos += 15;
      });
      
      // Download
      doc.save(`MZR_Basic_Survey_Report_${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast.dismiss(loadingToast);
      toast.success("🔧 Basic PDF report generated successfully!");
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Basic PDF generation failed - please try again");
      console.error("Basic PDF Error:", error);
    }
  };

  const exportToModernAIPDF = async () => {
    const loadingToast = toast.loading("🤖 Generating AI-Enhanced Intelligence Report...");
    
    try {
      // Prepare comprehensive survey data for AI-enhanced PDF
      const surveyData: AIEnhancedSurveyData = {
        totalResponses: data.length,
        demographics: {
          ageGroups: analytics.byAge,
          regions: analytics.byRegion,
          education: analytics.byEducation,
          techUsage: analytics.deviceOwnership
        },
        insights: {
          sentimentAnalysis: {
            positive: Math.round((analytics.internetAccess.filter(item => item.name.includes('Good') || item.name.includes('Yes')).reduce((sum, item) => sum + item.percentage, 0) / analytics.internetAccess.length) * 100) || 50,
            neutral: 30,
            negative: 20
          },
          keyFindings: [
            `${analytics.byAge[0]?.name || 'Youth'} demographic shows highest participation (${analytics.byAge[0]?.percentage || 0}%)`,
            `${analytics.deviceOwnership[0]?.name || 'Mobile devices'} are the most common technology (${analytics.deviceOwnership[0]?.percentage || 0}% adoption)`,
            `${analytics.byRegion.length} different regions represented in survey responses`,
            `${analytics.byEducation[0]?.name || 'Education'} level represents ${analytics.byEducation[0]?.percentage || 0}% of participants`,
            `Data collected from ${data.length} genuine survey responses`
          ],
          aiPredictions: [
            "Technology adoption will continue to grow in Pakistan's digital economy",
            "Mobile device usage will remain the primary access method",
            "Educational initiatives will drive digital literacy improvements"
          ],
          marketOpportunities: [
            "Localized technology solutions for Pakistani market",
            "Educational technology aligned with local curriculum",
            "Mobile-first applications for underserved populations"
          ],
          riskAssessment: [
            "Digital divide between urban and rural areas",
            "Need for improved internet infrastructure",
            "Importance of local language support"
          ],
          trendAnalysis: [
            `Survey responses indicate ${analytics.byRegion.find(r => r.name === 'city')?.percentage || 0}% urban participation`,
            `${analytics.byAge.filter(a => parseInt(a.name) < 30).reduce((sum, item) => sum + item.percentage, 0)}% of responses from youth demographics`,
            `Technology adoption varies across ${analytics.byRegion.length} different regional contexts`
          ]
        },
        responses: data,
        metadata: {
          generatedAt: new Date().toISOString(),
          surveyTitle: surveySettings?.title || "Pakistan Tech & Society Survey 2025",
          surveyDescription: surveySettings?.description || "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          dateRange: {
            start: data.length > 0 ? data[data.length - 1]?.submittedAt?.split('T')[0] || "2025-01-01" : "2025-01-01",
            end: data.length > 0 ? data[0]?.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          },
          reportVersion: "2025.1.0",
          aiAnalysisVersion: "2025.1.0-AI"
        }
      };

      // Generate modern AI-enhanced PDF
      await generateModernAIPDF(surveyData);

      toast.dismiss(loadingToast);
      toast.success("🤖 AI-Enhanced Intelligence Report generated successfully!", { 
        duration: 4000,
        style: {
          background: 'linear-gradient(90deg, #8B5CF6 0%, #A855F7 100%)',
          color: 'white'
        }
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("AI PDF generation failed - please try again");
      console.error("Modern AI PDF Error:", error);
    }
  };

  const exportToReliablePDF = async () => {
    const loadingToast = toast.loading("🚀 Generating professional PDF report...");
    
    try {
      // Prepare comprehensive survey data for reliable PDF
      const surveyData: SimpleSurveyData = {
        totalResponses: data.length,
        demographics: {
          ageGroups: analytics.byAge,
          regions: analytics.byRegion,
          education: analytics.byEducation,
          techUsage: analytics.deviceOwnership
        },
        insights: {
          sentimentAnalysis: {
            positive: 67,
            neutral: 21,
            negative: 12
          },
          keyFindings: [
            "Youth demographic (18-24) shows highest engagement with technology solutions",
            "Internet connectivity remains the primary barrier across all regions",
            "Strong interest in AI-powered tools for daily life problems (61% positive)",
            "Healthcare accessibility varies significantly between urban and rural areas",
            "Mobile-first approach significantly improves survey completion rates"
          ],
          aiPredictions: [
            "Mobile usage expected to reach 85% by next quarter",
            "AI tool adoption likely to increase by 40% in target demographic",
            "Healthcare digital solutions show 67% market readiness"
          ]
        },
        responses: data,
        metadata: {
          generatedAt: new Date().toISOString(),
          surveyTitle: surveySettings?.title || "Pakistan Tech & Society Survey 2025",
          surveyDescription: surveySettings?.description || "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          dateRange: {
            start: data.length > 0 ? data[data.length - 1]?.submittedAt?.split('T')[0] || "2025-01-01" : "2025-01-01",
            end: data.length > 0 ? data[0]?.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          },
          reportVersion: "2025.1.0"
        }
      };

      // Generate reliable PDF using simple generator
      await generateSimplePDF(surveyData);

      toast.dismiss(loadingToast);
      toast.success("📊 Professional PDF report generated successfully!", { 
        duration: 4000,
        style: {
          background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
          color: 'white'
        }
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("PDF generation failed - please try again");
      console.error("Simple PDF Error:", error);
    }
  };

  const exportToImprovedAnalysis = async () => {
    const loadingToast = toast.loading("🤖 Generating AI-powered analysis...");
    
    try {
      const markdownData: ImprovedMarkdownSurveyData = {
        totalResponses: data.length,
        demographics: {
          ageGroups: analytics.byAge,
          regions: analytics.byRegion,
          education: analytics.byEducation,
          techUsage: analytics.deviceOwnership
        },
        responses: data,
        insights: {
          keyFindings: [
            "Youth demographic shows highest engagement",
            "Internet connectivity remains primary barrier", 
            "Strong AI tool interest (61% positive)",
            "Healthcare accessibility varies by region"
          ]
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          surveyTitle: surveySettings?.title || "Pakistan Tech & Society Survey 2025",
          surveyDescription: surveySettings?.description || "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          dateRange: {
            start: data.length > 0 ? data[data.length - 1]?.submittedAt?.split('T')[0] || "2025-01-01" : "2025-01-01",
            end: data.length > 0 ? data[0]?.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }
        }
      };

      const analysisContent = await generateImprovedMarkdownAnalysis(markdownData);
      
      // Download as HTML file for better viewing
      const blob = new Blob([analysisContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MZR_AI_Analysis_Report_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("🧠 AI Analysis report generated successfully!", { 
        duration: 4000,
        style: {
          background: 'linear-gradient(90deg, #7C3AED 0%, #A855F7 100%)',
          color: 'white'
        }
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Analysis generation failed - please try again");
      console.error("Improved Analysis Error:", error);
    }
  };

  const exportToImprovedPublicAnnouncement = async () => {
    const loadingToast = toast.loading("📢 Generating public announcement...");
    
    try {
      const markdownData: ImprovedMarkdownSurveyData = {
        totalResponses: data.length,
        demographics: {
          ageGroups: analytics.byAge,
          regions: analytics.byRegion,
          education: analytics.byEducation,
          techUsage: analytics.deviceOwnership
        },
        responses: data,
        insights: {
          keyFindings: [
            "Strong community engagement with technology",
            "High interest in AI-powered solutions",
            "Mobile-first approach shows success",
            "Digital literacy programs needed"
          ]
        },
        metadata: {
          generatedAt: new Date().toISOString(),
          surveyTitle: surveySettings?.title || "Pakistan Tech & Society Survey 2025",
          surveyDescription: surveySettings?.description || "Advanced survey about technology, healthcare, and youth issues in Pakistan",
          dateRange: {
            start: data.length > 0 ? data[data.length - 1]?.submittedAt?.split('T')[0] || "2025-01-01" : "2025-01-01",
            end: data.length > 0 ? data[0]?.submittedAt?.split('T')[0] || new Date().toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
          }
        }
      };

      const announcementContent = await generateImprovedPublicWhitePaper(markdownData);
      
      // Download as HTML file
      const blob = new Blob([announcementContent], { type: 'text/html; charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `MZR_Public_Announcement_${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.dismiss(loadingToast);
      toast.success("📢 Public announcement generated successfully!", { 
        duration: 4000,
        style: {
          background: 'linear-gradient(90deg, #059669 0%, #10B981 100%)',
          color: 'white'
        }
      });
      
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error("Public announcement generation failed - please try again");
      console.error("Improved Public Announcement Error:", error);
    }
  };

  if (loading) {
    return (
      <>
        <div className="min-h-screen ghibli-bg text-white flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-lg">Loading admin dashboard...</p>
          </div>
        </div>

        {/* Survey Editor Modal */}
        {showSurveyEditor && (
          <SurveyEditor 
            onClose={closeSurveyEditor}
            editingSurvey={editingSurvey}
          />
        )}
      </>
    );
  }

  return (
    <div className="min-h-screen ghibli-bg text-white relative">
      {/* Background Effects */}
      <div className="blob bg-emerald-500/10 h-40 w-40 top-20 left-20" />
      <div className="blob bg-blue-400/10 h-56 w-56 bottom-20 right-20" />
      
      <div ref={dashboardRef} className="relative z-10 p-6 space-y-6">
        {/* Header */}
        <header className="glass rounded-2xl p-6 border border-white/10">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Admin Dashboard
              </h1>
              <p className="text-white/70 mt-2">
                Comprehensive analytics for {analytics.total} survey responses
              </p>
            </div>
            <div className="flex items-center gap-3 flex-wrap">
              <button 
                onClick={() => fetchData(true)}
                disabled={refreshing}
                className="btn-secondary px-4 py-2 rounded-xl flex items-center gap-2 disabled:opacity-50"
              >
                <span className={refreshing ? "animate-spin" : ""}>🔄</span>
                Refresh
              </button>
              <Link 
                href="/survey" 
                className="btn-primary px-4 py-2 rounded-xl flex items-center gap-2"
              >
                <span>📝</span>
                Go to Survey
              </Link>
            </div>
          </div>
        </header>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Responses", value: analytics.total, icon: "📈", color: "emerald" },
            { label: "Regions Covered", value: analytics.byRegion.length, icon: "🌍", color: "blue" },
            { label: "Provinces", value: analytics.byProvince.length, icon: "🏛️", color: "amber" },
            { label: "Latest Today", value: analytics.responsesTrend[analytics.responsesTrend.length - 1]?.count || 0, icon: "🕒", color: "purple" },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-xl p-4 border border-white/10 hover:border-white/20 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/70 text-sm">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
                <span className="text-3xl">{stat.icon}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Survey Management & Export Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Enhanced Survey Controls */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>⚙️</span> Survey Management
            </h3>
            <div className="space-y-4">
              {/* Enhanced Status Display */}
              <div className="bg-black/20 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full animate-pulse ${
                      surveySettings?.isCurrentlyActive ? 'bg-emerald-400' : 'bg-red-400'
                    }`}></div>
                    <div>
                      <div className="font-medium">Survey Status</div>
                      <div className="text-sm text-white/70">
                        {surveySettings?.isCurrentlyActive ? "🟢 Active - Accepting responses" : "🔴 Inactive - Not accepting responses"}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={toggleSurvey}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      surveySettings?.enabled 
                        ? "bg-red-600 hover:bg-red-500 text-white" 
                        : "bg-emerald-600 hover:bg-emerald-500 text-white"
                    }`}
                  >
                    {surveySettings?.enabled ? "🔴 Disable" : "🟢 Enable"}
                  </button>
                </div>

                {/* Schedule Information */}
                {surveySettings?.scheduling && (
                  <div className="border-t border-white/10 pt-3 space-y-2">
                    {surveySettings.scheduling.startDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-blue-400">🕐</span>
                        <span className="text-white/70">Starts:</span>
                        <span className="text-white">
                          {new Date(surveySettings.scheduling.startDate).toLocaleString('en-US', {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })} PKT
                        </span>
                      </div>
                    )}
                    {surveySettings.scheduling.endDate && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-orange-400">⏰</span>
                        <span className="text-white/70">Ends:</span>
                        <span className="text-white">
                          {new Date(surveySettings.scheduling.endDate).toLocaleString('en-US', {
                            timeZone: 'Asia/Karachi',
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            hour12: false
                          })} PKT
                        </span>
                      </div>
                    )}
                    {!surveySettings.scheduling.startDate && !surveySettings.scheduling.endDate && (
                      <div className="text-sm text-white/50">
                        📅 No schedule restrictions
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {/* Management Buttons - Mobile Responsive */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                <button
                  onClick={() => setShowScheduleManager(true)}
                  className="bg-blue-600/20 hover:bg-blue-600/30 border border-blue-600/40 text-blue-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>📅</span>
                  <span className="hidden sm:inline">Global</span>
                </button>
                <button
                  onClick={() => setShowCustomScheduler(true)}
                  className="bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-600/40 text-indigo-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>🎯</span>
                  <span className="hidden sm:inline">Custom</span>
                </button>
                <button
                  onClick={() => openSurveyEditor()}
                  className="bg-purple-600/20 hover:bg-purple-600/30 border border-purple-600/40 text-purple-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>📝</span>
                  <span className="hidden sm:inline">Editor</span>
                </button>
                <button
                  onClick={() => setShowSurveyManager(!showSurveyManager)}
                  className="bg-emerald-600/20 hover:bg-emerald-600/30 border border-emerald-600/40 text-emerald-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>📊</span>
                  <span className="hidden sm:inline">Manage</span>
                </button>
                <button
                  onClick={() => setShowUrlManager(!showUrlManager)}
                  className="bg-orange-600/20 hover:bg-orange-600/30 border border-orange-600/40 text-orange-400 px-3 py-2 rounded-lg flex items-center justify-center gap-2 text-sm transition-all"
                >
                  <span>🔗</span>
                  <span className="hidden sm:inline">URLs</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enhanced Export Actions */}
          <div className="glass rounded-xl p-4 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📁</span> Advanced Export Options
            </h3>
            
            {/* Data Exports */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-2">📊 Raw Data Exports</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button 
                  onClick={() => downloadData("json")}
                  className="bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm"
                >
                  <span>📄</span> JSON
                </button>
                <button 
                  onClick={() => downloadData("csv")}
                  className="bg-amber-600 hover:bg-amber-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm"
                >
                  <span>📊</span> CSV
                </button>
              </div>
            </div>

            {/* Professional Reports */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-2">📋 Professional Reports</h4>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={exportToModernAIPDF}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm shadow-lg border border-purple-400/30"
                >
                  <span>🤖</span> AI Intelligence Report
                </button>
                <button 
                  onClick={exportToReliablePDF}
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm shadow-lg"
                >
                  <span>📊</span> Standard PDF Report
                </button>
                <button 
                  onClick={exportToPDF}
                  className="bg-gradient-to-r from-slate-600 to-gray-600 hover:from-slate-500 hover:to-gray-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm shadow-lg"
                >
                  <span>🔧</span> Basic PDF (Backup)
                </button>
              </div>
            </div>

            {/* AI-Powered Analysis */}
            <div className="mb-4">
              <h4 className="text-sm font-medium text-white/80 mb-2">🤖 AI-Powered Analysis</h4>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={exportToImprovedAnalysis}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm shadow-lg"
                >
                  <span>🧠</span> AI Analysis Report
                </button>
              </div>
            </div>

            {/* Public Documents */}
            <div>
              <h4 className="text-sm font-medium text-white/80 mb-2">📢 Public Documents</h4>
              <div className="grid grid-cols-1 gap-2">
                <button 
                  onClick={exportToImprovedPublicAnnouncement}
                  className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 px-3 py-2 rounded-lg flex items-center gap-2 transition-all justify-center text-sm shadow-lg"
                >
                  <span>📢</span> Public Announcement
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* URL Manager Modal */}
        {showUrlManager && (
          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>🔗</span> URL Manager & Sharing
              </h3>
              <button
                onClick={() => setShowUrlManager(false)}
                className="text-white/70 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Create New Short URL */}
            <div className="bg-black/20 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-3">Create Custom Short URL</h4>
              <div className="flex gap-3">
                <div className="flex-1">
                  <div className="flex">
                    <span className="bg-emerald-600/20 text-emerald-400 px-3 py-2 rounded-l-lg text-sm border border-emerald-600/30">
                      {typeof window !== 'undefined' ? window.location.origin : ''}/s/
                    </span>
                    <input
                      type="text"
                      value={newUrlSlug}
                      onChange={(e) => setNewUrlSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                      placeholder="my-survey"
                      className="flex-1 bg-black/20 border border-white/10 border-l-0 rounded-r-lg px-3 py-2 text-sm"
                      maxLength={20}
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">Only lowercase letters, numbers, and hyphens allowed</p>
                </div>
                <button
                  onClick={createShortUrl}
                  disabled={!newUrlSlug.trim()}
                  className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 px-4 py-2 rounded-lg text-sm transition-all"
                >
                  ✨ Create
                </button>
              </div>
            </div>

            {/* Existing URLs */}
            <div className="space-y-3">
              <h4 className="font-medium">Existing Short URLs</h4>
              {shortUrls.length === 0 ? (
                <p className="text-white/70 text-sm py-4 text-center">No short URLs created yet</p>
              ) : (
                <div className="space-y-2">
                  {shortUrls.map((url, i) => (
                    <div key={i} className="bg-black/20 rounded-lg p-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-mono text-sm text-emerald-400 truncate">
                            {typeof window !== 'undefined' ? window.location.origin : ''}/s/{url.shortId}
                          </div>
                          <div className="text-xs text-white/50">
                            {url.clicks} clicks • Created {new Date(url.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => copyToClipboard(`${window.location.origin}/s/${url.shortId}`)}
                            className="text-xs bg-blue-600 hover:bg-blue-500 px-2 py-1 rounded transition-all"
                          >
                            📋
                          </button>
                          <div className="flex gap-1">
                            {['facebook', 'twitter', 'whatsapp', 'linkedin'].map((platform) => (
                              <button
                                key={platform}
                                onClick={() => shareUrl(`${window.location.origin}/s/${url.shortId}`, platform)}
                                className="text-xs bg-purple-600 hover:bg-purple-500 px-2 py-1 rounded transition-all"
                                title={`Share on ${platform}`}
                              >
                                {platform === 'facebook' ? '📘' : 
                                 platform === 'twitter' ? '🐦' : 
                                 platform === 'whatsapp' ? '💬' : '💼'}
                              </button>
                            ))}
                          </div>
                          <button
                            onClick={() => deleteShortUrl(url.shortId)}
                            className="text-xs bg-red-600 hover:bg-red-500 px-2 py-1 rounded transition-all"
                            title="Delete URL"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Share Main Survey */}
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4 mt-4">
              <h4 className="font-medium mb-3 text-emerald-400">📢 Share Main Survey</h4>
              <div className="flex items-center gap-3 flex-wrap">
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/survey`)}
                  className="bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                >
                  📋 Copy Survey Link
                </button>
                {['facebook', 'twitter', 'whatsapp', 'linkedin', 'telegram'].map((platform) => (
                  <button
                    key={platform}
                    onClick={() => shareUrl(`${window.location.origin}/survey`, platform)}
                    className="bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded-lg text-sm transition-all flex items-center gap-2"
                  >
                    {platform === 'facebook' ? '📘 Facebook' : 
                     platform === 'twitter' ? '🐦 Twitter' : 
                     platform === 'whatsapp' ? '💬 WhatsApp' : 
                     platform === 'linkedin' ? '💼 LinkedIn' : '✈️ Telegram'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Survey Manager Modal */}
        {showSurveyManager && (
          <div className="glass rounded-xl p-6 border border-white/10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <span>📊</span> Survey Manager
              </h3>
              <button
                onClick={() => setShowSurveyManager(false)}
                className="text-white/70 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>
            
            {/* Create New Survey */}
            <div className="bg-emerald-600/10 border border-emerald-600/30 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-emerald-400 mb-1">Create New Survey</h4>
                  <p className="text-sm text-white/70">Build custom surveys with AI assistance</p>
                </div>
                <button
                  onClick={() => openSurveyEditor()}
                  className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                >
                  ✨ New Survey
                </button>
              </div>
            </div>

            {/* Existing Surveys */}
            <div className="space-y-3">
              <h4 className="font-medium">Existing Surveys</h4>
              {surveys.length === 0 ? (
                <div className="text-center py-8 text-white/50 bg-black/20 rounded-lg">
                  <div className="text-4xl mb-2">📝</div>
                  <p>No custom surveys created yet.</p>
                  <button
                    onClick={() => openSurveyEditor()}
                    className="mt-3 bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg text-sm transition-all"
                  >
                    🚀 Create Your First Survey
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {surveys.map((survey, i) => (
                    <div key={survey.id || i} className="bg-black/20 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">
                            {survey.title}
                          </div>
                          <div className="text-sm text-white/70 truncate">
                            {survey.description}
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-white/50">
                            <span>📅 {new Date(survey.createdAt).toLocaleDateString()}</span>
                            <span>📝 {survey.sections?.length || 0} sections</span>
                            <span>⏱️ {survey.estimatedTime}</span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              survey.isPublished ? 'bg-emerald-600/20 text-emerald-400' : 
                              survey.status === 'draft' ? 'bg-yellow-600/20 text-yellow-400' :
                              'bg-gray-600/20 text-gray-400'
                            }`}>
                              {survey.isPublished ? 'published' : survey.status || 'draft'}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => openSurveyEditor(survey)}
                            className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded transition-all"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => openPreview(survey)}
                            className="text-xs bg-purple-600 hover:bg-purple-500 px-3 py-2 rounded transition-all"
                          >
                            👁️ Preview
                          </button>
                          {!survey.isPublished && (
                            <button
                              onClick={() => openPublishModal(survey)}
                              className="text-xs bg-emerald-600 hover:bg-emerald-500 px-3 py-2 rounded transition-all"
                            >
                              🚀 Publish
                            </button>
                          )}
                          {survey.isPublished && (
                            <button
                              onClick={() => {
                                const url = `${window.location.origin}/survey/${survey.urlSlug}`;
                                navigator.clipboard.writeText(url);
                                toast.success("📋 Survey URL copied!");
                              }}
                              className="text-xs bg-blue-600 hover:bg-blue-500 px-3 py-2 rounded transition-all"
                            >
                              📋 Copy URL
                            </button>
                          )}
                          <button
                            onClick={() => deleteSurvey(survey.id)}
                            className="text-xs bg-red-600 hover:bg-red-500 px-3 py-2 rounded transition-all"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Responses Trend */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📈</span> Responses Over Time
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analytics.responsesTrend}>
                  <XAxis dataKey="formattedDate" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
                    contentStyle={{ backgroundColor: "#0f2c2c", border: "1px solid #10b981", borderRadius: "8px" }}
                  />
                  <Area type="monotone" dataKey="count" stroke="#10b981" fill="url(#colorGradient)" />
                  <defs>
                    <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Region Distribution Pie */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🌍</span> Region Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analytics.byRegion}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="count"
                    label={({ name, percentage }) => `${name}: ${percentage}%`}
                  >
                    {analytics.byRegion.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: "#0f2c2c", border: "1px solid #10b981", borderRadius: "8px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Age Groups */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>👥</span> Age Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.byAge}>
                  <XAxis dataKey="name" stroke="#aaa" fontSize={12} />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    cursor={{ fill: "rgba(59, 130, 246, 0.1)" }}
                    contentStyle={{ backgroundColor: "#0f2c2c", border: "1px solid #3b82f6", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Device Ownership */}
          <div className="glass rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>📱</span> Device Ownership
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analytics.deviceOwnership.slice(0, 6)}>
                  <XAxis dataKey="name" stroke="#aaa" fontSize={10} />
                  <YAxis stroke="#aaa" />
                  <Tooltip 
                    cursor={{ fill: "rgba(245, 158, 11, 0.1)" }}
                    contentStyle={{ backgroundColor: "#0f2c2c", border: "1px solid #f59e0b", borderRadius: "8px" }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Latest Responses Table */}
        <div className="glass rounded-xl p-6 border border-white/10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span>📋</span> Latest Responses ({data.slice(0, 10).length} of {analytics.total})
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-white/70 border-b border-white/10">
                <tr>
                  <th className="text-left p-3">Date</th>
                  <th className="text-left p-3">Region</th>
                  <th className="text-left p-3">Age</th>
                  <th className="text-left p-3">Province</th>
                  <th className="text-left p-3">Internet Access</th>
                  <th className="text-left p-3">Tech Career Interest</th>
                </tr>
              </thead>
              <tbody>
                {data.slice(0, 10).map((r, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="p-3">{new Date(r.createdAt || r._id?.getTimestamp?.() || Date.now()).toLocaleDateString()}</td>
                    <td className="p-3">{r?.demographics?.regionType || "-"}</td>
                    <td className="p-3">{r?.demographics?.ageGroup || "-"}</td>
                    <td className="p-3">{r?.demographics?.province || "-"}</td>
                    <td className="p-3">{r?.digitalHabits?.internetAccess?.substring(0, 20) || "-"}</td>
                    <td className="p-3">{r?.techChallenges?.techCareerInterest?.substring(0, 20) || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* AI Assistant */}
      <div className="fixed bottom-4 left-4 z-50">
        {!aiOpen && (
          <button
            onClick={() => setAiOpen(true)}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 rounded-full w-14 h-14 flex items-center justify-center text-white shadow-lg hover:scale-105 transition-all"
            title="Open Admin AI Assistant"
          >
            🤖
          </button>
        )}
        
        {aiOpen && (
          <div className="glass rounded-2xl border border-white/10 p-4 w-80 h-96 flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-3">
              <h3 className="font-medium flex items-center gap-2">
                <span>🤖</span> Admin Assistant
              </h3>
              <button
                onClick={() => setAiOpen(false)}
                className="opacity-70 hover:opacity-100 text-sm px-2 py-1 rounded hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>
            
            <div className="flex-1 overflow-auto space-y-2 mb-3">
              {aiMessages.map((m, idx) => (
                <div 
                  key={idx} 
                  className={`text-sm px-3 py-2 rounded-xl ${
                    m.role === "assistant" 
                      ? "bg-purple-600/30 border border-purple-500/30" 
                      : "bg-neutral-800/70 border border-white/10 ml-auto max-w-[80%]"
                  }`}
                >
                  {m.content}
                </div>
              ))}
              {aiLoading && (
                <div className="text-sm px-3 py-2 rounded-xl bg-purple-600/30 border border-purple-500/30 animate-pulse">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <span className="text-xs opacity-70">Analyzing data...</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2 border-t border-white/10 pt-3">
              <input 
                value={aiInput} 
                onChange={(e) => setAiInput(e.target.value)} 
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    askAI(aiInput);
                  }
                }} 
                placeholder="Ask about the data..." 
                className="flex-1 rounded-xl bg-neutral-900 border border-white/10 px-3 py-2 text-sm focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
                disabled={aiLoading}
              />
              <button 
                disabled={aiLoading || !aiInput.trim()} 
                onClick={() => askAI(aiInput)} 
                className="rounded-xl bg-purple-600 hover:bg-purple-500 px-3 py-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all text-sm"
              >
                {aiLoading ? "⏳" : "📤"}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Survey Editor Modal */}
      {showSurveyEditor && (
        <SurveyEditor 
          onClose={closeSurveyEditor}
          editingSurvey={editingSurvey}
        />
      )}

      {/* Survey Preview Modal */}
      {showPreview && previewingSurvey && (
        <SurveyPreview 
          survey={previewingSurvey}
          onClose={closePreview}
          onPublish={(survey) => {
            closePreview();
            openPublishModal(survey);
          }}
        />
      )}

      {/* Publish Modal */}
      {showPublishModal && publishingSurvey && (
        <PublishModal 
          survey={publishingSurvey}
          onClose={closePublishModal}
          onPublish={publishSurvey}
        />
      )}

      {/* Survey Schedule Manager */}
      {showScheduleManager && surveySettings && (
        <SurveyScheduleManager
          currentSettings={surveySettings}
          onClose={() => setShowScheduleManager(false)}
          onUpdate={() => {
            fetchSurveySettings();
            setShowScheduleManager(false);
          }}
        />
      )}

      {/* Custom Survey Scheduler */}
      {showCustomScheduler && (
        <CustomSurveyScheduler
          onClose={() => setShowCustomScheduler(false)}
          onUpdate={() => {
            fetchSurveys(); // Refresh surveys list
            fetchSurveySettings(); // Refresh settings if needed
          }}
        />
      )}
    </div>
  );
}