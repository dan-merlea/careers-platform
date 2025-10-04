import React, { useState, useEffect } from 'react';
import { FilterParams } from '../../pages/AnalyticsPage';
import analyticsService, { FunnelStage } from '../../services/analyticsService';
import Card from '../common/Card';
import { FunnelChart, Funnel, Cell, Tooltip, ResponsiveContainer, LabelList, BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';

interface RecruitmentFunnelSectionProps {
  filters: FilterParams;
}

const RecruitmentFunnelSection: React.FC<RecruitmentFunnelSectionProps> = ({ filters }) => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [departmentBreakdown, setDepartmentBreakdown] = useState<any[]>([]);
  const [timeToHire, setTimeToHire] = useState<any>({});
  
  // Colors for funnel stages
  const COLORS = ['#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe', '#eff6ff'];
  
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Call the real API endpoint
        const data = await analyticsService.getRecruitmentFunnel(filters);
        
        if (data && data.stages) {
          const normalized = normalizeFunnelData(data.stages as FunnelStage[]);
          setFunnelData(normalized);
        } else {
          setFunnelData([]);
        }
        
        if (data && data.departmentBreakdown) {
          setDepartmentBreakdown(data.departmentBreakdown);
        } else {
          setDepartmentBreakdown([]);
        }
        
        if (data && data.timeToHire) {
          setTimeToHire(data.timeToHire);
        } else {
          setTimeToHire({ average: 0, byStage: [] });
        }
      } catch (err) {
        console.error('Error fetching recruitment funnel data:', err);
        setError('Failed to load recruitment funnel data. Please try again.');
        
        // Initialize with empty data
        setFunnelData([]);
        setDepartmentBreakdown([]);
        setTimeToHire({ average: 0, byStage: [] });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [filters]);

  // Normalize funnel: group all 'stage-*' into a single 'Interview' stage and recompute conversion rates
  const normalizeFunnelData = (stages: FunnelStage[]): FunnelStage[] => {
    if (!stages || stages.length === 0) return [];

    // Group stages
    const result: { stage: string; count: number }[] = [];
    let interviewCount = 0;
    let insertedInterview = false;

    for (const s of stages) {
      const name = s.stage || '';
      if (/^stage[-_\s]?\d+/i.test(name) || /^interview/i.test(name)) {
        interviewCount += s.count || 0;
        continue;
      }
      // When we hit a non-stage and we have accumulated interviews, insert Interview first
      if (interviewCount > 0 && !insertedInterview) {
        result.push({ stage: 'Interview', count: interviewCount });
        insertedInterview = true;
        interviewCount = 0;
      }
      result.push({ stage: name, count: s.count || 0 });
    }
    // If the array ended with only stage-* entries, push Interview
    if (interviewCount > 0) {
      result.push({ stage: 'Interview', count: interviewCount });
    }

    // If Applications stage is missing but we have data, synthesize it by summing all counts
    const hasApplications = result.some(r => r.stage.toLowerCase().includes('application'));
    if (!hasApplications) {
      const total = result.reduce((acc, r) => acc + (r.count || 0), 0);
      result.unshift({ stage: 'Applications', count: total });
    }

    // Recompute conversionRate based on counts
    const withConversion: FunnelStage[] = result.map((r, idx, arr) => {
      const prev = idx === 0 ? undefined : arr[idx - 1];
      const conv = idx === 0 || !prev || !prev.count ? 100 : parseFloat(((r.count / prev.count) * 100).toFixed(1));
      return { stage: r.stage, count: r.count, conversionRate: conv } as FunnelStage;
    });

    return withConversion;
  };

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Funnel Chart */}
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Recruitment Funnel</h3>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <FunnelChart>
                <Tooltip 
                  formatter={(value: number, name: string, props: any) => {
                    const { payload } = props;
                    return [`${value} candidates`, payload.stage];
                  }}
                />
                <Funnel
                  dataKey="count"
                  data={funnelData}
                  isAnimationActive
                >
                  <LabelList
                    position="right"
                    fill="#fff"
                    stroke="none"
                    dataKey="stage"
                  />
                  {funnelData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Funnel>
              </FunnelChart>
            </ResponsiveContainer>
          </div>
        </Card>
        
        {/* Funnel Metrics */}
        <Card>
          <h3 className="text-lg font-medium text-gray-800 mb-4">Funnel Metrics</h3>
          <div className="space-y-6">
            {funnelData.map((stage, index) => (
              <div key={index} className="border-b border-gray-100 pb-4 last:border-b-0 last:pb-0">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="text-sm font-medium text-gray-700">{stage.stage}</h4>
                  <span className="text-sm font-semibold text-gray-900">{stage.count}</span>
                </div>
                {index > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-500">Conversion from previous</span>
                    <div className="flex items-center">
                      <div className="w-24 h-2 bg-gray-200 rounded-full mr-2">
                        <div 
                          className="h-2 bg-blue-500 rounded-full" 
                          style={{ width: `${stage.conversionRate}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-700">{stage.conversionRate}%</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          {/* Overall Conversion */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <h4 className="text-sm font-medium text-gray-700 mb-2">Overall Conversion</h4>
            <div className="flex items-center">
              <div className="flex-1 h-2 bg-gray-200 rounded-full mr-2">
                <div 
                  className="h-2 bg-green-500 rounded-full" 
                  style={{ 
                    width: `${funnelData.length > 0 ? 
                      (funnelData[funnelData.length - 1].count / funnelData[0].count) * 100 : 0}%` 
                  }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700">
                {funnelData.length > 0 ? 
                  ((funnelData[funnelData.length - 1].count / funnelData[0].count) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Department Breakdown */}
      <Card className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Department Performance</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={departmentBreakdown}
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
      
      {/* Time to Hire Analysis */}
      <Card className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Time to Hire Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-1 flex flex-col justify-center items-center">
            <div className="text-5xl font-bold text-blue-600 mb-2">
              {timeToHire && timeToHire.average ? timeToHire.average : 0}
            </div>
            <div className="text-sm text-gray-500 text-center">Average days to hire</div>
          </div>
          
          <div className="col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Time by Stage (days)</h4>
            <div className="space-y-4">
              {timeToHire && timeToHire.byStage && timeToHire.byStage.map((item: any, index: number) => (
                <div key={index} className="flex items-center">
                  <div className="w-36 text-sm text-gray-600">{item.stage}</div>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <div className="flex-1 h-4 bg-gray-100 rounded-full">
                        <div 
                          className="h-4 bg-blue-500 rounded-full" 
                          style={{ width: `${(item.days / timeToHire.average) * 100}%` }}
                        ></div>
                      </div>
                      <span className="ml-2 text-sm font-medium text-gray-700">{item.days} days</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Card>
      
      {/* Funnel Analysis */}
      <Card className="mt-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">Funnel Analysis</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Bottlenecks */}
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Bottlenecks</h4>
            <div className="space-y-4">
              {funnelData.length > 1 && funnelData
                .slice(0, -1)
                .map((stage, index) => {
                  const nextStage = funnelData[index + 1];
                  const dropRate = 100 - nextStage.conversionRate;
                  
                  // Only show significant bottlenecks (more than 50% drop)
                  if (dropRate > 50) {
                    return (
                      <div key={index} className="bg-red-50 border-l-4 border-red-400 p-3">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium text-red-800">
                            {stage.stage} → {nextStage.stage}
                          </span>
                          <span className="text-sm font-semibold text-red-800">
                            {dropRate.toFixed(1)}% drop
                          </span>
                        </div>
                        <p className="text-xs text-red-700 mt-1">
                          High candidate drop-off detected between these stages.
                        </p>
                      </div>
                    );
                  }
                  return null;
                }).filter(Boolean)}
              
              {!funnelData.some((stage, index) => 
                index < funnelData.length - 1 && 
                (100 - funnelData[index + 1].conversionRate) > 50
              ) && (
                <p className="text-sm text-gray-500 italic">
                  No significant bottlenecks detected in the current recruitment funnel.
                </p>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default RecruitmentFunnelSection;
