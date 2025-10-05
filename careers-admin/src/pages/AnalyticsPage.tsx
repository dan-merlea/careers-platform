import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import TabNavigation, { TabItem } from '../components/common/TabNavigation';
import Card from '../components/common/Card';
import { 
  ChartBarIcon, 
  FunnelIcon, 
  BriefcaseIcon, 
  UserGroupIcon, 
  ChatBubbleLeftRightIcon 
} from '@heroicons/react/24/outline';

// Import analytics components from barrel file
import {
  OverviewSection,
  RecruitmentFunnelSection,
  JobPerformanceSection,
  InterviewAnalyticsSection,
  CandidateSourceSection,
  AnalyticsFilters
} from '../components/analytics';

// Types for filter state
export interface FilterParams {
  dateRange: {
    startDate: string;
    endDate: string;
  };
  department?: string;
  jobRole?: string;
  location?: string;
  source?: string;
  comparisonPeriod?: 'previous_period' | 'previous_year' | 'none';
}

const AnalyticsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Default filter state
  const [filters, setFilters] = useState<FilterParams>({
    dateRange: {
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days ago
      endDate: new Date().toISOString().split('T')[0], // today
    },
    comparisonPeriod: 'previous_period'
  });

  // Determine active section based on URL path
  const path = location.pathname;
  const activeSection = path.includes('/funnel') 
    ? 'funnel' 
    : path.includes('/jobs') 
      ? 'jobs' 
      : path.includes('/interviews')
        ? 'interviews'
        : path.includes('/sources')
          ? 'sources'
          : 'overview';

  // Define tab items for TabNavigation
  const tabs: TabItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <ChartBarIcon className="h-5 w-5" />,
      href: '/analytics'
    },
    {
      id: 'funnel',
      label: 'Recruitment Funnel',
      icon: <FunnelIcon className="h-5 w-5" />,
      href: '/analytics/funnel'
    },
    {
      id: 'jobs',
      label: 'Job Performance',
      icon: <BriefcaseIcon className="h-5 w-5" />,
      href: '/analytics/jobs'
    },
    {
      id: 'interviews',
      label: 'Interview Analytics',
      icon: <ChatBubbleLeftRightIcon className="h-5 w-5" />,
      href: '/analytics/interviews'
    },
    {
      id: 'sources',
      label: 'Candidate Sources',
      icon: <UserGroupIcon className="h-5 w-5" />,
      href: '/analytics/sources'
    }
  ];

  // Navigation handler
  const handleSectionChange = (section: string) => {
    if (section === 'overview') {
      navigate('/analytics');
    } else {
      navigate(`/analytics/${section}`);
    }
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: FilterParams) => {
    setFilters(newFilters);
    // We'll implement data fetching based on filters later
  };

  return (
    <div className="container mx-auto py-3">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      {/* Filters Section */}
      <Card className="mb-6">
        <AnalyticsFilters 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
      </Card>
      
      {/* Navigation Tabs */}
      <TabNavigation
        tabs={tabs}
        activeTab={activeSection}
        onTabChange={handleSectionChange}
        className="mb-6"
      />
      
      {/* Content Area with conditional rendering based on activeSection */}
      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      ) : isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div>
          {activeSection === 'overview' && <OverviewSection filters={filters} />}
          {activeSection === 'funnel' && <RecruitmentFunnelSection filters={filters} />}
          {activeSection === 'jobs' && <JobPerformanceSection filters={filters} />}
          {activeSection === 'interviews' && <InterviewAnalyticsSection filters={filters} />}
          {activeSection === 'sources' && <CandidateSourceSection filters={filters} />}
        </div>
      )}
    </div>
  );
};

export default AnalyticsPage;
