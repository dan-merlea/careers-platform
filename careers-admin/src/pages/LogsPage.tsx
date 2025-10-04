import React, { useEffect, useState } from 'react';
import { fetchLogs, LogsFilter as LogsFilterType, UserLog } from '../services/logsService';
import LogsTable from '../components/logs/LogsTable';
import LogsFilter from '../components/logs/LogsFilter';
import { api } from '../utils/api';

const LogsPage: React.FC = () => {
  const [logs, setLogs] = useState<UserLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [totalLogs, setTotalLogs] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [filter, setFilter] = useState<LogsFilterType>({});
  const [users, setUsers] = useState<Array<{ id: string; name: string }>>([]);
  
  // These would ideally come from the backend, but for now we'll hardcode common values
  const resourceTypes = [
    'job_application',
    'job_application_note',
    'job_application_interview',
    'job',
    'company',
    'user'
  ];
  
  const actionTypes = [
    'create_application',
    'update_application_status',
    'delete_application',
    'add_note',
    'update_note',
    'delete_note',
    'schedule_interview',
    'update_interviewer_visibility'
  ];

  // Fetch logs
  const loadLogs = async () => {
    setLoading(true);
    try {
      const response = await fetchLogs(currentPage, 20, filter);
      setLogs(response.logs);
      setTotalLogs(response.total);
    } catch (error) {
      console.error('Error fetching logs:', error);
      // Handle error (show notification, etc.)
    } finally {
      setLoading(false);
    }
  };

  // Fetch users for the filter dropdown
  const loadUsers = async () => {
    try {
      // This endpoint would need to be implemented in the backend
      const response = await api.get<Array<{ id: string; name: string; email: string }>>('/users');
      setUsers(response.map(user => ({
        id: user.id,
        name: `${user.name} (${user.email})`
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      // Handle error
    }
  };

  // Load logs on initial render and when page or filter changes
  useEffect(() => {
    loadLogs();
  }, [currentPage, filter]);

  // Load users on initial render
  useEffect(() => {
    loadUsers();
  }, []);

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Handle filter change
  const handleFilterChange = (newFilter: LogsFilterType) => {
    setFilter(newFilter);
    // Reset to first page when filter changes
    setCurrentPage(1);
  };

  return (
    <div className="">
      <div className="sm:flex sm:items-center mb-6">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">User Activity Logs</h1>
          <p className="mt-2 text-sm text-gray-700">
            A list of all user actions in the system, including who performed the action, what was changed, and when it happened.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            onClick={loadLogs}
            className="inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 sm:w-auto"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <LogsFilter
        onFilterChange={handleFilterChange}
        resourceTypes={resourceTypes}
        actionTypes={actionTypes}
        users={users}
      />

      {/* Logs Table */}
      <LogsTable
        logs={logs}
        loading={loading}
        totalLogs={totalLogs}
        currentPage={currentPage}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default LogsPage;
