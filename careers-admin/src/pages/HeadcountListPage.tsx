import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import headcountService, { HeadcountRequest } from '../services/headcountService';
import { useAuth } from '../context/AuthContext';
import ScrollableTable from '../components/common/ScrollableTable';

const HeadcountListPage: React.FC = () => {
  const [headcountRequests, setHeadcountRequests] = useState<HeadcountRequest[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { userRole, userEmail } = useAuth();
  const navigate = useNavigate();
  
  // Check if user is a director or admin (can approve/reject)
  const canApprove = userRole === 'director' || userRole === 'admin';

  useEffect(() => {
    const fetchHeadcountRequests = async () => {
      setIsLoading(true);
      try {
        const data = await headcountService.getAll();
        setHeadcountRequests(data);
      } catch (error) {
        console.error('Error fetching headcount requests:', error);
        toast.error('Failed to load headcount requests');
      } finally {
        setIsLoading(false);
      }
    };

    fetchHeadcountRequests();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await headcountService.approve(id);
      toast.success('Headcount request approved');
      
      // Update the local state
      setHeadcountRequests(prev => 
        prev.map(request => 
          request._id === id 
            ? { 
                ...request, 
                status: 'approved', 
                reviewedBy: userEmail ? { _id: '', name: '', email: userEmail } : undefined, 
                reviewedAt: new Date().toISOString() 
              } 
            : request
        )
      );
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    }
  };

  const handleRowClick = (id: string) => {
    navigate(`/headcount/${id}`);
  };

  // Stop propagation for action buttons to prevent row click when clicking buttons
  const handleActionClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleReject = async (id: string) => {
    try {
      await headcountService.reject(id);
      toast.success('Headcount request rejected');
      
      // Update the local state
      setHeadcountRequests(prev => 
        prev.map(request => 
          request._id === id 
            ? { 
                ...request, 
                status: 'rejected', 
                reviewedBy: userEmail ? { _id: '', name: '', email: userEmail } : undefined, 
                reviewedAt: new Date().toISOString() 
              } 
            : request
        )
      );
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    }
  };

  const handleRemove = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this headcount request? This action cannot be undone.')) {
      try {
        await headcountService.delete(id);
        toast.success('Headcount request removed successfully');
        
        // Update the local state by removing the deleted request
        setHeadcountRequests(prev => prev.filter(request => request._id !== id));
      } catch (error) {
        console.error('Error removing request:', error);
        toast.error('Failed to remove request');
      }
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>;
      case 'approved':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>;
      case 'rejected':
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">Unknown</span>;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Headcount Requests</h1>
        {(userRole === 'manager' || userRole === 'admin') && (
          <Link 
            to="/headcount/new" 
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Request New Headcount
          </Link>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : headcountRequests.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <p className="text-gray-500">No headcount requests found.</p>
          {(userRole === 'manager' || userRole === 'admin') && (
            <Link 
              to="/headcount/new" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              Create Your First Request
            </Link>
          )}
        </div>
      ) : (
        <ScrollableTable>
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Requested By
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {headcountRequests.map((request) => (
              <tr 
                key={request._id} 
                onClick={() => handleRowClick(request._id)}
                className="hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{request.role}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.teamName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{request.requestedBy?.name}</div>
                  <div className="text-xs text-gray-500">{request.requestedBy?.email}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(request.status)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">
                    {new Date(request.createdAt).toLocaleDateString()}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" onClick={handleActionClick}>
                  <Link 
                    to={`/headcount/${request._id}`} 
                    className="text-blue-600 hover:text-blue-900 mr-4"
                  >
                    <i className="bi bi-eye me-1"></i> View
                  </Link>
                  
                  {canApprove && request.status === 'pending' && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(request._id);
                        }}
                        className="text-green-600 hover:text-green-900 mr-4"
                      >
                        <i className="bi bi-check-circle me-1"></i> Approve
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleReject(request._id);
                        }}
                        className="text-red-600 hover:text-red-900 mr-4"
                      >
                        <i className="bi bi-x-circle me-1"></i> Reject
                      </button>
                    </>
                  )}
                  
                  {/* Remove button - available for all requests */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove(request._id);
                    }}
                    className="text-red-600 hover:text-red-900"
                  >
                    <i className="bi bi-trash me-1"></i> Remove
                  </button>
                </td>
              </tr>
            ))}  
          </tbody>
        </ScrollableTable>
      )}
    </div>
  );
};

export default HeadcountListPage;
