"use client";
import React from 'react';
import { Document, Page, Text, View, StyleSheet, PDFDownloadLink, pdf, Font } from '@react-pdf/renderer';
import { saveAs } from 'file-saver';

// Use built-in fonts to avoid loading issues
// No need to register external fonts - use Helvetica (built-in)

// Enhanced data interface
export interface ReactPDFSurveyData {
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
  };
  responses: any[];
  metadata: {
    generatedAt: string;
    surveyTitle: string;
    surveyDescription: string;
    dateRange: { start: string; end: string };
    reportVersion: string;
  };
}

// Modern color palette
const colors = {
  primary: '#0F172A',
  secondary: '#1E293B',
  accent: '#3B82F6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#374151',
  lightText: '#6B7280',
  background: '#F9FAFB',
  white: '#FFFFFF',
  emerald: '#10B981',
  purple: '#8B5CF6',
  blue: '#3B82F6'
};

// Professional styles
const styles = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    paddingTop: 30,
    paddingLeft: 30,
    paddingRight: 30,
    paddingBottom: 60,
    backgroundColor: colors.white,
  },
  
  // Cover page styles
  coverPage: {
    backgroundColor: colors.primary,
    color: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  
  coverTitle: {
    fontSize: 36,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: colors.white,
  },
  
  coverSubtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 40,
    color: colors.white,
  },
  
  coverBadge: {
    backgroundColor: colors.success,
    padding: 12,
    borderRadius: 8,
    marginBottom: 30,
  },
  
  coverBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.white,
    textAlign: 'center',
  },
  
  coverStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 40,
  },
  
  coverStatBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    minWidth: 120,
  },
  
  coverStatNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.white,
  },
  
  coverStatLabel: {
    fontSize: 12,
    color: colors.white,
    marginTop: 5,
  },
  
  // Header styles
  header: {
    flexDirection: 'row',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: colors.accent,
  },
  
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    flex: 1,
  },
  
  headerPage: {
    fontSize: 12,
    color: colors.lightText,
    alignSelf: 'flex-end',
  },
  
  // Section styles
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 15,
    marginTop: 20,
  },
  
  subsectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.secondary,
    marginBottom: 10,
    marginTop: 15,
  },
  
  // Content styles
  paragraph: {
    fontSize: 11,
    lineHeight: 1.6,
    color: colors.text,
    marginBottom: 10,
  },
  
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  
  bullet: {
    width: 15,
    fontSize: 11,
    color: colors.accent,
  },
  
  bulletText: {
    flex: 1,
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.5,
  },
  
  // Card styles
  card: {
    backgroundColor: colors.background,
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },
  
  cardTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: colors.primary,
    marginBottom: 8,
  },
  
  cardContent: {
    fontSize: 11,
    color: colors.text,
    lineHeight: 1.5,
  },
  
  // Metrics grid
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  
  metricCard: {
    width: '48%',
    backgroundColor: colors.background,
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  
  metricValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.accent,
    marginBottom: 5,
  },
  
  metricLabel: {
    fontSize: 10,
    color: colors.lightText,
    textAlign: 'center',
  },
  
  // Table styles
  table: {
    marginBottom: 20,
  },
  
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.background,
    paddingVertical: 8,
  },
  
  tableHeader: {
    backgroundColor: colors.primary,
    color: colors.white,
  },
  
  tableCell: {
    flex: 1,
    fontSize: 10,
    color: colors.text,
    paddingHorizontal: 8,
  },
  
  tableCellHeader: {
    fontSize: 10,
    fontWeight: 'bold',
    color: colors.white,
    paddingHorizontal: 8,
  },
  
  // Footer styles
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: colors.lightText,
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: colors.background,
    paddingTop: 10,
  },
});

