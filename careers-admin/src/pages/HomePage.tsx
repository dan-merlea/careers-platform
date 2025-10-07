import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';
import Card from '../components/common/Card';
import ReferralsWidget from '../components/dashboard/ReferralsWidget';
import InterviewsWidget from '../components/dashboard/InterviewsWidget';
import HeadcountRequestsWidget from '../components/dashboard/HeadcountRequestsWidget';
import NewCandidatesWidget from '../components/dashboard/NewCandidatesWidget';
import JobApprovalsWidget from '../components/dashboard/JobApprovalsWidget';
import SuggestionsWidget from '../components/dashboard/SuggestionsWidget';
import { 
  CalendarIcon, 
  BriefcaseIcon, 
  DocumentTextIcon, 
  UserPlusIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

// Define types for our dashboard data
interface DashboardStats {
  interviews: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  jobs: {
    active: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  applications: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  referrals: {
    total: number;
    change: number;
    changeType: 'increase' | 'decrease';
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
  userReferrals: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    status: string;
    progress: number;
    createdAt: string;
    stages: Array<{
      id: string;
      title: string;
      order: number;
      color: string;
    }>;
  }>;
  userInterviews: Array<{
    id: string;
    scheduledDate: string;
    title: string;
    description?: string;
    interviewers: Array<{
      userId: string;
      name: string;
    }>;
    stage: string;
    status: string;
    applicantId: string;
    applicantName: string;
    jobTitle: string;
    createdAt: string;
  }>;
  headcountRequests: Array<{
    id: string;
    title: string;
    department: string;
    requestedBy: string;
    status: string;
    createdAt: string;
  }>;
  newCandidates: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    jobId: string;
    jobTitle: string;
    createdAt: string;
  }>;
  pendingJobApprovals: Array<{
    id: string;
    title: string;
    department: string;
    requestedBy: string;
    requestedByName: string;
    status: string;
    createdAt: string;
  }>;
  suggestions: Array<{
    id: string;
    type: 'interview_process' | 'company_details' | 'department_assignment' | 'calendar_integration';
    title: string;
    description: string;
    actionText: string;
    actionLink: string;
  }>;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch dashboard stats with authenticated request
      const data = await api.get<DashboardStats>('/admin/dashboard/stats');
      setStats(data);
      
      // Set last updated time
      setLastUpdated(new Date().toLocaleString());
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (loading && !stats) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-48 animate-pulse"></div>
        </div>
        
        {/* Stats Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-20 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-24"></div>
            </div>
          ))}
        </div>

        {/* Widgets Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-40 mb-4"></div>
              <div className="space-y-3">
                {[1, 2, 3].map((j) => (
                  <div key={j} className="h-20 bg-gray-100 rounded"></div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }
  
  if (error && !stats) {
    return (
      <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">{error}</p>
            <button 
              className="mt-2 text-sm text-red-600 hover:text-red-800 font-medium"
              onClick={() => window.location.reload()}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="flex items-center gap-3">
          <div className="text-sm text-gray-500">Last updated: {lastUpdated}</div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Refresh dashboard"
          >
            <ArrowPathIcon className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Interviews */}
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <CalendarIcon className="h-5 w-5 text-blue-500" />
                <span>Interviews</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.interviews.total}</div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {stats?.interviews.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={stats?.interviews.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {stats?.interviews.change}
                </span>
                <span className="text-gray-500">vs yesterday</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Active Jobs */}
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <BriefcaseIcon className="h-5 w-5 text-green-500" />
                <span>Active Jobs</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.jobs.active}</div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {stats?.jobs.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={stats?.jobs.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {stats?.jobs.change}
                </span>
                <span className="text-gray-500">vs yesterday</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Applications */}
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <DocumentTextIcon className="h-5 w-5 text-purple-500" />
                <span>Applications</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.applications.total}</div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {stats?.applications.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={stats?.applications.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {stats?.applications.change}
                </span>
                <span className="text-gray-500">vs yesterday</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Referrals */}
        <Card className="hover:shadow-xl transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500 mb-2">
                <UserPlusIcon className="h-5 w-5 text-orange-500" />
                <span>Referrals</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{stats?.referrals.total}</div>
              <div className="mt-2 flex items-center gap-1 text-sm">
                {stats?.referrals.changeType === 'increase' ? (
                  <ArrowUpIcon className="h-4 w-4 text-green-500" />
                ) : (
                  <ArrowDownIcon className="h-4 w-4 text-red-500" />
                )}
                <span className={stats?.referrals.changeType === 'increase' ? 'text-green-600' : 'text-red-600'}>
                  {stats?.referrals.change}
                </span>
                <span className="text-gray-500">vs yesterday</span>
              </div>
            </div>
          </div>
        </Card>
      </div>
      
      {/* Masonry/Pinterest Layout for Widgets */}
      <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6">
        {/* Suggestions Widget */}
        <div className="break-inside-avoid">
          <SuggestionsWidget suggestions={stats?.suggestions || []} />
        </div>

        {/* Referrals Widget */}
        <div className="break-inside-avoid">
          <ReferralsWidget referrals={stats?.userReferrals || []} />
        </div>

        {/* Interviews Widget */}
        <div className="break-inside-avoid">
          <InterviewsWidget interviews={stats?.userInterviews || []} />
        </div>

        {/* Job Approvals Widget */}
        <div className="break-inside-avoid">
          <JobApprovalsWidget jobs={stats?.pendingJobApprovals || []} />
        </div>

        {/* Headcount Requests Widget */}
        <div className="break-inside-avoid">
          <HeadcountRequestsWidget requests={stats?.headcountRequests || []} />
        </div>

        {/* New Candidates Widget */}
        <div className="break-inside-avoid">
          <NewCandidatesWidget candidates={stats?.newCandidates || []} />
        </div>
      </div>

      {/* Recent Activity */}
      {stats?.recentActivity && stats.recentActivity.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h2>
          <div className="divide-y divide-gray-200">
            {stats.recentActivity.map(activity => (
              <div key={activity.id} className="py-3 flex items-center">
                <div className="flex-shrink-0">
                  {activity.type === 'application' && (
                    <div className="bg-purple-100 p-2 rounded-full">
                      <DocumentTextIcon className="h-4 w-4 text-purple-600" />
                    </div>
                  )}
                  {activity.type === 'job' && (
                    <div className="bg-green-100 p-2 rounded-full">
                      <BriefcaseIcon className="h-4 w-4 text-green-600" />
                    </div>
                  )}
                  {activity.type === 'interview' && (
                    <div className="bg-blue-100 p-2 rounded-full">
                      <CalendarIcon className="h-4 w-4 text-blue-600" />
                    </div>
                  )}
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{new Date(activity.date).toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default HomePage;
