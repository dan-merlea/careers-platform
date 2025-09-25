import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../pages/AnalyticsPage';
import analyticsService, { KpiMetric } from '../../services/analyticsService';
import MetricCard from './MetricCard';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

interface OverviewSectionProps {
  filters: FilterParams;
}

interface ApplicationTrendData {
  date: string;
  count: number;
}

interface TopJobData {
  title: string;
  applications: number;
  conversionRate: number;
}

interface SourceEffectivenessData {
  source: string;
  applications: number;
  conversionRate: number;
}

// Extended dashboard response interface
interface ExtendedDashboardResponse {
  kpis: KpiMetric[];
  applicationTrend: ApplicationTrendData[];
  topJobs: TopJobData[];
  sourceEffectiveness: SourceEffectivenessData[];
}

const OverviewSection: React.FC<OverviewSectionProps> = ({ filters }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [kpis, setKpis] = useState<KpiMetric[]>([]);
  const [applicationTrend, setApplicationTrend] = useState<ApplicationTrendData[]>([]);
  const [topJobs, setTopJobs] = useState<TopJobData[]>([]);
  const [sourceEffectiveness, setSourceEffectiveness] = useState<SourceEffectivenessData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the real API endpoint
        const data = await analyticsService.getDashboardMetrics(filters) as ExtendedDashboardResponse;
        
        if (data && data.kpis) {
          setKpis(data.kpis);
        } else {
          setKpis([]);
        }
        
        if (data && data.applicationTrend) {
          setApplicationTrend(data.applicationTrend);
        } else {
          setApplicationTrend([]);
        }
        
        // Get top jobs and source effectiveness data
        if (data && data.topJobs) {
          setTopJobs(data.topJobs);
        } else {
          setTopJobs([]);
        }
        
        if (data && data.sourceEffectiveness) {
          setSourceEffectiveness(data.sourceEffectiveness);
        } else {
          setSourceEffectiveness([]);
        }
      } catch (err) {
        console.error('Error fetching dashboard metrics:', err);
        setError('Failed to load dashboard metrics. Please try again.');
        
        // Initialize with empty data instead of mock data
        setKpis([]);
        setApplicationTrend([]);
        setTopJobs([]);
        setSourceEffectiveness([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {kpis.map((metric, index) => (
          <MetricCard key={index} metric={metric} />
        ))}
      </div>
      
      {/* Application Trend Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Application Trend</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={applicationTrend}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tickFormatter={(date: string) => {
                  const d = new Date(date);
                  return `${d.getMonth() + 1}/${d.getDate()}`;
                }}
              />
              <YAxis />
              <Tooltip 
                formatter={(value: number) => [`${value} applications`, 'Applications']}
                labelFormatter={(label: string) => {
                  const d = new Date(label);
                  return d.toLocaleDateString();
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="count" 
                name="Applications" 
                stroke="#3b82f6" 
                activeDot={{ r: 8 }} 
                strokeWidth={2}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Performing Jobs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Performing Jobs</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job Title
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Applications
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {topJobs.length > 0 ? (
                  topJobs.map((job, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {job.title}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {job.conversionRate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No job data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Source Effectiveness */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Source Effectiveness</h3>
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
                    Conversion Rate
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sourceEffectiveness.length > 0 ? (
                  sourceEffectiveness.map((source, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {source.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.applications}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {source.conversionRate}%
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-sm text-gray-500">
                      No source data available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OverviewSection;
