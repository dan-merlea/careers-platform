import React, { useState } from 'react';
import { UserLog, formatLogTimestamp, getLogDescription } from '../../services/logsService';
import Card from '../common/Card';
import ScrollableTable, { PaginationConfig } from '../common/ScrollableTable';

interface LogsTableProps {
  logs: UserLog[];
  loading: boolean;
  totalLogs: number;
  currentPage: number;
  onPageChange: (page: number) => void;
  pageSize?: number;
}

const LogsTable: React.FC<LogsTableProps> = ({
  logs,
  loading,
  totalLogs,
  currentPage,
  onPageChange,
  pageSize = 20,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  // Get action color based on action type
  const getActionColor = (action: string): string => {
    if (action.startsWith('create')) return 'text-green-600';
    if (action.startsWith('update')) return 'text-blue-600';
    if (action.startsWith('delete')) return 'text-red-600';
    return 'text-gray-600';
  };

  // Get resource type badge color
  const getResourceBadgeColor = (resourceType: string): string => {
    switch (resourceType) {
      case 'job_application':
        return 'bg-purple-100 text-purple-800';
      case 'job_application_note':
        return 'bg-blue-100 text-blue-800';
      case 'job_application_interview':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format resource type for display
  const formatResourceType = (resourceType: string): string => {
    return resourceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Pagination configuration
  const paginationConfig: PaginationConfig = {
    currentPage,
    totalItems: totalLogs,
    pageSize,
    onPageChange,
  };

  return (
    <Card>
      <ScrollableTable pagination={paginationConfig}>
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Action
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Resource
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              User
            </th>
            <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">
              Timestamp
            </th>
            <th scope="col" className="relative px-3 py-3.5">
              <span className="sr-only">Details</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {loading ? (
            // Show 20 skeleton rows while loading
            Array.from({ length: 20 }).map((_, index) => (
              <tr key={`skeleton-${index}`} className="animate-pulse">
                <td className="px-3 py-4">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </td>
                <td className="px-3 py-4">
                  <div className="h-5 bg-gray-200 rounded-full w-24"></div>
                </td>
                <td className="px-3 py-4">
                  <div className="h-4 bg-gray-200 rounded w-32"></div>
                </td>
                <td className="px-3 py-4">
                  <div className="h-4 bg-gray-200 rounded w-28"></div>
                </td>
                <td className="px-3 py-4 text-right">
                  <div className="h-4 bg-gray-200 rounded w-20 ml-auto"></div>
                </td>
              </tr>
            ))
          ) : logs.length === 0 ? (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500">
                No logs found
              </td>
            </tr>
          ) : (
            logs.map((log) => (
              <React.Fragment key={log.id}>
                <tr className="hover:bg-gray-50">
                  <td className="whitespace-nowrap px-3 py-4 text-sm">
                    <div className={`font-medium ${getActionColor(log.action)}`}>
                      {getLogDescription(log)}
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getResourceBadgeColor(log.resourceType)}`}>
                      {formatResourceType(log.resourceType)}
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {log.userName || log.userEmail || log.userId}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                    {formatLogTimestamp(log.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-3 py-4 text-right text-sm font-medium">
                    <button
                      onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      {expandedLogId === log.id ? 'Hide Details' : 'View Details'}
                    </button>
                  </td>
                </tr>
                {expandedLogId === log.id && (
                  <tr className="bg-gray-50">
                    <td colSpan={5} className="px-3 py-4">
                      <div className="text-sm">
                        <h4 className="font-medium text-gray-900 mb-2">Log Details</h4>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-gray-500">
                              <span className="font-medium">Method:</span> {log.details.method}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">Path:</span> {log.details.path}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">IP Address:</span> {log.ip || 'N/A'}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">
                              <span className="font-medium">Resource ID:</span> {log.resourceId || 'N/A'}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">Created At:</span> {formatLogTimestamp(log.createdAt)}
                            </p>
                            <p className="text-gray-500">
                              <span className="font-medium">Updated At:</span> {formatLogTimestamp(log.updatedAt)}
                            </p>
                          </div>
                        </div>
                        
                        {/* Request Body (if available) */}
                        {log.details.body && Object.keys(log.details.body).length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-gray-900 mb-1">Request Body:</h5>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(log.details.body, null, 2)}
                            </pre>
                          </div>
                        )}
                        
                        {/* Query Parameters (if available) */}
                        {log.details.query && Object.keys(log.details.query).length > 0 && (
                          <div className="mt-4">
                            <h5 className="font-medium text-gray-900 mb-1">Query Parameters:</h5>
                            <pre className="bg-gray-100 p-2 rounded text-xs overflow-auto max-h-40">
                              {JSON.stringify(log.details.query, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))
          )}
        </tbody>
      </ScrollableTable>
    </Card>
  );
};

export default LogsTable;
