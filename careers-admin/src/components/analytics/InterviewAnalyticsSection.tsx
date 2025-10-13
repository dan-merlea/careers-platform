import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../pages/analytics/AnalyticsPage';
import analyticsService, { InterviewMetric, SkillAssessment, InterviewStage, InterviewTrend } from '../../services/analyticsService';
import Card from '../common/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  LineChart, Line, AreaChart, Area
} from 'recharts';
import { ArrowUpIcon, ArrowDownIcon, MinusIcon } from '@heroicons/react/24/solid';

interface InterviewAnalyticsSectionProps {
  filters: FilterParams;
}

// Make it compatible with recharts by allowing any string key
interface FeedbackDistributionItem {
  rating: string;
  count: number;
  [key: string]: any;
}

interface RadarDataItem {
  interviewer: string;
  conducted: number;
  passRate: number;
  avgScore: number;
  avgDuration: number;
}

const InterviewAnalyticsSection: React.FC<InterviewAnalyticsSectionProps> = ({ filters }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewMetric[]>([]);
  const [feedbackDistribution, setFeedbackDistribution] = useState<FeedbackDistributionItem[]>([]);
  const [skillAssessments, setSkillAssessments] = useState<any[]>([]);
  const [interviewStages, setInterviewStages] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'];
  const RADAR_COLORS = {
    conducted: '#3b82f6',
    passRate: '#10b981',
    avgScore: '#f59e0b',
    avgDuration: '#ef4444'
  };
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the real API endpoint
        const data = await analyticsService.getInterviewAnalytics(filters);
        
        if (data && data.metrics) {
          setInterviewData(data.metrics);
        } else {
          setInterviewData([]);
        }
        
        if (data && data.feedbackDistribution) {
          setFeedbackDistribution(data.feedbackDistribution as FeedbackDistributionItem[]);
        } else {
          setFeedbackDistribution([]);
        }
        
        // If the API returns these additional properties, use them
        // Otherwise initialize with empty arrays
        if (data && (data as any).skillAssessments) {
          setSkillAssessments((data as any).skillAssessments);
        } else {
          setSkillAssessments([]);
        }
        
        if (data && (data as any).interviewStages) {
          setInterviewStages((data as any).interviewStages);
        } else {
          setInterviewStages([]);
        }
        
        if (data && (data as any).monthlyTrends) {
          setMonthlyTrends((data as any).monthlyTrends);
        } else {
          setMonthlyTrends([]);
        }
      } catch (err) {
        console.error('Error fetching interview analytics data:', err);
        setError('Failed to load interview analytics data. Please try again.');
        
        // Initialize with empty data
        setInterviewData([]);
        setFeedbackDistribution([]);
        setSkillAssessments([]);
        setInterviewStages([]);
        setMonthlyTrends([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Format data for radar chart
  const radarData: RadarDataItem[] = interviewData.map(interviewer => ({
    interviewer: interviewer.interviewer,
    conducted: normalizeValue(interviewer.conducted, 'conducted'),
    passRate: normalizeValue(interviewer.passRate, 'passRate'),
    avgScore: normalizeValue(interviewer.avgScore, 'avgScore'),
    avgDuration: normalizeValue(interviewer.avgDuration, 'avgDuration', true)
  }));

  // Normalize values for radar chart (0-100 scale)
  function normalizeValue(value: number, metric: string, invert: boolean = false): number {
    const maxValues = {
      conducted: Math.max(...interviewData.map(i => i.conducted)),
      passRate: 100, // Already a percentage
      avgScore: 10,  // Assuming 10-point scale
      avgDuration: Math.max(...interviewData.map(i => i.avgDuration))
    };
    
    const normalized = (value / maxValues[metric as keyof typeof maxValues]) * 100;
    
    // For metrics where lower is better (like duration), invert the scale
    return invert ? 100 - normalized : normalized;
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    );
  }

  // Calculate summary metrics
  const calculateSummaryMetrics = () => {
    if (!interviewData.length) return {
      totalInterviews: 0,
      avgPassRate: 0,
      avgScore: 0,
      avgDuration: 0
    };

    const totalInterviews = interviewData.reduce((sum, item) => sum + item.conducted, 0);
    const weightedPassRate = interviewData.reduce((sum, item) => sum + (item.passRate * item.conducted), 0);
    const weightedScore = interviewData.reduce((sum, item) => sum + (item.avgScore * item.conducted), 0);
    const weightedDuration = interviewData.reduce((sum, item) => sum + (item.avgDuration * item.conducted), 0);

    return {
      totalInterviews,
      avgPassRate: totalInterviews > 0 ? Math.round((weightedPassRate / totalInterviews) * 10) / 10 : 0,
      avgScore: totalInterviews > 0 ? Math.round((weightedScore / totalInterviews) * 10) / 10 : 0,
      avgDuration: totalInterviews > 0 ? Math.round(weightedDuration / totalInterviews) : 0
    };
  };

  const summaryMetrics = calculateSummaryMetrics();

  return (
    <div>
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Interviews</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.totalInterviews}</p>
            <div className="p-2 bg-blue-100 rounded-full">
              <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Pass Rate</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.avgPassRate}%</p>
            <div className="p-2 bg-green-100 rounded-full">
              <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.avgScore}/10</p>
            <div className="p-2 bg-yellow-100 rounded-full">
              <svg className="h-5 w-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card>
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Duration</h3>
          <div className="flex items-center justify-between">
            <p className="text-2xl font-bold text-gray-800">{summaryMetrics.avgDuration} min</p>
            <div className="p-2 bg-purple-100 rounded-full">
              <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Interviewer Performance */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Interviewer Performance</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={interviewData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="interviewer" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="conducted" name="Interviews Conducted" fill="#3b82f6" />
                <Bar dataKey="passRate" name="Pass Rate (%)" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Feedback Distribution */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Feedback Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={feedbackDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                  nameKey="rating"
                  label={(props: any) => {
                    const { x, y, name, value } = props;
                    return (
                      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="middle">
                        {`${name}: ${value}`}
                      </text>
                    );
                  }}
                >
                  {feedbackDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => 
                    [value, props.payload.rating]
                  } 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* Skill Assessments */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Skill Assessments</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={skillAssessments}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" domain={[0, 10]} />
                <YAxis dataKey="skill" type="category" width={150} />
                <Tooltip formatter={(value) => [`${value}/10`, 'Score']} />
                <Legend />
                <Bar dataKey="avgScore" name="Average Score" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="h-80">
            {skillAssessments.length > 0 && (
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillAssessments}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="skill" />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} />
                  <Radar
                    name="Average Score"
                    dataKey="avgScore"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.6}
                  />
                  <Tooltip formatter={(value) => [`${value}/10`, 'Score']} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Average candidate scores across different skill areas assessed during interviews
        </p>
      </Card>
      
      {/* Interview Stages */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Interview Stages Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={interviewStages}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="stage" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="avgDuration" name="Avg. Duration (min)" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="passRate" name="Pass Rate (%)" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Monthly Trends */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Interview Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={monthlyTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" domain={[0, 100]} />
              <Tooltip formatter={(value, name) => [
                name === 'Pass Rate (%)' ? `${value}%` : value,
                name
              ]} />
              <Legend />
              <Line 
                yAxisId="left" 
                type="monotone" 
                dataKey="interviews" 
                name="Interviews" 
                stroke="#3b82f6" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                yAxisId="right" 
                type="monotone" 
                dataKey="passRate" 
                name="Pass Rate (%)" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Trend analysis of interview volume and pass rates over time
        </p>
      </Card>
      
      {/* Interviewer Metrics Table */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Interviewer Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interviewer
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Interviews Conducted
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pass Rate
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Score
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Avg. Duration (min)
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interviewData.map((interviewer) => (
                <tr key={interviewer.interviewer} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {interviewer.interviewer}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interviewer.conducted}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${interviewer.passRate}%` }}
                        ></div>
                      </div>
                      <span>{interviewer.passRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interviewer.avgScore.toFixed(1)}/10
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {interviewer.avgDuration}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Interviewer Comparison */}
      <Card>
        <h3 className="text-lg font-medium text-gray-800 mb-4">Interviewer Comparison</h3>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
              <PolarGrid />
              <PolarAngleAxis dataKey="interviewer" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} />
              <Radar 
                name="Interviews Conducted" 
                dataKey="conducted" 
                stroke={RADAR_COLORS.conducted} 
                fill={RADAR_COLORS.conducted} 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Pass Rate" 
                dataKey="passRate" 
                stroke={RADAR_COLORS.passRate} 
                fill={RADAR_COLORS.passRate} 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Avg. Score" 
                dataKey="avgScore" 
                stroke={RADAR_COLORS.avgScore} 
                fill={RADAR_COLORS.avgScore} 
                fillOpacity={0.6} 
              />
              <Radar 
                name="Efficiency (inv. duration)" 
                dataKey="avgDuration" 
                stroke={RADAR_COLORS.avgDuration} 
                fill={RADAR_COLORS.avgDuration} 
                fillOpacity={0.6} 
              />
              <Legend />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Note: All metrics are normalized to a 0-100 scale for comparison. For duration, lower values are better.
        </p>
      </Card>
      
      {/* Interview Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Top Performers */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Interviewers</h3>
          <div className="space-y-4">
            {interviewData
              .sort((a, b) => b.passRate - a.passRate)
              .slice(0, 3)
              .map((interviewer, index) => (
                <div key={interviewer.interviewer} className="bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">
                      {interviewer.interviewer}
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      {interviewer.passRate}% pass rate
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    Conducted {interviewer.conducted} interviews with avg. score {interviewer.avgScore.toFixed(1)}/10
                  </p>
                </div>
              ))}
          </div>
        </Card>
        
        {/* Recommendations - commented out */}
        {/* <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recommendations</h3>
          <ul className="space-y-3 text-sm text-gray-600">
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Balance interview load more evenly across team members
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Consider interview training for team members with lower pass rates
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Review interview scoring consistency across interviewers
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Optimize interview duration to improve candidate experience
            </li>
            <li className="flex items-start">
              <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
                <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </span>
              Implement structured interview templates to standardize evaluation
            </li>
          </ul>
        </Card> */}
      </div>
    </div>
  );
};

export default InterviewAnalyticsSection;
