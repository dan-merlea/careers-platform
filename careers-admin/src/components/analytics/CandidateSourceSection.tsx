import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../pages/analytics/AnalyticsPage';
import analyticsService, { SourceMetric } from '../../services/analyticsService';
import Card from '../common/Card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  PieChart, Pie, Cell
} from 'recharts';

interface CandidateSourceSectionProps {
  filters: FilterParams;
}

// Make it compatible with recharts by allowing any string key
interface PieChartData {
  name: string;
  value: number;
  [key: string]: any;
}

// TODO(ROI): When ROI per hire is implemented, restore ROIChartData and related UI
// interface ROIChartData {
//   name: string;
//   costPerHire: number;
//   conversionRate: number;
//   [key: string]: any;
// }

const CandidateSourceSection: React.FC<CandidateSourceSectionProps> = ({ filters }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [sourceData, setSourceData] = useState<SourceMetric[]>([]);
  const [costAnalysis, setCostAnalysis] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  
  // Colors for charts
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe'];
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the real API endpoint
        const data = await analyticsService.getCandidateSourceAnalytics(filters);
        
        if (data && data.sources) {
          setSourceData(data.sources);
        } else {
          setSourceData([]);
        }
        
        // If the API returns these additional properties, use them
        // Otherwise initialize with empty arrays
        if (data && (data as any).costAnalysis) {
          setCostAnalysis((data as any).costAnalysis);
        } else {
          setCostAnalysis([]);
        }
        
        if (data && (data as any).qualityMetrics) {
          setQualityMetrics((data as any).qualityMetrics);
        } else {
          setQualityMetrics([]);
        }
        
        if (data && (data as any).monthlyTrends) {
          setMonthlyTrends((data as any).monthlyTrends);
        } else {
          setMonthlyTrends([]);
        }
      } catch (err) {
        console.error('Error fetching candidate source data:', err);
        setError('Failed to load candidate source data. Please try again.');
        
        // Initialize with empty data
        setSourceData([]);
        setCostAnalysis([]);
        setQualityMetrics([]);
        setMonthlyTrends([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Format data for pie chart
  const pieData: PieChartData[] = sourceData.map(source => ({
    name: source.source,
    value: source.applications
  }));

  // TODO(ROI): Restore ROI chart data mapping when backend provides costPerHire reliably
  // const roiData: ROIChartData[] = sourceData.map(source => ({
  //   name: source.source,
  //   costPerHire: source.costPerHire,
  //   conversionRate: source.conversionRate,
  // }));

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

  return (
    <div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Applications by Source */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Applications by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sourceData}
                margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                barSize={20}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="source" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications" name="Applications" fill="#3b82f6" />
                <Bar dataKey="qualifiedCandidates" name="Qualified Candidates" fill="#60a5fa" />
                <Bar dataKey="hires" name="Hires" fill="#93c5fd" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Application Distribution */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Application Distribution</h3>
          <div className="h-80 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label={(props: any) => {
                    const { x, y, name, value } = props;
                    return (
                      <text x={x} y={y} fill="#000" textAnchor="middle" dominantBaseline="middle">
                        {`${name}: ${value}`}
                      </text>
                    );
                  }}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => 
                    [value, props.payload.name]
                  } 
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      {/* TODO(ROI): Source ROI Analysis panel removed temporarily until ROI/cost data is finalized */}
      
      {/* Quality Metrics */}
      {qualityMetrics.length > 0 ? (
        <Card className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Quality Metrics by Source</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {qualityMetrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                <h4 className="text-lg font-medium text-gray-800 mb-2">{metric.source}</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <div className="text-sm text-gray-500">Avg. Time to Hire (days)</div>
                    <div className="text-xl font-semibold text-gray-800">{metric.avgTimeToHire}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">Offer Acceptance Rate (%)</div>
                    <div className="text-xl font-semibold text-gray-800">{metric.offerAcceptanceRate}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500">6-Month Retention Rate (%)</div>
                    <div className="text-xl font-semibold text-gray-800">{metric.retentionRate6Month}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ) : (
        <Card className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Quality Metrics by Source</h3>
          <p className="text-sm text-gray-500">
            No quality metrics available for this period or filters. {/* TODO: Provide real quality metrics from backend when ready */}
          </p>
        </Card>
      )}
      
      {/* Monthly Trends */}
      {monthlyTrends.length > 0 ? (
        <Card className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Application Trends by Source</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyTrends}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="applications.linkedin" stackId="a" name="LinkedIn" fill="#0077B5" />
                <Bar dataKey="applications.indeed" stackId="a" name="Indeed" fill="#2164f4" />
                <Bar dataKey="applications.referrals" stackId="a" name="Referrals" fill="#10b981" />
                <Bar dataKey="applications.website" stackId="a" name="Website" fill="#f59e0b" />
                <Bar dataKey="applications.jobFairs" stackId="a" name="Job Fairs" fill="#ef4444" />
                <Bar dataKey="applications.other" stackId="a" name="Other" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      ) : (
        <Card className="mb-8">
          <h3 className="text-lg font-medium text-gray-800 mb-2">Monthly Application Trends by Source</h3>
          <p className="text-sm text-gray-500">
            No monthly trend data available. {/* TODO: Return monthly source trends from backend when ready */}
          </p>
        </Card>
      )}
      
      {/* Source Metrics Table */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Source Metrics</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Applications
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Qualified Candidates
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Hires
                </th>
                {/* TODO(ROI): Re-add Cost per Hire column when backend provides reliable values */}
                {/* <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Cost per Hire
                </th> */}
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Conversion Rate
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sourceData.map((source) => (
                <tr key={source.source} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {source.source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.qualifiedCandidates ?? 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {source.hires}
                  </td>
                  {/* TODO(ROI): Re-add cost per hire cell once available */}
                  {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${source.costPerHire}
                  </td> */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="w-16 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${source.conversionRate}%` }}
                        ></div>
                      </div>
                      <span>{source.conversionRate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Source Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Best Performing Sources */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Best Performing Sources</h3>
          <div className="space-y-4">
            {sourceData
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .slice(0, 3)
              .map((source, index) => (
                <div key={source.source} className="bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">
                      {source.source}
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      {source.conversionRate}% conversion
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {source.hires} hires from {source.applications} applications
                  </p>
                </div>
              ))}
          </div>
        </Card>
        
        {/* TODO(ROI): Cost-Effective Sources panel removed until cost per hire is available */}
        {/* <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Most Cost-Effective Sources</h3>
          <div className="space-y-4">
            {sourceData
              .sort((a, b) => a.costPerHire - b.costPerHire)
              .slice(0, 3)
              .map((source, index) => (
                <div key={source.source} className="bg-blue-50 border-l-4 border-blue-400 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-blue-800">
                      {source.source}
                    </span>
                    <span className="text-sm font-semibold text-blue-800">
                      ${source.costPerHire} per hire
                    </span>
                  </div>
                  <p className="text-xs text-blue-700 mt-1">
                    {source.hires} hires with {source.conversionRate}% conversion rate
                  </p>
                </div>
              ))}
          </div>
        </div> */}
      
      {/* Recommendations */}
      {/* <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      //   <h3 className="text-lg font-medium text-gray-800 mb-4">Recommendations</h3>
      //   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      //     <div>
      //       <h4 className="text-sm font-medium text-gray-700 mb-3">Optimize Recruitment Budget</h4>
      //       <ul className="space-y-2 text-sm text-gray-600">
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Increase investment in referral programs (highest conversion rate)
      //         </li>
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Reduce spending on job fairs (highest cost per hire)
      //         </li>
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Optimize LinkedIn job postings to improve conversion rates
      //         </li>
      //       </ul>
      //     </div>
      //     <div>
      //       <h4 className="text-sm font-medium text-gray-700 mb-3">Improve Candidate Quality</h4>
      //       <ul className="space-y-2 text-sm text-gray-600">
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Refine job descriptions on Indeed to attract more qualified candidates
      //         </li>
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Enhance company website career page to improve direct application quality
      //         </li>
      //         <li className="flex items-start">
      //           <span className="inline-flex items-center justify-center h-5 w-5 rounded-full bg-blue-100 text-blue-500 mr-2 flex-shrink-0">
      //             <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
      //               <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
      //             </svg>
      //           </span>
      //           Implement pre-screening questions to filter candidates more effectively
      //         </li>
      //       </ul>
      //     </div>
      //   </div>
      </div> */}
      </div>
    </div>
  );
};

export default CandidateSourceSection;
