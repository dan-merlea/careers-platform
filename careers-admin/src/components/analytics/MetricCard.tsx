import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';
import { KpiMetric } from '../../services/analyticsService';
import Card from '../common/Card';

interface MetricCardProps {
  metric: KpiMetric;
}

const MetricCard: React.FC<MetricCardProps> = ({ metric }) => {
  const { label, value, change, trend } = metric;
  
  // Format value based on type
  const formatValue = (value: number, label: string): string => {
    if (label.toLowerCase().includes('rate') || label.toLowerCase().includes('percentage')) {
      return `${value}%`;
    }
    if (value >= 1000) {
      return value.toLocaleString();
    }
    return value.toString();
  };
  
  // Format change value
  const formatChange = (change: number): string => {
    const absChange = Math.abs(change);
    return absChange % 1 === 0 ? `${absChange}` : `${absChange.toFixed(1)}`;
  };
  
  return (
    <Card className="hover:shadow-md transition-shadow">
      <h3 className="text-sm font-medium text-gray-500 mb-1">{label}</h3>
      <div className="flex items-baseline">
        <span className="text-2xl font-semibold text-gray-800">{formatValue(value, label)}</span>
        
        {change !== 0 && (
          <div className={`ml-3 flex items-center text-sm font-medium ${
            trend === 'up' ? 'text-green-600' : trend === 'down' ? 'text-red-600' : 'text-gray-500'
          }`}>
            {trend === 'up' ? (
              <ArrowUpIcon className="h-4 w-4 mr-1" />
            ) : trend === 'down' ? (
              <ArrowDownIcon className="h-4 w-4 mr-1" />
            ) : null}
            <span>{formatChange(change)}%</span>
          </div>
        )}
      </div>
    </Card>
  );
};

export default MetricCard;
