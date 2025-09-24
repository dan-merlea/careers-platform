import React, { useState } from 'react';
import { UserLog, formatLogTimestamp, getLogDescription } from '../../services/logsService';

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

  const toggleLogDetails = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  // Calculate total pages
  const totalPages = Math.ceil(totalLogs / pageSize);

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

  if (loading) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
      <table className="min-w-full divide-y divide-gray-300">
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
          {logs.length === 0 ? (
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
                      onClick={() => toggleLogDetails(log.id)}
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
      </table>
      
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(currentPage - 1) * pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(currentPage * pageSize, totalLogs)}
                </span>{' '}
                of <span className="font-medium">{totalLogs}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum = currentPage;
                  if (currentPage < 3) {
                    pageNum = i + 1;
                  } else if (currentPage > totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    currentPage === totalPages ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LogsTable;
