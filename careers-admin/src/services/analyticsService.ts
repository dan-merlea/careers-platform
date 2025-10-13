import { api } from '../utils/api';
import { FilterParams } from '../pages/analytics/AnalyticsPage';

// Types for analytics data
export interface KpiMetric {
  label: string;
  value: number;
  change: number;
  trend: 'up' | 'down' | 'neutral';
}

export interface FunnelStage {
  stage: string;
  count: number;
  conversionRate: number;
}

export interface JobPerformance {
  id: string;
  title: string;
  applications: number;
  interviews?: number;
  offers?: number;
  hires: number;
  timeToFill?: number;
  conversionRate: number;
}

export interface InterviewMetric {
  interviewer: string;
  conducted: number;
  passRate: number;
  avgScore: number;
  avgDuration: number;
}

export interface SourceMetric {
  source: string;
  applications: number;
  qualifiedCandidates?: number;
  hires: number;
  costPerHire?: number;
  conversionRate: number;
}

// Response types for API calls
interface DashboardResponse {
  kpis: KpiMetric[];
  applicationTrend: Array<{ date: string; count: number }>;
}

export interface DepartmentBreakdown {
  department: string;
  applications: number;
  hires: number;
  conversionRate: number;
}

export interface TimeToHireStage {
  stage: string;
  days: number;
}

export interface TimeToHire {
  average: number;
  byStage: TimeToHireStage[];
}

interface FunnelResponse {
  stages: FunnelStage[];
  departmentBreakdown: DepartmentBreakdown[];
  timeToHire: TimeToHire;
}

export interface DepartmentPerformance {
  department: string;
  openings: number;
  applications: number;
  hires: number;
  avgTimeToFill: number;
}

export interface LocationPerformance {
  location: string;
  openings: number;
  applications: number;
  hires: number;
  avgTimeToFill: number;
}

export interface MonthlyTrend {
  month: string;
  applications: number;
  hires: number;
}

interface JobsResponse {
  jobs: JobPerformance[];
  departmentPerformance?: DepartmentPerformance[];
  locationPerformance?: LocationPerformance[];
  monthlyTrends?: MonthlyTrend[];
}

export interface SkillAssessment {
  skill: string;
  avgScore: number;
  interviewCount: number;
}

export interface InterviewStage {
  stage: string;
  avgDuration: number;
  passRate: number;
  interviewCount: number;
}

export interface InterviewTrend {
  month: string;
  interviews: number;
  passRate: number;
}

interface InterviewsResponse {
  metrics: InterviewMetric[];
  feedbackDistribution: Array<{ rating: string; count: number }>;
  skillAssessments?: SkillAssessment[];
  interviewStages?: InterviewStage[];
  monthlyTrends?: InterviewTrend[];
}

export interface CostAnalysis {
  source: string;
  totalSpend: number;
  costPerApplication: number;
  costPerQualifiedCandidate: number;
}

export interface QualityMetric {
  source: string;
  avgTimeToHire: number;
  offerAcceptanceRate: number;
  retentionRate6Month: number;
}

export interface MonthlySourceTrend {
  month: string;
  applications: {
    linkedin: number;
    indeed: number;
    referrals: number;
    website: number;
    jobFairs: number;
    other: number;
    [key: string]: number;
  };
}

interface SourcesResponse {
  sources: SourceMetric[];
  costAnalysis?: CostAnalysis[];
  qualityMetrics?: QualityMetric[];
  monthlyTrends?: MonthlySourceTrend[];
}