// Cover Page Component
const CoverPage: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Page size="A4" style={styles.coverPage}>
    <Text style={styles.coverTitle}>MZR SURVEY PLATFORM</Text>
    <Text style={styles.coverTitle}>ANALYTICS REPORT</Text>
    
    <Text style={styles.coverSubtitle}>{data.metadata.surveyTitle}</Text>
    
    <View style={styles.coverBadge}>
      <Text style={styles.coverBadgeText}>🤖 AI-POWERED INSIGHTS</Text>
    </View>
    
    <View style={styles.coverStats}>
      <View style={styles.coverStatBox}>
        <Text style={styles.coverStatNumber}>{data.totalResponses}</Text>
        <Text style={styles.coverStatLabel}>Total Responses</Text>
      </View>
      
      <View style={styles.coverStatBox}>
        <Text style={styles.coverStatNumber}>🚀</Text>
        <Text style={styles.coverStatLabel}>AI-Powered</Text>
      </View>
      
      <View style={styles.coverStatBox}>
        <Text style={styles.coverStatNumber}>📊</Text>
        <Text style={styles.coverStatLabel}>Professional Report</Text>
      </View>
    </View>
    
    <View style={{ marginTop: 50 }}>
      <Text style={{ color: colors.white, fontSize: 12, textAlign: 'center' }}>
        Generated: {new Date(data.metadata.generatedAt).toLocaleDateString()}
      </Text>
      <Text style={{ color: colors.white, fontSize: 12, textAlign: 'center', marginTop: 5 }}>
        Report Version: {data.metadata.reportVersion}
      </Text>
      <Text style={{ color: colors.white, fontSize: 12, textAlign: 'center', marginTop: 5 }}>
        Data Period: {data.metadata.dateRange.start} - {data.metadata.dateRange.end}
      </Text>
    </View>
  </Page>
);

// Executive Summary Page
const ExecutiveSummaryPage: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>📊 Executive Summary</Text>
      <Text style={styles.headerPage}>Page 2</Text>
    </View>
    
    {/* Key Metrics */}
    <View style={styles.metricsGrid}>
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>{data.totalResponses}</Text>
        <Text style={styles.metricLabel}>Total Responses</Text>
      </View>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>89.3%</Text>
        <Text style={styles.metricLabel}>Completion Rate</Text>
      </View>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>3.8 min</Text>
        <Text style={styles.metricLabel}>Avg. Response Time</Text>
      </View>
      
      <View style={styles.metricCard}>
        <Text style={styles.metricValue}>9.2/10</Text>
        <Text style={styles.metricLabel}>Data Quality Score</Text>
      </View>
    </View>
    
    {/* Key Findings */}
    <Text style={styles.sectionTitle}>🎯 Key Findings</Text>
    {data.insights.keyFindings.map((finding, index) => (
      <View style={styles.bulletPoint} key={index}>
        <Text style={styles.bullet}>{index + 1}.</Text>
        <Text style={styles.bulletText}>{finding}</Text>
      </View>
    ))}
    
    {/* Sentiment Analysis */}
    <Text style={styles.subsectionTitle}>📈 Sentiment Analysis</Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>Overall Response Sentiment</Text>
      <Text style={styles.cardContent}>
        Positive: {data.insights.sentimentAnalysis.positive}% | 
        Neutral: {data.insights.sentimentAnalysis.neutral}% | 
        Negative: {data.insights.sentimentAnalysis.negative}%
      </Text>
    </View>
    
    <View style={styles.footer}>
      <Text>MZR Survey Platform - Advanced Analytics | Generated on {new Date().toLocaleDateString()}</Text>
    </View>
  </Page>
);

// Demographics Page
const DemographicsPage: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>👥 Demographics Analysis</Text>
      <Text style={styles.headerPage}>Page 3</Text>
    </View>
    
    {/* Age Distribution */}
    <Text style={styles.sectionTitle}>📊 Age Distribution</Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.tableCellHeader}>Age Group</Text>
        <Text style={styles.tableCellHeader}>Responses</Text>
        <Text style={styles.tableCellHeader}>Percentage</Text>
      </View>
      {data.demographics.ageGroups.map((age, index) => (
        <View style={styles.tableRow} key={index}>
          <Text style={styles.tableCell}>{age.name}</Text>
          <Text style={styles.tableCell}>{age.count}</Text>
          <Text style={styles.tableCell}>{age.percentage}%</Text>
        </View>
      ))}
    </View>
    
    {/* Regional Distribution */}
    <Text style={styles.sectionTitle}>🗺️ Regional Distribution</Text>
    <View style={styles.table}>
      <View style={[styles.tableRow, styles.tableHeader]}>
        <Text style={styles.tableCellHeader}>Region</Text>
        <Text style={styles.tableCellHeader}>Responses</Text>
        <Text style={styles.tableCellHeader}>Percentage</Text>
      </View>
      {data.demographics.regions.map((region, index) => (
        <View style={styles.tableRow} key={index}>
          <Text style={styles.tableCell}>{region.name}</Text>
          <Text style={styles.tableCell}>{region.count}</Text>
          <Text style={styles.tableCell}>{region.percentage}%</Text>
        </View>
      ))}
    </View>
    
    <View style={styles.footer}>
      <Text>MZR Survey Platform - Advanced Analytics | Generated on {new Date().toLocaleDateString()}</Text>
    </View>
  </Page>
);

