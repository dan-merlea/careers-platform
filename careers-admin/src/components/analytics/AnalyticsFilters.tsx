import React, { useState } from 'react';
import Button from '../common/Button';
import DateInput from '../common/DateInput';
import { FilterParams } from '../../pages/analytics/AnalyticsPage';
import { AdjustmentsHorizontalIcon, CalendarIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import Select from '../common/Select';

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
    <div>
      {/* Filter header */}
      <div 
        className="flex justify-between items-center cursor-pointer"
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
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* Date range selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
              <Select
                onChange={(val) => val && handleDateRangeChange(val)}
                options={dateRanges.map(dr => ({ label: dr.label, value: dr.value }))}
                placeholder={dateRanges[1].label}
                className="min-w-[180px]"
              />
            </div>
            
            {/* Custom date inputs */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <DateInput
                name="startDate"
                value={localFilters.dateRange.startDate}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <DateInput
                name="endDate"
                value={localFilters.dateRange.endDate}
                onChange={handleInputChange}
              />
            </div>
            
            {/* Comparison period */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Compare To</label>
              <Select
                value={localFilters.comparisonPeriod}
                onChange={(val) =>
                  setLocalFilters({
                    ...localFilters,
                    comparisonPeriod: (val as 'previous_period' | 'previous_year' | 'none') ?? localFilters.comparisonPeriod,
                  })
                }
                options={comparisonPeriods.map(cp => ({ label: cp.label, value: cp.value }))}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Additional filters row */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            {/* Department filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <Select
                value={localFilters.department || undefined}
                onChange={(val) => setLocalFilters({ ...localFilters, department: val || '' })}
                allowEmpty
                placeholder="All Departments"
                options={[
                  { label: 'Engineering', value: 'engineering' },
                  { label: 'Marketing', value: 'marketing' },
                  { label: 'Sales', value: 'sales' },
                  { label: 'Product', value: 'product' },
                  { label: 'Design', value: 'design' },
                ]}
                className="w-full"
              />
            </div>

            {/* Job role filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Role</label>
              <Select
                value={localFilters.jobRole || undefined}
                onChange={(val) => setLocalFilters({ ...localFilters, jobRole: val || '' })}
                allowEmpty
                placeholder="All Roles"
                options={[
                  { label: 'Developer', value: 'developer' },
                  { label: 'Designer', value: 'designer' },
                  { label: 'Manager', value: 'manager' },
                  { label: 'Analyst', value: 'analyst' },
                ]}
                className="w-full"
              />
            </div>
            
            {/* Location filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <Select
                value={localFilters.location || undefined}
                onChange={(val) => setLocalFilters({ ...localFilters, location: val || '' })}
                allowEmpty
                placeholder="All Locations"
                options={[
                  { label: 'Remote', value: 'remote' },
                  { label: 'San Francisco', value: 'san-francisco' },
                  { label: 'New York', value: 'new-york' },
                  { label: 'London', value: 'london' },
                ]}
                className="w-full"
              />
            </div>
            
            {/* Source filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Source</label>
              <Select
                value={localFilters.source || undefined}
                onChange={(val) => setLocalFilters({ ...localFilters, source: val || '' })}
                allowEmpty
                placeholder="All Sources"
                options={[
                  { label: 'LinkedIn', value: 'linkedin' },
                  { label: 'Indeed', value: 'indeed' },
                  { label: 'Referral', value: 'referral' },
                  { label: 'Company Website', value: 'website' },
                ]}
                className="w-full"
              />
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex justify-end space-x-3 mt-4 pt-4 border-t border-gray-200">
            <Button type="button" onClick={resetFilters} variant="white" className="text-sm">
              Reset
            </Button>
            <Button type="button" onClick={applyFilters} variant="primary" className="text-sm">
              Apply Filters
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsFilters;