// Analytics service with methods for each section
export const analyticsService = {
  // Dashboard overview metrics
  getDashboardMetrics: async (filters: FilterParams): Promise<DashboardResponse> => {
    try {
      // Convert filters to URL search params
      const queryParams = new URLSearchParams();
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.startDate);
        queryParams.append('endDate', filters.dateRange.endDate);
      }
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.source) queryParams.append('source', filters.source);
      if (filters.comparisonPeriod) queryParams.append('comparisonPeriod', filters.comparisonPeriod);
      
      const endpoint = `/analytics/dashboard${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get<DashboardResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  },
  
  // Recruitment funnel data
  getRecruitmentFunnel: async (filters: FilterParams): Promise<FunnelResponse> => {
    try {
      // Convert filters to URL search params
      const queryParams = new URLSearchParams();
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.startDate);
        queryParams.append('endDate', filters.dateRange.endDate);
      }
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
      if (filters.location) queryParams.append('location', filters.location);
      if (filters.source) queryParams.append('source', filters.source);
      
      const endpoint = `/analytics/funnel${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get<FunnelResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching recruitment funnel:', error);
      throw error;
    }
  },
  
  // Job performance metrics
  getJobPerformance: async (filters: FilterParams): Promise<JobsResponse> => {
    try {
      // Convert filters to URL search params
      const queryParams = new URLSearchParams();
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.startDate);
        queryParams.append('endDate', filters.dateRange.endDate);
      }
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
      if (filters.location) queryParams.append('location', filters.location);
      
      const endpoint = `/analytics/jobs${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get<JobsResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching job performance:', error);
      throw error;
    }
  },
  
  // Interview analytics
  getInterviewAnalytics: async (filters: FilterParams): Promise<InterviewsResponse> => {
    try {
      // Convert filters to URL search params
      const queryParams = new URLSearchParams();
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.startDate);
        queryParams.append('endDate', filters.dateRange.endDate);
      }
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
      
      const endpoint = `/analytics/interviews${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get<InterviewsResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching interview analytics:', error);
      throw error;
    }
  },
  
  // Candidate source analysis
  getCandidateSourceAnalytics: async (filters: FilterParams): Promise<SourcesResponse> => {
    try {
      // Convert filters to URL search params
      const queryParams = new URLSearchParams();
      if (filters.dateRange) {
        queryParams.append('startDate', filters.dateRange.startDate);
        queryParams.append('endDate', filters.dateRange.endDate);
      }
      if (filters.department) queryParams.append('department', filters.department);
      if (filters.jobRole) queryParams.append('jobRole', filters.jobRole);
      if (filters.location) queryParams.append('location', filters.location);
      
      const endpoint = `/analytics/sources${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
      return await api.get<SourcesResponse>(endpoint);
    } catch (error) {
      console.error('Error fetching candidate source analytics:', error);
      throw error;
    }
  },
  
  // For development/demo purposes - generate mock data
  getMockData: (section: string) => {
    switch (section) {
      case 'dashboard':
        return {
          kpis: [
            { label: 'Total Applications', value: 342, change: 12.5, trend: 'up' },
            { label: 'Active Candidates', value: 87, change: 5.2, trend: 'up' },
            { label: 'Time to Hire (days)', value: 28, change: -3.5, trend: 'down' },
            { label: 'Conversion Rate', value: 4.2, change: 0.8, trend: 'up' }
          ],
          applicationTrend: [
            { date: '2025-08-01', count: 42 },
            { date: '2025-08-08', count: 38 },
            { date: '2025-08-15', count: 56 },
            { date: '2025-08-22', count: 48 },
            { date: '2025-08-29', count: 62 },
            { date: '2025-09-05', count: 58 },
            { date: '2025-09-12', count: 64 },
            { date: '2025-09-19', count: 72 }
          ]
        };
      
      case 'funnel':
        return {
          stages: [
            { stage: 'Applications', count: 342, conversionRate: 100 },
            { stage: 'Screening', count: 186, conversionRate: 54.4 },
            { stage: 'Interview', count: 98, conversionRate: 52.7 },
            { stage: 'Assessment', count: 64, conversionRate: 65.3 },
            { stage: 'Offer', count: 28, conversionRate: 43.8 },
            { stage: 'Hired', count: 21, conversionRate: 75.0 }
          ],
          departmentBreakdown: [
            { department: 'Engineering', applications: 145, hires: 9, conversionRate: 6.2 },
            { department: 'Product', applications: 78, hires: 4, conversionRate: 5.1 },
            { department: 'Design', applications: 56, hires: 3, conversionRate: 5.4 },
            { department: 'Marketing', applications: 42, hires: 3, conversionRate: 7.1 },
            { department: 'Sales', applications: 21, hires: 2, conversionRate: 9.5 }
          ],
          timeToHire: {
            average: 28,
            byStage: [
              { stage: 'Application to Screening', days: 3 },
              { stage: 'Screening to Interview', days: 7 },
              { stage: 'Interview to Assessment', days: 5 },
              { stage: 'Assessment to Offer', days: 8 },
              { stage: 'Offer to Hire', days: 5 }
            ]
          }
        };
      
      case 'jobs':
        return {
          jobs: [
            { id: '1', title: 'Frontend Developer', applications: 78, interviews: 24, offers: 6, hires: 4, timeToFill: 32, conversionRate: 5.1 },
            { id: '2', title: 'Backend Engineer', applications: 64, interviews: 18, offers: 5, hires: 3, timeToFill: 28, conversionRate: 4.7 },
            { id: '3', title: 'Product Manager', applications: 42, interviews: 12, offers: 3, hires: 2, timeToFill: 35, conversionRate: 4.8 },
            { id: '4', title: 'UX Designer', applications: 56, interviews: 16, offers: 4, hires: 3, timeToFill: 26, conversionRate: 5.4 },
            { id: '5', title: 'DevOps Engineer', applications: 38, interviews: 10, offers: 3, hires: 2, timeToFill: 30, conversionRate: 5.3 },
            { id: '6', title: 'Data Scientist', applications: 45, interviews: 14, offers: 4, hires: 2, timeToFill: 33, conversionRate: 4.4 },
            { id: '7', title: 'QA Engineer', applications: 32, interviews: 9, offers: 2, hires: 1, timeToFill: 29, conversionRate: 3.1 },
            { id: '8', title: 'Technical Writer', applications: 28, interviews: 8, offers: 2, hires: 2, timeToFill: 24, conversionRate: 7.1 }
          ],
          departmentPerformance: [
            { department: 'Engineering', openings: 5, applications: 257, hires: 12, avgTimeToFill: 30 },
            { department: 'Product', openings: 2, applications: 87, hires: 4, avgTimeToFill: 35 },
            { department: 'Design', openings: 2, applications: 84, hires: 5, avgTimeToFill: 26 },
            { department: 'Marketing', openings: 1, applications: 42, hires: 3, avgTimeToFill: 24 }
          ],
          locationPerformance: [
            { location: 'San Francisco', openings: 4, applications: 165, hires: 8, avgTimeToFill: 32 },
            { location: 'New York', openings: 3, applications: 142, hires: 7, avgTimeToFill: 28 },
            { location: 'Remote', openings: 3, applications: 163, hires: 9, avgTimeToFill: 25 }
          ],
          monthlyTrends: [
            { month: 'May 2025', applications: 82, hires: 4 },
            { month: 'Jun 2025', applications: 94, hires: 5 },
            { month: 'Jul 2025', applications: 78, hires: 3 },
            { month: 'Aug 2025', applications: 105, hires: 6 },
            { month: 'Sep 2025', applications: 124, hires: 8 }
          ]
        };
      
      case 'interviews':
        return {
          metrics: [
            { interviewer: 'John Smith', conducted: 24, passRate: 62.5, avgScore: 7.8, avgDuration: 48 },
            { interviewer: 'Emily Johnson', conducted: 18, passRate: 72.2, avgScore: 8.2, avgDuration: 52 },
            { interviewer: 'Michael Brown', conducted: 16, passRate: 68.8, avgScore: 7.6, avgDuration: 45 },
            { interviewer: 'Sarah Davis', conducted: 22, passRate: 59.1, avgScore: 7.2, avgDuration: 50 },
            { interviewer: 'David Wilson', conducted: 20, passRate: 65.0, avgScore: 7.5, avgDuration: 47 },
            { interviewer: 'Jennifer Lee', conducted: 15, passRate: 73.3, avgScore: 8.4, avgDuration: 42 },
            { interviewer: 'Robert Taylor', conducted: 19, passRate: 63.2, avgScore: 7.3, avgDuration: 55 },
            { interviewer: 'Lisa Anderson', conducted: 21, passRate: 66.7, avgScore: 7.7, avgDuration: 46 }
          ],
          feedbackDistribution: [
            { rating: 'Definitely Yes', count: 28 },
            { rating: 'Yes', count: 42 },
            { rating: 'No', count: 32 },
            { rating: 'Definitely No', count: 18 }
          ],
          skillAssessments: [
            { skill: 'Technical Knowledge', avgScore: 7.6, interviewCount: 98 },
            { skill: 'Problem Solving', avgScore: 7.2, interviewCount: 98 },
            { skill: 'Communication', avgScore: 7.8, interviewCount: 98 },
            { skill: 'Cultural Fit', avgScore: 8.1, interviewCount: 98 },
            { skill: 'Leadership', avgScore: 6.9, interviewCount: 64 }
          ],
          interviewStages: [
            { stage: 'Technical Screen', avgDuration: 45, passRate: 68.4, interviewCount: 98 },
            { stage: 'Coding Challenge', avgDuration: 60, passRate: 72.1, interviewCount: 86 },
            { stage: 'System Design', avgDuration: 55, passRate: 64.8, interviewCount: 54 },
            { stage: 'Behavioral', avgDuration: 50, passRate: 82.3, interviewCount: 62 },
            { stage: 'Final Panel', avgDuration: 90, passRate: 76.5, interviewCount: 34 }
          ],
          monthlyTrends: [
            { month: 'May 2025', interviews: 32, passRate: 65.6 },
            { month: 'Jun 2025', interviews: 38, passRate: 63.2 },
            { month: 'Jul 2025', interviews: 28, passRate: 67.9 },
            { month: 'Aug 2025', interviews: 42, passRate: 69.0 },
            { month: 'Sep 2025', interviews: 45, passRate: 71.1 }
          ]
        };
      
      case 'sources':
        return {
          sources: [
            { source: 'LinkedIn', applications: 124, qualifiedCandidates: 68, hires: 8, costPerHire: 1200, conversionRate: 6.5 },
            { source: 'Indeed', applications: 86, qualifiedCandidates: 42, hires: 5, costPerHire: 950, conversionRate: 5.8 },
            { source: 'Referrals', applications: 48, qualifiedCandidates: 32, hires: 6, costPerHire: 500, conversionRate: 12.5 },
            { source: 'Company Website', applications: 64, qualifiedCandidates: 28, hires: 3, costPerHire: 800, conversionRate: 4.7 },
            { source: 'Job Fairs', applications: 32, qualifiedCandidates: 14, hires: 2, costPerHire: 1500, conversionRate: 6.3 },
            { source: 'Glassdoor', applications: 52, qualifiedCandidates: 24, hires: 3, costPerHire: 1100, conversionRate: 5.8 },
            { source: 'AngelList', applications: 38, qualifiedCandidates: 18, hires: 2, costPerHire: 950, conversionRate: 5.3 },
            { source: 'University Recruiting', applications: 45, qualifiedCandidates: 22, hires: 3, costPerHire: 850, conversionRate: 6.7 }
          ],
          costAnalysis: [
            { source: 'LinkedIn', totalSpend: 9600, costPerApplication: 77.4, costPerQualifiedCandidate: 141.2 },
            { source: 'Indeed', totalSpend: 4750, costPerApplication: 55.2, costPerQualifiedCandidate: 113.1 },
            { source: 'Referrals', totalSpend: 3000, costPerApplication: 62.5, costPerQualifiedCandidate: 93.8 },
            { source: 'Company Website', totalSpend: 2400, costPerApplication: 37.5, costPerQualifiedCandidate: 85.7 },
            { source: 'Job Fairs', totalSpend: 3000, costPerApplication: 93.8, costPerQualifiedCandidate: 214.3 },
            { source: 'Glassdoor', totalSpend: 3300, costPerApplication: 63.5, costPerQualifiedCandidate: 137.5 },
            { source: 'AngelList', totalSpend: 1900, costPerApplication: 50.0, costPerQualifiedCandidate: 105.6 },
            { source: 'University Recruiting', totalSpend: 2550, costPerApplication: 56.7, costPerQualifiedCandidate: 115.9 }
          ],
          qualityMetrics: [
            { source: 'LinkedIn', avgTimeToHire: 32, offerAcceptanceRate: 72, retentionRate6Month: 86 },
            { source: 'Indeed', avgTimeToHire: 28, offerAcceptanceRate: 68, retentionRate6Month: 82 },
            { source: 'Referrals', avgTimeToHire: 24, offerAcceptanceRate: 92, retentionRate6Month: 94 },
            { source: 'Company Website', avgTimeToHire: 30, offerAcceptanceRate: 76, retentionRate6Month: 88 },
            { source: 'Job Fairs', avgTimeToHire: 26, offerAcceptanceRate: 78, retentionRate6Month: 85 },
            { source: 'Glassdoor', avgTimeToHire: 29, offerAcceptanceRate: 70, retentionRate6Month: 84 },
            { source: 'AngelList', avgTimeToHire: 27, offerAcceptanceRate: 75, retentionRate6Month: 80 },
            { source: 'University Recruiting', avgTimeToHire: 34, offerAcceptanceRate: 85, retentionRate6Month: 82 }
          ],
          monthlyTrends: [
            { month: 'May 2025', applications: { linkedin: 22, indeed: 18, referrals: 8, website: 12, jobFairs: 5, other: 24 } },
            { month: 'Jun 2025', applications: { linkedin: 26, indeed: 16, referrals: 10, website: 14, jobFairs: 6, other: 28 } },
            { month: 'Jul 2025', applications: { linkedin: 20, indeed: 14, referrals: 9, website: 10, jobFairs: 4, other: 22 } },
            { month: 'Aug 2025', applications: { linkedin: 28, indeed: 20, referrals: 12, website: 16, jobFairs: 8, other: 30 } },
            { month: 'Sep 2025', applications: { linkedin: 32, indeed: 22, referrals: 14, website: 18, jobFairs: 9, other: 36 } }
          ]
        };
      
      default:
        return {};
    }
  }
};

export default analyticsService;