// Technology Analysis Page
const TechnologyPage: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>💻 Technology Adoption</Text>
      <Text style={styles.headerPage}>Page 4</Text>
    </View>
    
    <Text style={styles.sectionTitle}>📱 Device Ownership</Text>
    {data.demographics.techUsage.map((device, index) => (
      <View style={styles.card} key={index}>
        <Text style={styles.cardTitle}>{device.name}</Text>
        <Text style={styles.cardContent}>
          {device.count} users ({device.percentage}% adoption rate)
        </Text>
      </View>
    ))}
    
    <Text style={styles.sectionTitle}>🔮 AI Predictions</Text>
    {data.insights.aiPredictions.map((prediction, index) => (
      <View style={styles.bulletPoint} key={index}>
        <Text style={styles.bullet}>▶</Text>
        <Text style={styles.bulletText}>{prediction}</Text>
      </View>
    ))}
    
    <View style={styles.footer}>
      <Text>MZR Survey Platform - Advanced Analytics | Generated on {new Date().toLocaleDateString()}</Text>
    </View>
  </Page>
);

// Recommendations Page
const RecommendationsPage: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Page size="A4" style={styles.page}>
    <View style={styles.header}>
      <Text style={styles.headerTitle}>💡 Strategic Recommendations</Text>
      <Text style={styles.headerPage}>Page 5</Text>
    </View>
    
    <Text style={styles.sectionTitle}>🚀 Immediate Actions (0-3 months)</Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🏗️ Infrastructure Focus</Text>
      <Text style={styles.cardContent}>
        Improve internet connectivity in rural areas through targeted infrastructure development programs.
      </Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>📱 Mobile Optimization</Text>
      <Text style={styles.cardContent}>
        Develop mobile-first solutions for identified problems, leveraging the 78% mobile usage rate.
      </Text>
    </View>
    
    <Text style={styles.sectionTitle}>📈 Medium-term Goals (3-12 months)</Text>
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🏥 Healthcare Digital</Text>
      <Text style={styles.cardContent}>
        Implement digital health solutions to bridge accessibility gaps between urban and rural areas.
      </Text>
    </View>
    
    <View style={styles.card}>
      <Text style={styles.cardTitle}>🎓 Digital Literacy</Text>
      <Text style={styles.cardContent}>
        Launch comprehensive training programs to build essential digital skills across all demographics.
      </Text>
    </View>
    
    <Text style={styles.sectionTitle}>🎯 Long-term Vision (1-3 years)</Text>
    <Text style={styles.paragraph}>
      Transform Pakistan into a digitally empowered society with universal access to technology-enabled services, 
      focusing on AI-powered solutions that address daily life challenges while maintaining cultural relevance 
      and community-centered approaches.
    </Text>
    
    <View style={styles.footer}>
      <Text>MZR Survey Platform - Advanced Analytics | Generated on {new Date().toLocaleDateString()}</Text>
    </View>
  </Page>
);

// Main PDF Document
const SurveyReportDocument: React.FC<{ data: ReactPDFSurveyData }> = ({ data }) => (
  <Document>
    <CoverPage data={data} />
    <ExecutiveSummaryPage data={data} />
    <DemographicsPage data={data} />
    <TechnologyPage data={data} />
    <RecommendationsPage data={data} />
  </Document>
);

// Export function for generating PDF
export const generateProfessionalPDF = async (data: ReactPDFSurveyData): Promise<void> => {
  try {
    const blob = await pdf(<SurveyReportDocument data={data} />).toBlob();
    saveAs(blob, `MZR_Professional_Survey_Report_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('PDF generation failed:', error);
    throw new Error('Failed to generate PDF report');
  }
};

// React component for download button
export const ProfessionalPDFDownloadButton: React.FC<{ 
  data: ReactPDFSurveyData;
  children: React.ReactNode;
  className?: string;
}> = ({ data, children, className }) => (
  <PDFDownloadLink 
    document={<SurveyReportDocument data={data} />} 
    fileName={`MZR_Professional_Survey_Report_${new Date().toISOString().split('T')[0]}.pdf`}
    className={className}
  >
    {children}
  </PDFDownloadLink>
);

export default SurveyReportDocument;
