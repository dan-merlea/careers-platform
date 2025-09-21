import React, { useState } from 'react';
import { LogsFilter as LogsFilterType } from '../../services/logsService';

interface LogsFilterProps {
  onFilterChange: (filter: LogsFilterType) => void;
  resourceTypes: string[];
  actionTypes: string[];
  users: Array<{ id: string; name: string }>;
}

const LogsFilter: React.FC<LogsFilterProps> = ({
  onFilterChange,
  resourceTypes,
  actionTypes,
  users,
}) => {
  const [filter, setFilter] = useState<LogsFilterType>({});

  const handleFilterChange = (key: keyof LogsFilterType, value: string) => {
    const newFilter = { ...filter };
    
    if (value === '') {
      // Remove the filter if empty value
      delete newFilter[key];
    } else {
      newFilter[key] = value;
    }
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const handleDateChange = (key: 'startDate' | 'endDate', value: string) => {
    const newFilter = { ...filter };
    
    if (value === '') {
      delete newFilter[key];
    } else {
      newFilter[key] = value;
    }
    
    setFilter(newFilter);
    onFilterChange(newFilter);
  };

  const clearFilters = () => {
    setFilter({});
    onFilterChange({});
  };

  // Format resource type for display
  const formatResourceType = (resourceType: string): string => {
    return resourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Format action type for display
  const formatActionType = (actionType: string): string => {
    return actionType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  return (
    <div className="bg-white p-4 shadow rounded-lg mb-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Filter Logs</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* User Filter */}
        <div>
          <label htmlFor="userFilter" className="block text-sm font-medium text-gray-700 mb-1">
            User
          </label>
          <select
            id="userFilter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter.userId || ''}
            onChange={(e) => handleFilterChange('userId', e.target.value)}
          >
            <option value="">All Users</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        
        {/* Resource Type Filter */}
        <div>
          <label htmlFor="resourceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <select
            id="resourceTypeFilter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter.resourceType || ''}
            onChange={(e) => handleFilterChange('resourceType', e.target.value)}
          >
            <option value="">All Resource Types</option>
            {resourceTypes.map((type) => (
              <option key={type} value={type}>
                {formatResourceType(type)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Action Type Filter */}
        <div>
          <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <select
            id="actionFilter"
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            value={filter.action || ''}
            onChange={(e) => handleFilterChange('action', e.target.value)}
          >
            <option value="">All Actions</option>
            {actionTypes.map((action) => (
              <option key={action} value={action}>
                {formatActionType(action)}
              </option>
            ))}
          </select>
        </div>
        
        {/* Resource ID Filter */}
        <div>
          <label htmlFor="resourceIdFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Resource ID
          </label>
          <input
            type="text"
            id="resourceIdFilter"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={filter.resourceId || ''}
            onChange={(e) => handleFilterChange('resourceId', e.target.value)}
            placeholder="Enter resource ID"
          />
        </div>
        
        {/* Date Range Filters */}
        <div>
          <label htmlFor="startDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Start Date
          </label>
          <input
            type="date"
            id="startDateFilter"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={filter.startDate || ''}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
        </div>
        
        <div>
          <label htmlFor="endDateFilter" className="block text-sm font-medium text-gray-700 mb-1">
            End Date
          </label>
          <input
            type="date"
            id="endDateFilter"
            className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
            value={filter.endDate || ''}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
        </div>
      </div>
      
      {/* Clear Filters Button */}
      <div className="mt-4 flex justify-end">
        <button
          type="button"
          onClick={clearFilters}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
};

export default LogsFilter;
