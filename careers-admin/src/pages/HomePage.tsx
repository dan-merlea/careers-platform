import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <div className="text-sm text-gray-500">Last updated: August 15, 2025</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stats Cards */}
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <div className="text-sm font-medium text-gray-500">Total Users</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">1,254</span>
            <span className="ml-2 text-sm text-green-600">+12%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <div className="text-sm font-medium text-gray-500">Active Jobs</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">423</span>
            <span className="ml-2 text-sm text-green-600">+5%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <div className="text-sm font-medium text-gray-500">Applications</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">3,752</span>
            <span className="ml-2 text-sm text-green-600">+18%</span>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-yellow-500">
          <div className="text-sm font-medium text-gray-500">Premium Users</div>
          <div className="mt-2 flex items-baseline">
            <span className="text-3xl font-bold text-gray-900">287</span>
            <span className="ml-2 text-sm text-green-600">+7%</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Charts and tables would go here */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">Recent Activity</h2>
          <div className="border-t border-gray-200">
            <p className="py-4 text-gray-500 text-center">Chart placeholder - Activity data will be displayed here</p>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-800 mb-4">User Growth</h2>
          <div className="border-t border-gray-200">
            <p className="py-4 text-gray-500 text-center">Chart placeholder - User growth data will be displayed here</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
