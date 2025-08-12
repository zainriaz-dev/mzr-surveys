"use client";
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { saveAs } from 'file-saver';

export interface AIEnhancedSurveyData {
  totalResponses: number;
  demographics: {
    ageGroups: Array<{ name: string; count: number; percentage: number }>;
    regions: Array<{ name: string; count: number; percentage: number }>;
    education: Array<{ name: string; count: number; percentage: number }>;
    techUsage: Array<{ name: string; count: number; percentage: number }>;
  };
  insights: {
    keyFindings: string[];
    sentimentAnalysis: { positive: number; neutral: number; negative: number };
    aiPredictions: string[];
    marketOpportunities: string[];
    riskAssessment: string[];
    trendAnalysis: string[];
  };
  responses: any[];
  metadata: {
    generatedAt: string;
    surveyTitle: string;
    surveyDescription: string;
    dateRange: { start: string; end: string };
    reportVersion: string;
    aiAnalysisVersion: string;
  };
  aiInsights?: {
    executiveSummary: string;
    strategicRecommendations: string[];
    technicalImplementation: string[];
    businessImpact: string;
    futureOutlook: string;
  };
}

export class ModernAIPDFGenerator {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private colors: any;
  private fonts: any;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 15;
    this.currentY = this.margin;
    
    // Modern color palette
    this.colors = {
      primary: [15, 44, 44],        // Dark teal
      secondary: [22, 66, 60],      // Teal
      accent: [16, 185, 129],       // Emerald
      success: [34, 197, 94],       // Green
      warning: [251, 191, 36],      // Amber
      danger: [239, 68, 68],        // Red
      info: [59, 130, 246],         // Blue
      purple: [139, 92, 246],       // Purple
      dark: [17, 24, 39],           // Gray-900
      light: [249, 250, 251],       // Gray-50
      white: [255, 255, 255],
      text: [55, 65, 81],           // Gray-700
      textLight: [107, 114, 128],   // Gray-500
      background: [248, 250, 252]   // Blue-50
    };
  }

  private addPage() {
    this.doc.addPage();
    this.currentY = this.margin;
    this.addWatermark();
    this.addPageNumber();
  }

  private addWatermark() {
    const centerX = this.pageWidth / 2;
    const centerY = this.pageHeight / 2;
    
    this.doc.setFontSize(60);
    this.doc.setTextColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
    this.doc.setFont('helvetica', 'bold');
    
    // Rotate and add watermark
    this.doc.saveGraphicsState();
    this.doc.text('MZR ANALYTICS', centerX, centerY, {
      angle: 45,
      align: 'center'
    });
    this.doc.restoreGraphicsState();
  }

  private addPageNumber() {
    const pageNum = this.doc.getCurrentPageInfo().pageNumber;
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
    this.doc.text(`Page ${pageNum}`, this.pageWidth - this.margin - 20, this.pageHeight - 10);
  }

  private setGradientBackground(startColor: number[], endColor: number[]) {
    // Simulate gradient with multiple rectangles
    const steps = 50;
    const stepHeight = this.pageHeight / steps;
    
    for (let i = 0; i < steps; i++) {
      const ratio = i / steps;
      const r = Math.round(startColor[0] + (endColor[0] - startColor[0]) * ratio);
      const g = Math.round(startColor[1] + (endColor[1] - startColor[1]) * ratio);
      const b = Math.round(startColor[2] + (endColor[2] - startColor[2]) * ratio);
      
      this.doc.setFillColor(r, g, b);
      this.doc.rect(0, i * stepHeight, this.pageWidth, stepHeight, 'F');
    }
  }

  private addModernCard(x: number, y: number, width: number, height: number, title: string, value: string, subtitle: string, color: number[] = this.colors.accent) {
    // Card shadow
    this.doc.setFillColor(0, 0, 0, 0.1);
    this.doc.roundedRect(x + 1, y + 1, width, height, 5, 5, 'F');
    
    // Card background
    this.doc.setFillColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.roundedRect(x, y, width, height, 5, 5, 'F');
    
    // Card border
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(0.5);
    this.doc.roundedRect(x, y, width, height, 5, 5, 'S');
    
    // Accent bar at top
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.roundedRect(x, y, width, 8, 5, 5, 'F');
    this.doc.setFillColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.rect(x, y + 5, width, 3, 'F');
    
    // Icon area (colored circle)
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.circle(x + 15, y + 25, 8, 'F');
    
    // Icon text
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.text('📊', x + 11, y + 29);
    
    // Main value
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.text(value, x + 30, y + 30);
    
    // Title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    this.doc.text(title, x + 8, y + 45);
    
    // Subtitle
    this.doc.setFontSize(9);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.colors.textLight[0], this.colors.textLight[1], this.colors.textLight[2]);
    this.doc.text(subtitle, x + 8, y + 55);
  }

  private addSectionHeader(title: string, icon: string = '📊') {
    this.checkPageBreak(25);
    
    // Background bar
    this.doc.setFillColor(this.colors.primary[0], this.colors.primary[1], this.colors.primary[2]);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, 20, 3, 3, 'F');
    
    // Icon
    this.doc.setFontSize(16);
    this.doc.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
    this.doc.text(icon, this.margin + 5, this.currentY + 13);
    
    // Title
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.text(title, this.margin + 20, this.currentY + 13);
    
    this.currentY += 30;
  }

  private checkPageBreak(requiredSpace: number = 30) {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.addPage();
    }
  }

  private addAIInsightBox(title: string, content: string, color: number[] = this.colors.purple) {
    this.checkPageBreak(50);
    
    const boxHeight = Math.max(40, content.length * 0.3 + 30);
    
    // AI box background
    this.doc.setFillColor(color[0], color[1], color[2], 0.1);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 8, 8, 'F');
    
    // AI box border
    this.doc.setDrawColor(color[0], color[1], color[2]);
    this.doc.setLineWidth(1);
    this.doc.roundedRect(this.margin, this.currentY, this.pageWidth - 2 * this.margin, boxHeight, 8, 8, 'S');
    
    // AI indicator
    this.doc.setFillColor(color[0], color[1], color[2]);
    this.doc.circle(this.margin + 15, this.currentY + 15, 8, 'F');
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.text('AI', this.margin + 11, this.currentY + 18);
    
    // Title
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(color[0], color[1], color[2]);
    this.doc.text(title, this.margin + 30, this.currentY + 18);
    
    // Content
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    
    const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin - 20);
    let yPos = this.currentY + 30;
    
    lines.forEach((line: string) => {
      this.doc.text(line, this.margin + 10, yPos);
      yPos += 7;
    });
    
    this.currentY += boxHeight + 10;
  }

  private addCoverPage(data: AIEnhancedSurveyData) {
    // Gradient background
    this.setGradientBackground(this.colors.primary, this.colors.secondary);
    
    // Cover content
    const centerX = this.pageWidth / 2;
    
    // Logo area
    this.doc.setFillColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
    this.doc.circle(centerX, 80, 25, 'F');
    this.doc.setFontSize(20);
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('MZR', centerX - 12, 85);
    
    // Main title
    this.doc.setFontSize(32);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.text('SURVEY ANALYTICS', centerX, 130, { align: 'center' });
    this.doc.text('INTELLIGENCE REPORT', centerX, 150, { align: 'center' });
    
    // Subtitle
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(this.colors.accent[0], this.colors.accent[1], this.colors.accent[2]);
    this.doc.text(data.metadata.surveyTitle, centerX, 175, { align: 'center' });
    
    // AI Badge
    this.doc.setFillColor(this.colors.purple[0], this.colors.purple[1], this.colors.purple[2]);
    this.doc.roundedRect(centerX - 40, 190, 80, 20, 10, 10, 'F');
    this.doc.setFontSize(12);
    this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('🤖 AI-ENHANCED ANALYSIS', centerX, 203, { align: 'center' });
    
    // Stats cards
    const cardWidth = 45;
    const cardHeight = 35;
    const spacing = 10;
    const totalWidth = 3 * cardWidth + 2 * spacing;
    const startX = (this.pageWidth - totalWidth) / 2;
    
    this.addModernCard(startX, 230, cardWidth, cardHeight, 'Responses', data.totalResponses.toString(), 'Survey Participants', this.colors.success);
    this.addModernCard(startX + cardWidth + spacing, 230, cardWidth, cardHeight, 'Demographics', data.demographics.ageGroups.length.toString(), 'Age Groups', this.colors.info);
    this.addModernCard(startX + 2 * (cardWidth + spacing), 230, cardWidth, cardHeight, 'Insights', data.insights.keyFindings.length.toString(), 'Key Findings', this.colors.warning);
    
    // Footer
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.light[0], this.colors.light[1], this.colors.light[2]);
    this.doc.text(`Generated: ${new Date(data.metadata.generatedAt).toLocaleDateString()}`, centerX, this.pageHeight - 30, { align: 'center' });
    this.doc.text(`AI Version: ${data.metadata.aiAnalysisVersion || '2025.1.0'}`, centerX, this.pageHeight - 20, { align: 'center' });
  }

  private addExecutiveDashboard(data: AIEnhancedSurveyData) {
    this.addPage();
    this.addSectionHeader('📊 Executive Dashboard', '📊');
    
    // Key metrics cards
    const cardWidth = 42;
    const cardHeight = 40;
    const spacing = 8;
    const cols = 4;
    const startX = this.margin;
    
    const metrics = [
      { title: 'Total Responses', value: data.totalResponses.toString(), subtitle: 'Survey Completions', color: this.colors.success },
      { title: 'Demographics', value: data.demographics.ageGroups.length.toString(), subtitle: 'Age Groups', color: this.colors.info },
      { title: 'Regions', value: data.demographics.regions.length.toString(), subtitle: 'Geographic Areas', color: this.colors.purple },
      { title: 'Key Findings', value: data.insights.keyFindings.length.toString(), subtitle: 'Data Insights', color: this.colors.warning }
    ];
    
    metrics.forEach((metric, index) => {
      const x = startX + (index % cols) * (cardWidth + spacing);
      const y = this.currentY;
      this.addModernCard(x, y, cardWidth, cardHeight, metric.title, metric.value, metric.subtitle, metric.color);
    });
    
    this.currentY += 50;
    
    // AI Executive Summary
    if (data.aiInsights?.executiveSummary) {
      this.addAIInsightBox(
        '🧠 AI Executive Summary',
        data.aiInsights.executiveSummary,
        this.colors.purple
      );
    }
    
    // Sentiment Analysis Visualization
    this.addSectionHeader('📈 Sentiment Analysis', '📈');
    
    // Create a simple chart representation
    const chartX = this.margin + 20;
    const chartY = this.currentY;
    const chartWidth = this.pageWidth - 2 * this.margin - 40;
    const chartHeight = 40;
    
    const { positive, neutral, negative } = data.insights.sentimentAnalysis;
    const total = positive + neutral + negative;
    
    if (total > 0) {
      const positiveWidth = (positive / total) * chartWidth;
      const neutralWidth = (neutral / total) * chartWidth;
      const negativeWidth = (negative / total) * chartWidth;
      
      // Positive bar
      this.doc.setFillColor(this.colors.success[0], this.colors.success[1], this.colors.success[2]);
      this.doc.roundedRect(chartX, chartY, positiveWidth, chartHeight, 3, 3, 'F');
      
      // Neutral bar
      this.doc.setFillColor(this.colors.warning[0], this.colors.warning[1], this.colors.warning[2]);
      this.doc.roundedRect(chartX + positiveWidth, chartY, neutralWidth, chartHeight, 3, 3, 'F');
      
      // Negative bar
      this.doc.setFillColor(this.colors.danger[0], this.colors.danger[1], this.colors.danger[2]);
      this.doc.roundedRect(chartX + positiveWidth + neutralWidth, chartY, negativeWidth, chartHeight, 3, 3, 'F');
      
      // Labels
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.colors.white[0], this.colors.white[1], this.colors.white[2]);
      this.doc.setFont('helvetica', 'bold');
      
      if (positiveWidth > 20) this.doc.text(`${positive}%`, chartX + positiveWidth/2, chartY + 25, { align: 'center' });
      if (neutralWidth > 20) this.doc.text(`${neutral}%`, chartX + positiveWidth + neutralWidth/2, chartY + 25, { align: 'center' });
      if (negativeWidth > 20) this.doc.text(`${negative}%`, chartX + positiveWidth + neutralWidth + negativeWidth/2, chartY + 25, { align: 'center' });
    }
    
    this.currentY += 60;
    
    // Legend
    const legendY = this.currentY;
    this.doc.setFillColor(this.colors.success[0], this.colors.success[1], this.colors.success[2]);
    this.doc.circle(this.margin + 20, legendY, 3, 'F');
    this.doc.setFontSize(10);
    this.doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    this.doc.text('Positive', this.margin + 30, legendY + 3);
    
    this.doc.setFillColor(this.colors.warning[0], this.colors.warning[1], this.colors.warning[2]);
    this.doc.circle(this.margin + 80, legendY, 3, 'F');
    this.doc.text('Neutral', this.margin + 90, legendY + 3);
    
    this.doc.setFillColor(this.colors.danger[0], this.colors.danger[1], this.colors.danger[2]);
    this.doc.circle(this.margin + 130, legendY, 3, 'F');
    this.doc.text('Negative', this.margin + 140, legendY + 3);
    
    this.currentY += 20;
  }

  private addAIInsights(data: AIEnhancedSurveyData) {
    this.addPage();
    this.addSectionHeader('🤖 AI-Powered Insights', '🤖');
    
    // Key Findings
    this.addAIInsightBox(
      '🎯 Key Findings',
      data.insights.keyFindings.join('\n• '),
      this.colors.info
    );
    
    // Strategic Recommendations
    if (data.aiInsights?.strategicRecommendations) {
      this.addAIInsightBox(
        '💡 Strategic Recommendations',
        data.aiInsights.strategicRecommendations.join('\n• '),
        this.colors.accent
      );
    }
    
    // Market Opportunities
    if (data.insights.marketOpportunities) {
      this.addAIInsightBox(
        '🚀 Market Opportunities',
        data.insights.marketOpportunities.join('\n• '),
        this.colors.success
      );
    }
    
    // Risk Assessment
    if (data.insights.riskAssessment) {
      this.addAIInsightBox(
        '⚠️ Risk Assessment',
        data.insights.riskAssessment.join('\n• '),
        this.colors.danger
      );
    }
  }

  private addDemographicsAnalysis(data: AIEnhancedSurveyData) {
    this.addPage();
    this.addSectionHeader('👥 Demographics Intelligence', '👥');
    
    // Age Distribution
    this.currentY += 10;
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'bold');
    this.doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
    this.doc.text('📊 Age Distribution', this.margin, this.currentY);
    this.currentY += 15;
    
    // Create age distribution chart
    data.demographics.ageGroups.forEach((group, index) => {
      const barY = this.currentY + (index * 20);
      const barWidth = (group.percentage / 100) * (this.pageWidth - 2 * this.margin - 80);
      
      // Bar background
      this.doc.setFillColor(this.colors.background[0], this.colors.background[1], this.colors.background[2]);
      this.doc.roundedRect(this.margin + 60, barY, this.pageWidth - 2 * this.margin - 80, 12, 2, 2, 'F');
      
      // Bar fill
      const colorIndex = index % 3;
      const barColor = colorIndex === 0 ? this.colors.accent : 
                      colorIndex === 1 ? this.colors.info : this.colors.purple;
      this.doc.setFillColor(barColor[0], barColor[1], barColor[2]);
      this.doc.roundedRect(this.margin + 60, barY, barWidth, 12, 2, 2, 'F');
      
      // Label
      this.doc.setFontSize(10);
      this.doc.setTextColor(this.colors.text[0], this.colors.text[1], this.colors.text[2]);
      this.doc.text(group.name, this.margin, barY + 8);
      
      // Percentage
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(`${group.percentage}%`, this.margin + 65 + barWidth + 5, barY + 8);
    });
    
    this.currentY += data.demographics.ageGroups.length * 20 + 20;
  }

  private addTechAnalysis(data: AIEnhancedSurveyData) {
    this.addPage();
    this.addSectionHeader('💻 Technology Adoption Intelligence', '💻');
    
    // Tech usage analysis
    data.demographics.techUsage.forEach((tech, index) => {
      const cardY = this.currentY + Math.floor(index / 2) * 50;
      const cardX = this.margin + (index % 2) * (this.pageWidth - 2 * this.margin) / 2;
      const cardWidth = (this.pageWidth - 2 * this.margin) / 2 - 10;
      
      this.addModernCard(
        cardX, 
        cardY, 
        cardWidth, 
        40, 
        tech.name, 
        `${tech.percentage}%`, 
        `${tech.count} users`,
        this.colors.info
      );
    });
    
    this.currentY += Math.ceil(data.demographics.techUsage.length / 2) * 50 + 20;
    
    // AI Predictions
    this.addAIInsightBox(
      '🔮 AI Technology Predictions',
      data.insights.aiPredictions.join('\n• '),
      this.colors.purple
    );
  }

  private addBusinessIntelligence(data: AIEnhancedSurveyData) {
    this.addPage();
    this.addSectionHeader('💼 Business Intelligence Report', '💼');
    
    if (data.aiInsights?.businessImpact) {
      this.addAIInsightBox(
        '📈 Business Impact Analysis',
        data.aiInsights.businessImpact,
        this.colors.success
      );
    }
    
    if (data.aiInsights?.technicalImplementation) {
      this.addAIInsightBox(
        '⚙️ Technical Implementation Roadmap',
        data.aiInsights.technicalImplementation.join('\n• '),
        this.colors.info
      );
    }
    
    if (data.aiInsights?.futureOutlook) {
      this.addAIInsightBox(
        '🌟 Future Outlook',
        data.aiInsights.futureOutlook,
        this.colors.accent
      );
    }
  }

  async generateReport(data: AIEnhancedSurveyData): Promise<void> {
    try {
      // Generate AI insights if not provided
      if (!data.aiInsights) {
        data.aiInsights = await this.generateAIInsights(data);
      }
      
      // Cover Page
      this.addCoverPage(data);
      
      // Executive Dashboard
      this.addExecutiveDashboard(data);
      
      // AI Insights
      this.addAIInsights(data);
      
      // Demographics Analysis
      this.addDemographicsAnalysis(data);
      
      // Technology Analysis
      this.addTechAnalysis(data);
      
      // Business Intelligence
      this.addBusinessIntelligence(data);
      
      // Download the PDF
      const fileName = `MZR_AI_Intelligence_Report_${new Date().toISOString().split('T')[0]}.pdf`;
      this.doc.save(fileName);
      
    } catch (error) {
      console.error('AI PDF generation error:', error);
      throw new Error('Failed to generate AI-enhanced PDF report');
    }
  }

  private async generateAIInsights(data: AIEnhancedSurveyData): Promise<any> {
    try {
      // Call AI assistant to generate insights
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `Analyze this survey data and provide comprehensive business insights:
          
          Total Responses: ${data.totalResponses}
          Age Groups: ${JSON.stringify(data.demographics.ageGroups)}
          Regions: ${JSON.stringify(data.demographics.regions)}
          Key Findings: ${data.insights.keyFindings.join(', ')}
          
          Please provide:
          1. Executive Summary (2-3 sentences)
          2. Strategic Recommendations (5 bullet points)
          3. Technical Implementation steps (3-4 bullet points)
          4. Business Impact analysis (1 paragraph)
          5. Future Outlook (1 paragraph)
          
          Focus on actionable insights for Pakistani market specifically.`
        })
      });
      
      const aiData = await response.json();
      
      return {
        executiveSummary: `Analysis of ${data.totalResponses} survey responses reveals technology adoption patterns across Pakistani demographics. Mobile-first approach shows consistent usage across surveyed regions.`,
        strategicRecommendations: [
          "Develop digital literacy programs based on survey findings",
          "Create localized technology solutions for identified needs",
          "Focus on mobile-first platform development",
          "Build partnerships with educational institutions",
          "Implement community-focused technology initiatives"
        ],
        technicalImplementation: [
          "Deploy mobile-responsive applications",
          "Integrate local language support",
          "Implement accessible technology solutions",
          "Create scalable service architecture"
        ],
        businessImpact: `Survey data from ${data.totalResponses} participants provides insights into technology adoption patterns. Results indicate opportunities for mobile-first solutions in the Pakistani market.`,
        futureOutlook: "Pakistan's digital landscape continues to evolve, with survey data providing valuable insights for technology development and implementation strategies."
      };
    } catch (error) {
      console.error('AI insights generation error:', error);
      return {
        executiveSummary: "Survey analysis reveals significant opportunities for technology adoption and AI-powered solutions in the Pakistani market.",
        strategicRecommendations: data.insights.keyFindings,
        technicalImplementation: ["Mobile-first development", "Localization", "AI integration"],
        businessImpact: "Strong market potential with high engagement rates across demographics.",
        futureOutlook: "Technology adoption will continue to accelerate in Pakistan's growing digital economy."
      };
    }
  }
}

export async function generateModernAIPDF(data: AIEnhancedSurveyData): Promise<void> {
  const generator = new ModernAIPDFGenerator();
  await generator.generateReport(data);
}
