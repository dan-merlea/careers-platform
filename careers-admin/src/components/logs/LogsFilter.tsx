import React, { useState } from 'react';
import { LogsFilter as LogsFilterType } from '../../services/logsService';
import Select from '../common/Select';

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
          <Select
            value={filter.userId || undefined}
            onChange={(val) => handleFilterChange('userId', val || '')}
            allowEmpty
            placeholder="All Users"
            className="w-full"
            options={users.map(u => ({ label: u.name, value: u.id }))}
          />
        </div>
        
        {/* Resource Type Filter */}
        <div>
          <label htmlFor="resourceTypeFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Resource Type
          </label>
          <Select
            value={filter.resourceType || undefined}
            onChange={(val) => handleFilterChange('resourceType', val || '')}
            allowEmpty
            placeholder="All Resource Types"
            className="w-full"
            options={resourceTypes.map(rt => ({ label: formatResourceType(rt), value: rt }))}
          />
        </div>
        
        {/* Action Type Filter */}
        <div>
          <label htmlFor="actionFilter" className="block text-sm font-medium text-gray-700 mb-1">
            Action
          </label>
          <Select
            value={filter.action || undefined}
            onChange={(val) => handleFilterChange('action', val || '')}
            allowEmpty
            placeholder="All Actions"
            className="w-full"
            options={actionTypes.map(a => ({ label: formatActionType(a), value: a }))}
          />
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
