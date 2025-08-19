import React, { useState, useEffect } from 'react';
import { api } from '../utils/api';

// Define types for our dashboard data
interface DashboardStats {
  users: {
    total: number;
    growth: number;
    premium: number;
  };
  jobs: {
    active: number;
    growth: number;
  };
  applications: {
    total: number;
    growth: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    date: string;
  }>;
}

const HomePage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
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
        
        // For demo purposes, set mock data if API fails
        setStats({
          users: { total: 1254, growth: 12, premium: 287 },
          jobs: { active: 423, growth: 5 },
          applications: { total: 3752, growth: 18 },
          recentActivity: [
            { id: '1', type: 'user', description: 'New user registered', date: '2025-08-15T10:30:00Z' },
            { id: '2', type: 'job', description: 'New job posted', date: '2025-08-15T09:45:00Z' },
            { id: '3', type: 'application', description: 'Application submitted', date: '2025-08-15T08:20:00Z' },
          ]
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // Refresh data every 5 minutes
    const intervalId = setInterval(fetchDashboardData, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  if (loading && !stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
        <div className="text-sm text-gray-500">Last updated: {lastUpdated}</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats?.users.total.toLocaleString()}</span>
            <span className="ml-2 text-sm text-green-600">+{stats?.users.growth}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500">Active Jobs</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats?.jobs.active.toLocaleString()}</span>
            <span className="ml-2 text-sm text-green-600">+{stats?.jobs.growth}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-sm font-medium text-gray-500">Applications</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats?.applications.total.toLocaleString()}</span>
            <span className="ml-2 text-sm text-green-600">+{stats?.applications.growth}%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500">Premium Users</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">{stats?.users.premium.toLocaleString()}</span>
            <span className="ml-2 text-sm text-green-600">+{stats?.users.growth}%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h2>
          <div className="border-t border-gray-200">
            {stats?.recentActivity && stats.recentActivity.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {stats.recentActivity.map(activity => (
                  <div key={activity.id} className="py-3 flex items-center">
                    <div className="flex-shrink-0">
                      {activity.type === 'user' && (
                        <div className="bg-blue-100 p-2 rounded-full">
                          <svg className="h-4 w-4 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                          </svg>
                        </div>
                      )}
                      {activity.type === 'job' && (
                        <div className="bg-green-100 p-2 rounded-full">
                          <svg className="h-4 w-4 text-green-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                      {activity.type === 'application' && (
                        <div className="bg-purple-100 p-2 rounded-full">
                          <svg className="h-4 w-4 text-purple-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
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
            ) : (
              <p className="py-4 text-gray-500 text-center">No recent activity</p>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">User Growth</h2>
          <div className="border-t border-gray-200">
            <div className="py-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Total Users</span>
                <span className="text-sm font-medium text-gray-700">{stats?.users.total}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: '75%' }}></div>
              </div>
              
              <div className="flex justify-between mb-1 mt-4">
                <span className="text-sm font-medium text-gray-700">Premium Users</span>
                <span className="text-sm font-medium text-gray-700">{stats?.users.premium}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div className="bg-yellow-500 h-2.5 rounded-full" style={{ width: '25%' }}></div>
              </div>
              
              <div className="mt-4 text-center">
                <p className="text-sm text-gray-600">Monthly growth rate: +{stats?.users.growth}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
