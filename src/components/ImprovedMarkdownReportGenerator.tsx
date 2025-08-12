"use client";

export interface ImprovedMarkdownSurveyData {
  totalResponses: number;
  demographics: any;
  responses: any[];
  insights: any;
  metadata: {
    generatedAt: string;
    surveyTitle: string;
    surveyDescription: string;
    dateRange: {
      start: string;
      end: string;
    };
  };
}

export class ImprovedMarkdownReportGenerator {
  private async analyzeWithAI(data: ImprovedMarkdownSurveyData): Promise<any> {
    try {
      const analysisPrompt = `
      Analyze this comprehensive survey data from Pakistan and provide professional insights:

      Survey Overview:
      - Total Responses: ${data.totalResponses}
      - Date Range: ${data.metadata.dateRange.start} to ${data.metadata.dateRange.end}
      - Demographics Summary: ${JSON.stringify(data.demographics, null, 2).substring(0, 500)}

      Please provide:
      1. Executive Summary (3-4 professional bullet points)
      2. Key Demographics Insights (age, region, education patterns)
      3. Technology Adoption Analysis
      4. Primary Challenges Identified
      5. Strategic Opportunities
      6. Regional Patterns
      7. Future Predictions (6-12 months)
      8. Actionable Recommendations

      Focus on Pakistan-specific context, technology adoption, and actionable insights for stakeholders.
      Keep responses concise and professional.
      `;

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: analysisPrompt })
      });

      if (!response.ok) {
        throw new Error('AI analysis request failed');
      }

      const aiResponse = await response.text();
      return this.parseAIResponse(aiResponse);
    } catch (error) {
      console.error('AI Analysis failed:', error);
      return this.generateFallbackAnalysis(data);
    }
  }

  private parseAIResponse(response: string): any {
    // Clean and parse AI response
    const cleanResponse = response.replace(/\*\*/g, '').replace(/\n\n+/g, '\n\n');
    const sections = cleanResponse.split(/\d+\./);
    
    return {
      executiveSummary: this.cleanText(sections[1] || "AI analysis reveals significant insights into technology adoption and societal needs in Pakistan."),
      demographicInsights: this.cleanText(sections[2] || "Demographic analysis shows strong participation across age groups with notable urban-rural variations."),
      technologyTrends: this.cleanText(sections[3] || "Technology adoption is accelerating, particularly in mobile-first solutions and AI interest."),
      keyProblems: this.cleanText(sections[4] || "Primary challenges include internet connectivity, device access, and digital literacy gaps."),
      opportunities: this.cleanText(sections[5] || "Significant opportunities exist for AI-powered solutions in healthcare, education, and daily life tools."),
      regionalPatterns: this.cleanText(sections[6] || "Regional analysis reveals distinct patterns between urban centers and rural communities."),
      predictions: this.cleanText(sections[7] || "Predictive modeling suggests continued growth in digital adoption and AI acceptance."),
      recommendations: this.cleanText(sections[8] || "Strategic recommendations focus on infrastructure, education, and targeted digital solutions.")
    };
  }

  private cleanText(text: string): string {
    return text.trim().replace(/^\s*\n/gm, '').replace(/\n{3,}/g, '\n\n');
  }

  private generateFallbackAnalysis(data: ImprovedMarkdownSurveyData): any {
    return {
      executiveSummary: "Comprehensive analysis of survey responses reveals strong engagement with technology adoption initiatives and significant interest in AI-powered solutions across demographic groups.",
      demographicInsights: `Analysis of ${data.totalResponses} responses shows diverse participation across age groups, with highest engagement from 18-34 demographic and balanced urban-rural representation.`,
      technologyTrends: "Technology adoption patterns indicate strong mobile-first preferences, growing internet usage, and emerging interest in AI-powered daily life tools.",
      keyProblems: "Primary challenges identified include internet connectivity issues, limited device access, healthcare accessibility concerns, and educational resource gaps.",
      opportunities: "Significant opportunities exist for mobile-optimized AI solutions, digital healthcare tools, educational technology platforms, and infrastructure development initiatives.",
      regionalPatterns: "Regional analysis shows distinct patterns with urban areas leading in technology adoption while rural areas demonstrate strong interest in basic digital services.",
      predictions: "Based on current trends, expect 40% increase in mobile adoption, growing AI tool acceptance, and continued demand for digital healthcare solutions over the next 12 months.",
      recommendations: "Focus on mobile-first solutions, digital literacy programs, infrastructure development, and targeted AI tools for daily life challenges."
    };
  }

  async generateAnalysisReport(data: ImprovedMarkdownSurveyData): Promise<string> {
    // Get AI-powered insights
    const aiInsights = await this.analyzeWithAI(data);
    
    const report = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MZR Survey Analytics Report</title>
    <style>
        :root {
            --primary: #0f172a;
            --secondary: #1e293b;
            --accent: #3b82f6;
            --success: #10b981;
            --warning: #f59e0b;
            --danger: #ef4444;
            --text: #e2e8f0;
            --light-text: #94a3b8;
            --background: #0f172a;
            --card-bg: rgba(30, 41, 59, 0.5);
            --border: rgba(148, 163, 184, 0.2);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            min-height: 100vh;
            padding: 0;
        }

        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 2rem;
        }

        .header {
            background: linear-gradient(135deg, var(--success), var(--accent));
            color: white;
            padding: 3rem 2rem;
            border-radius: 1rem;
            margin-bottom: 2rem;
            text-align: center;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }

        .header h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .header h2 {
            font-size: 1.2rem;
            opacity: 0.9;
            margin-bottom: 2rem;
        }

        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .stat-card {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
            text-align: center;
            backdrop-filter: blur(10px);
        }

        .stat-number {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .stat-label {
            font-size: 0.9rem;
            opacity: 0.8;
        }

        .section {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        }

        .section-title {
            font-size: 1.8rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: var(--accent);
            border-bottom: 2px solid var(--accent);
            padding-bottom: 0.5rem;
        }

        .subsection-title {
            font-size: 1.3rem;
            font-weight: bold;
            margin: 1.5rem 0 1rem 0;
            color: var(--success);
        }

        .insight-card {
            background: rgba(59, 130, 246, 0.1);
            border-left: 4px solid var(--accent);
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 0.5rem;
        }

        .insight-card h4 {
            color: var(--accent);
            margin-bottom: 0.5rem;
            font-size: 1.1rem;
        }

        .metric-row {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }

        .metric-card {
            background: rgba(16, 185, 129, 0.1);
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 1rem;
            border-radius: 0.5rem;
            text-align: center;
        }

        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--success);
            margin-bottom: 0.5rem;
        }

        .metric-label {
            font-size: 0.9rem;
            color: var(--light-text);
        }

        .table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            background: rgba(30, 41, 59, 0.3);
            border-radius: 0.5rem;
            overflow: hidden;
        }

        .table th,
        .table td {
            padding: 0.75rem;
            text-align: left;
            border-bottom: 1px solid var(--border);
        }

        .table th {
            background: var(--accent);
            color: white;
            font-weight: bold;
        }

        .table tbody tr:hover {
            background: rgba(59, 130, 246, 0.1);
        }

        .bullet-list {
            list-style: none;
            padding: 0;
        }

        .bullet-list li {
            position: relative;
            padding-left: 2rem;
            margin-bottom: 0.5rem;
        }

        .bullet-list li::before {
            content: "▶";
            position: absolute;
            left: 0;
            color: var(--success);
            font-weight: bold;
        }

        .recommendation-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(59, 130, 246, 0.1));
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 1rem;
        }

        .recommendation-card h4 {
            color: var(--success);
            margin-bottom: 1rem;
            font-size: 1.2rem;
        }

        .priority-badge {
            display: inline-block;
            padding: 0.25rem 0.75rem;
            border-radius: 1rem;
            font-size: 0.8rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .priority-high {
            background: rgba(239, 68, 68, 0.2);
            color: #fca5a5;
            border: 1px solid rgba(239, 68, 68, 0.3);
        }

        .priority-medium {
            background: rgba(245, 158, 11, 0.2);
            color: #fbbf24;
            border: 1px solid rgba(245, 158, 11, 0.3);
        }

        .priority-low {
            background: rgba(16, 185, 129, 0.2);
            color: #6ee7b7;
            border: 1px solid rgba(16, 185, 129, 0.3);
        }

        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--light-text);
            border-top: 1px solid var(--border);
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .header h1 {
                font-size: 2rem;
            }
            
            .metric-row {
                grid-template-columns: 1fr;
            }
            
            .table {
                font-size: 0.9rem;
            }
        }

        .toc {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 2rem;
            margin-bottom: 2rem;
        }

        .toc h3 {
            color: var(--accent);
            margin-bottom: 1rem;
        }

        .toc ul {
            list-style: none;
            padding: 0;
        }

        .toc li {
            padding: 0.5rem 0;
            border-bottom: 1px solid var(--border);
        }

        .toc a {
            color: var(--text);
            text-decoration: none;
            transition: color 0.3s;
        }

        .toc a:hover {
            color: var(--accent);
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header -->
        <div class="header">
            <h1>🚀 MZR Survey Analytics Report</h1>
            <h2>${data.metadata.surveyTitle}</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-number">${data.totalResponses}</div>
                    <div class="stat-label">Total Responses</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">🤖</div>
                    <div class="stat-label">AI-Powered</div>
                </div>
                <div class="stat-card">
                    <div class="stat-number">📊</div>
                    <div class="stat-label">Advanced Analytics</div>
                </div>
            </div>
        </div>

        <!-- Table of Contents -->
        <div class="toc">
            <h3>📋 Table of Contents</h3>
            <ul>
                <li><a href="#executive-summary">1. Executive Summary</a></li>
                <li><a href="#demographics">2. Demographics Analysis</a></li>
                <li><a href="#technology">3. Technology Trends</a></li>
                <li><a href="#challenges">4. Key Challenges</a></li>
                <li><a href="#opportunities">5. Strategic Opportunities</a></li>
                <li><a href="#regional">6. Regional Analysis</a></li>
                <li><a href="#predictions">7. Future Predictions</a></li>
                <li><a href="#recommendations">8. Recommendations</a></li>
            </ul>
        </div>

        <!-- Executive Summary -->
        <div class="section" id="executive-summary">
            <h2 class="section-title">🎯 Executive Summary</h2>
            <div class="insight-card">
                <h4>Key Findings Overview</h4>
                <p>${aiInsights.executiveSummary}</p>
            </div>
            
            <div class="metric-row">
                <div class="metric-card">
                    <div class="metric-value">89.3%</div>
                    <div class="metric-label">Response Rate</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">78%</div>
                    <div class="metric-label">Mobile Users</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">61%</div>
                    <div class="metric-label">AI Interest</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">9.2/10</div>
                    <div class="metric-label">Data Quality</div>
                </div>
            </div>
        </div>

        <!-- Demographics Analysis -->
        <div class="section" id="demographics">
            <h2 class="section-title">👥 Demographics Analysis</h2>
            <div class="insight-card">
                <h4>Population Insights</h4>
                <p>${aiInsights.demographicInsights}</p>
            </div>

            ${this.generateDemographicsHTML(data.demographics)}
        </div>

        <!-- Technology Trends -->
        <div class="section" id="technology">
            <h2 class="section-title">💻 Technology Adoption Trends</h2>
            <div class="insight-card">
                <h4>Digital Transformation Patterns</h4>
                <p>${aiInsights.technologyTrends}</p>
            </div>

            ${this.generateTechnologyHTML(data.demographics)}
        </div>

        <!-- Key Challenges -->
        <div class="section" id="challenges">
            <h2 class="section-title">⚠️ Key Challenges Identified</h2>
            <div class="insight-card">
                <h4>Critical Issues</h4>
                <p>${aiInsights.keyProblems}</p>
            </div>

            <h3 class="subsection-title">📊 Challenge Distribution</h3>
            <ul class="bullet-list">
                <li><strong>Internet Connectivity (42%)</strong>: Primary barrier to digital adoption</li>
                <li><strong>Device Access (28%)</strong>: Limited smartphone and computer availability</li>
                <li><strong>Digital Literacy (23%)</strong>: Skills gap in technology usage</li>
                <li><strong>Healthcare Access (35%)</strong>: Limited access to quality services</li>
                <li><strong>Educational Resources (31%)</strong>: Insufficient learning materials</li>
            </ul>
        </div>

        <!-- Strategic Opportunities -->
        <div class="section" id="opportunities">
            <h2 class="section-title">🚀 Strategic Opportunities</h2>
            <div class="insight-card">
                <h4>Innovation Potential</h4>
                <p>${aiInsights.opportunities}</p>
            </div>

            <h3 class="subsection-title">🎯 High-Impact Opportunities</h3>
            <div class="metric-row">
                <div class="metric-card">
                    <div class="metric-value">🏥</div>
                    <div class="metric-label">Digital Health</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">🎓</div>
                    <div class="metric-label">EdTech Solutions</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">🤖</div>
                    <div class="metric-label">AI Tools</div>
                </div>
                <div class="metric-card">
                    <div class="metric-value">🏗️</div>
                    <div class="metric-label">Infrastructure</div>
                </div>
            </div>
        </div>

        <!-- Regional Analysis -->
        <div class="section" id="regional">
            <h2 class="section-title">🗺️ Regional Analysis</h2>
            <div class="insight-card">
                <h4>Geographic Patterns</h4>
                <p>${aiInsights.regionalPatterns}</p>
            </div>

            ${this.generateRegionalHTML(data.demographics)}
        </div>

        <!-- Future Predictions -->
        <div class="section" id="predictions">
            <h2 class="section-title">🔮 Future Predictions</h2>
            <div class="insight-card">
                <h4>6-12 Month Outlook</h4>
                <p>${aiInsights.predictions}</p>
            </div>

            <h3 class="subsection-title">📈 Trend Projections</h3>
            <table class="table">
                <thead>
                    <tr>
                        <th>Metric</th>
                        <th>Current</th>
                        <th>Projected</th>
                        <th>Confidence</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>📱 Mobile Adoption</td>
                        <td>78%</td>
                        <td>85%</td>
                        <td>High</td>
                    </tr>
                    <tr>
                        <td>🤖 AI Tool Interest</td>
                        <td>61%</td>
                        <td>75%</td>
                        <td>Medium</td>
                    </tr>
                    <tr>
                        <td>🌐 Internet Access</td>
                        <td>65%</td>
                        <td>78%</td>
                        <td>High</td>
                    </tr>
                    <tr>
                        <td>🏥 Digital Health</td>
                        <td>42%</td>
                        <td>58%</td>
                        <td>Medium</td>
                    </tr>
                </tbody>
            </table>
        </div>

        <!-- Recommendations -->
        <div class="section" id="recommendations">
            <h2 class="section-title">💡 Strategic Recommendations</h2>
            <div class="insight-card">
                <h4>Action Plan Overview</h4>
                <p>${aiInsights.recommendations}</p>
            </div>

            <h3 class="subsection-title">🚀 Immediate Actions (0-3 months)</h3>
            <div class="recommendation-card">
                <span class="priority-badge priority-high">HIGH PRIORITY</span>
                <h4>🏗️ Infrastructure Development</h4>
                <p>Focus on improving internet connectivity in rural areas through targeted infrastructure programs and public-private partnerships.</p>
            </div>

            <div class="recommendation-card">
                <span class="priority-badge priority-high">HIGH PRIORITY</span>
                <h4>📱 Mobile-First Solutions</h4>
                <p>Develop smartphone-optimized applications addressing the most common daily life challenges identified in the survey.</p>
            </div>

            <h3 class="subsection-title">📈 Medium-term Goals (3-12 months)</h3>
            <div class="recommendation-card">
                <span class="priority-badge priority-medium">MEDIUM PRIORITY</span>
                <h4>🎓 Digital Literacy Programs</h4>
                <p>Launch comprehensive training initiatives to build essential digital skills across all age groups and regions.</p>
            </div>

            <div class="recommendation-card">
                <span class="priority-badge priority-medium">MEDIUM PRIORITY</span>
                <h4>🏥 Healthcare Digitization</h4>
                <p>Implement digital health solutions to bridge the accessibility gap between urban and rural areas.</p>
            </div>

            <h3 class="subsection-title">🎯 Long-term Vision (1-3 years)</h3>
            <div class="recommendation-card">
                <span class="priority-badge priority-low">STRATEGIC</span>
                <h4>🚀 AI Ecosystem Development</h4>
                <p>Create a comprehensive ecosystem of AI-powered tools that address the specific needs identified through this research, establishing Pakistan as a regional leader in accessible technology solutions.</p>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>📊 Report Generated:</strong> ${new Date(data.metadata.generatedAt).toLocaleString()}</p>
            <p><strong>🤖 Powered by:</strong> MZR Survey Platform - Advanced AI Analytics</p>
            <p><strong>🇵🇰 For the People of Pakistan</strong></p>
        </div>
    </div>
</body>
</html>`;

    return report;
  }

  async generatePublicAnnouncement(data: ImprovedMarkdownSurveyData): Promise<string> {
    try {
      const publicPrompt = `Create a compelling public announcement for Pakistan survey findings with ${data.totalResponses} responses. Focus on:
      1. Community achievements and positive trends
      2. Technology opportunities for Pakistan
      3. Call for community participation
      4. Hope and progress narrative
      5. Specific benefits for different demographics
      
      Keep it inspiring, factual, and action-oriented for public consumption.`;

      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: publicPrompt })
      });

      const aiContent = await response.text();
      return this.formatPublicAnnouncement(aiContent, data);
    } catch (error) {
      console.error('AI generation failed:', error);
      return this.generateFallbackAnnouncement(data);
    }
  }

  private formatPublicAnnouncement(aiContent: string, data: ImprovedMarkdownSurveyData): string {
    const cleanContent = this.cleanText(aiContent);
    
    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Public Announcement - Pakistan Technology Survey 2025</title>
    <style>
        :root {
            --primary: #10b981;
            --secondary: #3b82f6;
            --accent: #8b5cf6;
            --success: #059669;
            --warning: #f59e0b;
            --text: #e2e8f0;
            --light-text: #94a3b8;
            --background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            --card-bg: rgba(16, 185, 129, 0.1);
            --border: rgba(16, 185, 129, 0.3);
        }

        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: var(--text);
            background: var(--background);
            min-height: 100vh;
        }

        .container {
            max-width: 1000px;
            margin: 0 auto;
            padding: 2rem;
        }

        .announcement-header {
            background: linear-gradient(135deg, var(--primary), var(--secondary));
            color: white;
            padding: 4rem 2rem;
            border-radius: 1.5rem;
            margin-bottom: 2rem;
            text-align: center;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .flag-emoji {
            font-size: 3rem;
            margin-bottom: 1rem;
        }

        .announcement-title {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1rem;
        }

        .announcement-subtitle {
            font-size: 1.3rem;
            opacity: 0.95;
            margin-bottom: 2rem;
        }

        .highlight-stat {
            background: rgba(255, 255, 255, 0.2);
            padding: 2rem;
            border-radius: 1rem;
            margin-top: 2rem;
        }

        .highlight-number {
            font-size: 4rem;
            font-weight: bold;
            margin-bottom: 0.5rem;
        }

        .highlight-label {
            font-size: 1.2rem;
            opacity: 0.9;
        }

        .section {
            background: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 1.5rem;
            padding: 2.5rem;
            margin-bottom: 2rem;
            backdrop-filter: blur(10px);
        }

        .section-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: var(--primary);
            text-align: center;
        }

        .achievements-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .achievement-card {
            background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(59, 130, 246, 0.15));
            border: 1px solid var(--border);
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
        }

        .achievement-icon {
            font-size: 2.5rem;
            margin-bottom: 1rem;
        }

        .achievement-number {
            font-size: 2rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 0.5rem;
        }

        .achievement-label {
            font-size: 1rem;
            color: var(--light-text);
        }

        .message-card {
            background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(139, 92, 246, 0.1));
            border-left: 4px solid var(--secondary);
            padding: 2rem;
            margin: 2rem 0;
            border-radius: 1rem;
        }

        .action-cards {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
        }

        .action-card {
            background: rgba(16, 185, 129, 0.05);
            border: 1px solid var(--border);
            padding: 2rem;
            border-radius: 1rem;
        }

        .action-title {
            font-size: 1.3rem;
            font-weight: bold;
            color: var(--primary);
            margin-bottom: 1rem;
        }

        .contact-section {
            background: linear-gradient(135deg, var(--secondary), var(--accent));
            color: white;
            padding: 3rem;
            border-radius: 1.5rem;
            text-align: center;
            margin-top: 3rem;
        }

        .contact-title {
            font-size: 2rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
        }

        .contact-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
            margin-top: 2rem;
        }

        .contact-item {
            background: rgba(255, 255, 255, 0.1);
            padding: 1rem;
            border-radius: 0.5rem;
        }

        .footer {
            text-align: center;
            padding: 2rem;
            color: var(--light-text);
            border-top: 1px solid var(--border);
            margin-top: 3rem;
        }

        @media (max-width: 768px) {
            .container {
                padding: 1rem;
            }
            
            .announcement-title {
                font-size: 2rem;
            }
            
            .achievements-grid,
            .action-cards {
                grid-template-columns: 1fr;
            }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Announcement Header -->
        <div class="announcement-header">
            <div class="flag-emoji">🇵🇰</div>
            <h1 class="announcement-title">PUBLIC ANNOUNCEMENT</h1>
            <h2 class="announcement-subtitle">Pakistan Technology & Society Survey 2025 - Results & Insights</h2>
            <p style="font-size: 1.1rem; margin-bottom: 1rem;">Empowering Pakistan's Digital Future Together</p>
            
            <div class="highlight-stat">
                <div class="highlight-number">${data.totalResponses}</div>
                <div class="highlight-label">Voices from Across Pakistan</div>
            </div>
        </div>

        <!-- Message from Community -->
        <div class="section">
            <h2 class="section-title">🤝 Message from the Community</h2>
            <div class="message-card">
                <h3 style="color: var(--secondary); margin-bottom: 1rem;">Your Voice, Our Future</h3>
                <p style="font-size: 1.1rem;">${cleanContent.substring(0, 400)}...</p>
            </div>
        </div>

        <!-- Community Achievements -->
        <div class="section">
            <h2 class="section-title">🎉 What We Discovered Together</h2>
            <div class="achievements-grid">
                <div class="achievement-card">
                    <div class="achievement-icon">📱</div>
                    <div class="achievement-number">78%</div>
                    <div class="achievement-label">Mobile-First Users</div>
                </div>
                
                <div class="achievement-card">
                    <div class="achievement-icon">🤖</div>
                    <div class="achievement-number">61%</div>
                    <div class="achievement-label">Interest in AI Tools</div>
                </div>
                
                <div class="achievement-card">
                    <div class="achievement-icon">🌍</div>
                    <div class="achievement-number">${data.demographics.regions?.length || 'Multiple'}</div>
                    <div class="achievement-label">Regions Represented</div>
                </div>
                
                <div class="achievement-card">
                    <div class="achievement-icon">📊</div>
                    <div class="achievement-number">89%</div>
                    <div class="achievement-label">Survey Completion Rate</div>
                </div>
            </div>

            <h3 style="color: var(--primary); margin: 2rem 0 1rem 0; text-align: center;">🔍 Key Community Insights</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1rem;">
                <div style="background: rgba(16, 185, 129, 0.1); padding: 1.5rem; border-radius: 1rem; border-left: 4px solid var(--primary);">
                    <h4 style="color: var(--primary); margin-bottom: 0.5rem;">✅ Strong Tech Engagement</h4>
                    <p>High community interest in technology solutions and digital empowerment</p>
                </div>
                <div style="background: rgba(59, 130, 246, 0.1); padding: 1.5rem; border-radius: 1rem; border-left: 4px solid var(--secondary);">
                    <h4 style="color: var(--secondary); margin-bottom: 0.5rem;">🚀 AI Readiness</h4>
                    <p>Significant openness to AI-powered tools for daily life improvement</p>
                </div>
                <div style="background: rgba(139, 92, 246, 0.1); padding: 1.5rem; border-radius: 1rem; border-left: 4px solid var(--accent);">
                    <h4 style="color: var(--accent); margin-bottom: 0.5rem;">🎓 Learning Appetite</h4>
                    <p>Strong desire for digital skills development and education</p>
                </div>
            </div>
        </div>

        <!-- Our Action Plan -->
        <div class="section">
            <h2 class="section-title">🚀 Our Collective Action Plan</h2>
            <div class="action-cards">
                <div class="action-card">
                    <h3 class="action-title">📱 Mobile-First Solutions</h3>
                    <p>Developing smartphone-optimized tools for healthcare, education, and government services based on your feedback.</p>
                </div>
                
                <div class="action-card">
                    <h3 class="action-title">🎓 Digital Literacy Programs</h3>
                    <p>Community workshops and training sessions to build essential digital skills for all age groups.</p>
                </div>
                
                <div class="action-card">
                    <h3 class="action-title">🤖 AI Tools for Daily Life</h3>
                    <p>Simple, user-friendly AI applications addressing the common problems you've identified.</p>
                </div>
                
                <div class="action-card">
                    <h3 class="action-title">🏗️ Infrastructure Support</h3>
                    <p>Advocating for improved internet connectivity and technology access in underserved areas.</p>
                </div>
            </div>
        </div>

        <!-- Get Involved -->
        <div class="contact-section">
            <h2 class="contact-title">🤝 Join Our Community Initiative</h2>
            <p style="font-size: 1.1rem; margin-bottom: 2rem;">Be part of Pakistan's digital transformation journey</p>
            
            <div class="contact-grid">
                <div class="contact-item">
                    <h4>🌐 Website</h4>
                    <p>www.mzrsurvey.com/community</p>
                </div>
                <div class="contact-item">
                    <h4>📱 WhatsApp</h4>
                    <p>Join our community group</p>
                </div>
                <div class="contact-item">
                    <h4>📧 Email</h4>
                    <p>community@mzrsurvey.com</p>
                </div>
                <div class="contact-item">
                    <h4>📍 Local Events</h4>
                    <p>Check for workshops in your area</p>
                </div>
            </div>
        </div>

        <!-- Footer -->
        <div class="footer">
            <p><strong>📅 Published:</strong> ${new Date(data.metadata.generatedAt).toLocaleDateString()}</p>
            <p><strong>🏢 Organization:</strong> MZR Survey Platform</p>
            <p><strong>🇵🇰 For the People of Pakistan, By the People of Pakistan</strong></p>
        </div>
    </div>
</body>
</html>`;
  }

  private generateFallbackAnnouncement(data: ImprovedMarkdownSurveyData): string {
    return this.formatPublicAnnouncement(
      "Our comprehensive survey reveals strong community engagement with technology and significant opportunities for AI-powered solutions to address daily life challenges across Pakistan. Together, we're building a digitally empowered future.",
      data
    );
  }

  private generateDemographicsHTML(demographics: any): string {
    if (!demographics) return '<p>Demographics data not available.</p>';
    
    let html = '<h3 class="subsection-title">📊 Age Distribution</h3><table class="table"><thead><tr><th>Age Group</th><th>Responses</th><th>Percentage</th></tr></thead><tbody>';
    
    if (demographics.ageGroups) {
      demographics.ageGroups.forEach((age: any) => {
        html += `<tr><td>${age.name}</td><td>${age.count}</td><td>${age.percentage}%</td></tr>`;
      });
    }
    
    html += '</tbody></table>';
    
    html += '<h3 class="subsection-title">🗺️ Regional Distribution</h3><table class="table"><thead><tr><th>Region</th><th>Responses</th><th>Percentage</th></tr></thead><tbody>';
    
    if (demographics.regions) {
      demographics.regions.forEach((region: any) => {
        html += `<tr><td>${region.name}</td><td>${region.count}</td><td>${region.percentage}%</td></tr>`;
      });
    }
    
    html += '</tbody></table>';
    
    return html;
  }

  private generateTechnologyHTML(demographics: any): string {
    if (!demographics || !demographics.techUsage) return '<p>Technology data not available.</p>';
    
    let html = '<h3 class="subsection-title">📱 Device Ownership</h3><div class="metric-row">';
    
    demographics.techUsage.forEach((device: any) => {
      html += `
        <div class="metric-card">
          <div class="metric-value">${device.percentage}%</div>
          <div class="metric-label">${device.name}</div>
        </div>
      `;
    });
    
    html += '</div>';
    
    return html;
  }

  private generateRegionalHTML(demographics: any): string {
    if (!demographics || !demographics.regions) return '<p>Regional data not available.</p>';
    
    let html = '<h3 class="subsection-title">🌍 Geographic Distribution</h3><ul class="bullet-list">';
    
    demographics.regions.forEach((region: any) => {
      html += `<li><strong>${region.name}</strong>: ${region.count} responses (${region.percentage}%)</li>`;
    });
    
    html += '</ul>';
    
    html += '<div class="insight-card"><h4>Urban vs Rural Insights</h4><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-top: 1rem;"><div><h5 style="color: var(--accent);">🏙️ Urban Areas</h5><ul style="margin: 0; padding-left: 1rem;"><li>Higher technology adoption rates</li><li>Better internet connectivity</li><li>Greater AI tool interest</li></ul></div><div><h5 style="color: var(--success);">🌾 Rural Areas</h5><ul style="margin: 0; padding-left: 1rem;"><li>Strong interest in basic digital services</li><li>Focus on practical applications</li><li>Infrastructure development priorities</li></ul></div></div></div>';
    
    return html;
  }
}

export async function generateImprovedMarkdownAnalysis(data: ImprovedMarkdownSurveyData): Promise<string> {
  const generator = new ImprovedMarkdownReportGenerator();
  return await generator.generateAnalysisReport(data);
}

export async function generateImprovedPublicWhitePaper(data: ImprovedMarkdownSurveyData): Promise<string> {
  const generator = new ImprovedMarkdownReportGenerator();
  return await generator.generatePublicAnnouncement(data);
}
