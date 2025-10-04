import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../pages/AnalyticsPage';
import analyticsService, { JobPerformance } from '../../services/analyticsService';
import Card from '../common/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface JobPerformanceSectionProps {
  filters: FilterParams;
}

interface ChartData {
  name: string;
  Applications: number;
  Interviews: number;
  Offers: number;
  Hires: number;
}

const JobPerformanceSection: React.FC<JobPerformanceSectionProps> = ({ filters }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [jobsData, setJobsData] = useState<JobPerformance[]>([]);
  const [departmentPerformance, setDepartmentPerformance] = useState<any[]>([]);
  const [locationPerformance, setLocationPerformance] = useState<any[]>([]);
  const [monthlyTrends, setMonthlyTrends] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string>('applications');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the real API endpoint
        const data = await analyticsService.getJobPerformance(filters);
        
        if (data && data.jobs) {
          setJobsData(data.jobs);
        } else {
          setJobsData([]);
        }
        
        // If the API returns these additional properties, use them
        // Otherwise initialize with empty arrays
        if (data && (data as any).departmentPerformance) {
          setDepartmentPerformance((data as any).departmentPerformance);
        } else {
          setDepartmentPerformance([]);
        }
        
        if (data && (data as any).locationPerformance) {
          setLocationPerformance((data as any).locationPerformance);
        } else {
          setLocationPerformance([]);
        }
        
        if (data && (data as any).monthlyTrends) {
          setMonthlyTrends((data as any).monthlyTrends);
        } else {
          setMonthlyTrends([]);
        }
      } catch (err) {
        console.error('Error fetching job performance data:', err);
        setError('Failed to load job performance data. Please try again.');
        
        // Initialize with empty data
        setJobsData([]);
        setDepartmentPerformance([]);
        setLocationPerformance([]);
        setMonthlyTrends([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Sort jobs data
  const sortedJobs = [...jobsData].sort((a, b) => {
    const fieldA = a[sortField as keyof JobPerformance];
    const fieldB = b[sortField as keyof JobPerformance];
    
    if (typeof fieldA === 'number' && typeof fieldB === 'number') {
      return sortDirection === 'asc' ? fieldA - fieldB : fieldB - fieldA;
    }
    
    return 0;
  });

  // Handle sort change
  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Format chart data for applications, interviews, offers
  const chartData: ChartData[] = jobsData.map(job => ({
    name: job.title,
    Applications: job.applications,
    Interviews: job.interviews ?? 0,
    Offers: job.offers ?? 0,
    Hires: job.hires ?? 0,
  }));

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
      {/* Job Performance Chart */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Job Performance Metrics</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Applications" stackId="a" fill="#3b82f6" />
              <Bar dataKey="Interviews" stackId="a" fill="#60a5fa" />
              <Bar dataKey="Offers" stackId="a" fill="#93c5fd" />
              <Bar dataKey="Hires" stackId="a" fill="#bfdbfe" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Department Performance */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Department Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentPerformance}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
              barSize={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="department" 
                angle={-45}
                textAnchor="end"
                height={70}
                tick={{ fontSize: 12 }}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="applications" name="Applications" fill="#3b82f6" />
              <Bar dataKey="hires" name="Hires" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Location Performance */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Location Performance</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {locationPerformance.map((location, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
              <h4 className="text-lg font-medium text-gray-800 mb-2">{location.location}</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-500">Openings</div>
                  <div className="text-xl font-semibold text-gray-800">{location.openings}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Applications</div>
                  <div className="text-xl font-semibold text-gray-800">{location.applications}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Hires</div>
                  <div className="text-xl font-semibold text-gray-800">{location.hires}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-500">Avg. Time to Fill</div>
                  <div className="text-xl font-semibold text-gray-800">{location.avgTimeToFill} days</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
      
      {/* Monthly Trends */}
      <Card className="mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Trends</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={monthlyTrends}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis yAxisId="left" orientation="left" stroke="#3b82f6" />
              <YAxis yAxisId="right" orientation="right" stroke="#10b981" />
              <Tooltip />
              <Legend />
              <Bar yAxisId="left" dataKey="applications" name="Applications" fill="#3b82f6" />
              <Bar yAxisId="right" dataKey="hires" name="Hires" fill="#10b981" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      
      {/* Job Performance Table */}
      <Card>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-800">Job Performance Details</h3>
          <div className="flex items-center">
            <span className="text-sm text-gray-500 mr-2">Sort by:</span>
            <select 
              className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
              value={sortField}
              onChange={(e) => handleSort(e.target.value)}
            >
              <option value="applications">Applications</option>
              <option value="interviews">Interviews</option>
              <option value="offers">Offers</option>
              <option value="hires">Hires</option>
              <option value="timeToFill">Time to Fill</option>
              <option value="conversionRate">Conversion Rate</option>
            </select>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Job Title
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('applications')}
                >
                  <div className="flex items-center">
                    Applications
                    {sortField === 'applications' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('interviews')}
                >
                  <div className="flex items-center">
                    Interviews
                    {sortField === 'interviews' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('offers')}
                >
                  <div className="flex items-center">
                    Offers
                    {sortField === 'offers' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('hires')}
                >
                  <div className="flex items-center">
                    Hires
                    {sortField === 'hires' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('timeToFill')}
                >
                  <div className="flex items-center">
                    Time to Fill
                    {sortField === 'timeToFill' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
                <th 
                  scope="col" 
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('conversionRate')}
                >
                  <div className="flex items-center">
                    Conversion Rate
                    {sortField === 'conversionRate' && (
                      sortDirection === 'asc' ? 
                        <ArrowUpIcon className="h-4 w-4 ml-1" /> : 
                        <ArrowDownIcon className="h-4 w-4 ml-1" />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sortedJobs.map((job) => (
                <tr key={job.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {job.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.applications}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.interviews}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.offers}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.hires}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.timeToFill} days
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {job.conversionRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Job Performance Insights */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Best Performing Jobs */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Best Performing Jobs</h3>
          <div className="space-y-4">
            {sortedJobs
              .sort((a, b) => b.conversionRate - a.conversionRate)
              .slice(0, 3)
              .map((job, index) => (
                <div key={job.id} className="bg-green-50 border-l-4 border-green-400 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-green-800">
                      {job.title}
                    </span>
                    <span className="text-sm font-semibold text-green-800">
                      {job.conversionRate}% conversion
                    </span>
                  </div>
                  <p className="text-xs text-green-700 mt-1">
                    {job.hires} hires from {job.applications} applications
                  </p>
                </div>
              ))}
          </div>
        </Card>
        
        {/* Jobs Needing Attention */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Jobs Needing Attention</h3>
          <div className="space-y-4">
            {sortedJobs
              .sort((a, b) => a.conversionRate - b.conversionRate)
              .slice(0, 3)
              .map((job, index) => (
                <div key={job.id} className="bg-amber-50 border-l-4 border-amber-400 p-3">
                  <div className="flex justify-between">
                    <span className="text-sm font-medium text-amber-800">
                      {job.title}
                    </span>
                    <span className="text-sm font-semibold text-amber-800">
                      {job.conversionRate}% conversion
                    </span>
                  </div>
                  <p className="text-xs text-amber-700 mt-1">
                    Long time-to-fill: {job.timeToFill} days
                  </p>
                </div>
              ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default JobPerformanceSection;
