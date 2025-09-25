import React, { useState } from 'react';
import { FilterParams } from '../../pages/AnalyticsPage';
import { AdjustmentsHorizontalIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

interface AnalyticsFiltersProps {
  filters: FilterParams;
  onFilterChange: (filters: FilterParams) => void;
}

const AnalyticsFilters: React.FC<AnalyticsFiltersProps> = ({ filters, onFilterChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<FilterParams>(filters);

  // Predefined date ranges
  const dateRanges = [
    { label: 'Last 7 days', value: '7days' },
    { label: 'Last 30 days', value: '30days' },
    { label: 'Last quarter', value: 'quarter' },
    { label: 'Year to date', value: 'ytd' },
    { label: 'Custom range', value: 'custom' }
  ];

  // Comparison periods
  const comparisonPeriods = [
    { label: 'Previous period', value: 'previous_period' },
    { label: 'Same period last year', value: 'previous_year' },
    { label: 'No comparison', value: 'none' }
  ];

  // Handle date range selection
  const handleDateRangeChange = (rangeValue: string) => {
    const today = new Date();
    let startDate = new Date();
    
    switch (rangeValue) {
      case '7days':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30days':
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        startDate = new Date(today);
        startDate.setMonth(Math.floor(today.getMonth() / 3) * 3);
        startDate.setDate(1);
        break;
      case 'ytd':
        startDate = new Date(today.getFullYear(), 0, 1);
        break;
      case 'custom':
        // Keep current dates for custom range
        return;
    }
    
    const newFilters = {
      ...localFilters,
      dateRange: {
        startDate: startDate.toISOString().split('T')[0],
        endDate: today.toISOString().split('T')[0]
      }
    };
    
    setLocalFilters(newFilters);
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'startDate' || name === 'endDate') {
      setLocalFilters({
        ...localFilters,
        dateRange: {
          ...localFilters.dateRange,
          [name]: value
        }
      });
    } else {
      setLocalFilters({
        ...localFilters,
        [name]: value
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    onFilterChange(localFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const defaultFilters: FilterParams = {
      dateRange: {
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0],
      },
      comparisonPeriod: 'previous_period'
    };
    
    setLocalFilters(defaultFilters);
    onFilterChange(defaultFilters);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Filter header */}
      <div 
        className="flex justify-between items-center p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center">
          <AdjustmentsHorizontalIcon className="h-5 w-5 text-gray-500 mr-2" />
          <h3 className="font-medium text-gray-700">Filters</h3>
        </div>
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">
            {localFilters.dateRange.startDate} to {localFilters.dateRange.endDate}
          </span>
          <ChevronDownIcon 
            className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'transform rotate-180' : ''}`} 
          />
        </div>
      </div>
      
      {/* Expanded filter options */}
      {isExpanded && (
        <div className="p-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date range selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <select 
                  className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                  onChange={(e) => handleDateRangeChange(e.target.value)}
                >
                  {dateRanges.map(range => (
                    <option key={range.value} value={range.value}>{range.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Custom date inputs */}
            <div className="flex space-x-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="startDate"
                  value={localFilters.dateRange.startDate}
                  onChange={handleInputChange}
                  className="form-input rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="endDate"
                  value={localFilters.dateRange.endDate}
                  onChange={handleInputChange}
                  className="form-input rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm"
                />
              </div>
            </div>
            
            {/* Comparison period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare To</label>
              <select
                name="comparisonPeriod"
                value={localFilters.comparisonPeriod}
                onChange={handleInputChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm w-full"
              >
                {comparisonPeriods.map(period => (
                  <option key={period.value} value={period.value}>{period.label}</option>
                ))}
              </select>
            </div>
            
            {/* Department filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                name="department"
                value={localFilters.department || ''}
                onChange={handleInputChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm w-full"
              >
                <option value="">All Departments</option>
                <option value="engineering">Engineering</option>
                <option value="marketing">Marketing</option>
                <option value="sales">Sales</option>
                <option value="product">Product</option>
                <option value="design">Design</option>
              </select>
            </div>
          </div>
          
          {/* Additional filters row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Job role filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
              <select
                name="jobRole"
                value={localFilters.jobRole || ''}
                onChange={handleInputChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm w-full"
              >
                <option value="">All Roles</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="manager">Manager</option>
                <option value="analyst">Analyst</option>
              </select>
            </div>
            
            {/* Location filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <select
                name="location"
                value={localFilters.location || ''}
                onChange={handleInputChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm w-full"
              >
                <option value="">All Locations</option>
                <option value="remote">Remote</option>
                <option value="san-francisco">San Francisco</option>
                <option value="new-york">New York</option>
                <option value="london">London</option>
              </select>
            </div>
            
            {/* Source filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <select
                name="source"
                value={localFilters.source || ''}
                onChange={handleInputChange}
                className="form-select rounded-md border-gray-300 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 text-sm w-full"
              >
                <option value="">All Sources</option>
                <option value="linkedin">LinkedIn</option>
                <option value="indeed">Indeed</option>
                <option value="referral">Referral</option>
                <option value="website">Company Website</option>
              </select>
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={resetFilters}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
