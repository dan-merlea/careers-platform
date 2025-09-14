import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import headcountService, { HeadcountRequest, CreateHeadcountRequest } from '../services/headcountService';
import jobService, { Job } from '../services/jobService';
import { useAuth } from '../context/AuthContext';
import { useCompany } from '../context/CompanyContext';
import { jobRoleService, JobRole } from '../services/jobRoleService';
import { departmentService, Department } from '../services/departmentService';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { formatDate } from '../utils/dateUtils';

const HeadcountRequestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // We only need userRole for permission checks
  const { userRole } = useAuth();
  const { company } = useCompany();
  // Check if we're viewing an existing request (has ID)
  const isViewingExisting = !!id;
  // No longer supporting editing
  const isEditing = false;
  
  // Check if approval workflow is set to headcount
  const isHeadcountApprovalWorkflow = company?.settings?.approvalType === 'headcount';
  
  const [formData, setFormData] = useState<CreateHeadcountRequest>({
    role: '',
    department: '',
    teamName: '',
    reason: '',
  });
  
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [headcountRequest, setHeadcountRequest] = useState<HeadcountRequest | null>(null);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [isCreatingJob, setIsCreatingJob] = useState<boolean>(false);
  
  // State for dropdown options
  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  const [filteredJobRoles, setFilteredJobRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  const [jobDetails, setJobDetails] = useState<Job | null>(null);
  const [isLoadingJob, setIsLoadingJob] = useState<boolean>(false);
  
  // Check if user is a director or admin (can approve/reject)
  const canApprove = userRole === 'director' || userRole === 'admin';
  // Check if user is a manager (can create/edit)
  const canEdit = userRole === 'recruiter' || userRole === 'admin';
  // Check if user can create a job from this headcount request
  const canCreateJob = (userRole === 'admin' || userRole === 'recruiter') && 
                      isHeadcountApprovalWorkflow && 
                      headcountRequest?.status === 'approved' && 
                      !headcountRequest?.hasJobCreated;

  // Fetch job roles and departments
  useEffect(() => {
    const fetchOptions = async () => {
      setIsLoadingOptions(true);
      try {
        // Fetch job roles and departments in parallel
        const [rolesData, departmentsData] = await Promise.all([
          jobRoleService.getAll(),
          departmentService.getAll()
        ]);
        
        setAllJobRoles(rolesData);
        setFilteredJobRoles(rolesData); // Initially show all roles
        setDepartments(departmentsData);
      } catch (error) {
        console.error('Error fetching form options:', error);
        toast.error('Failed to load form options');
      } finally {
        setIsLoadingOptions(false);
      }
    };
    
    fetchOptions();
  }, []);
  
  // Filter job roles when department changes
  const handleDepartmentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = e.target;
    
    // Update formData with the selected department
    setFormData({
      ...formData,
      department: value,
      // Reset role when department changes
      role: ''
    });
    
    // Find the selected department
    const selectedDept = departments.find(dept => dept.title === value);
    
    // Filter job roles based on selected department
    if (selectedDept && selectedDept._id && selectedDept.jobRoles && selectedDept.jobRoles.length > 0) {
      // If department has jobRoles array, filter the roles
      const departmentRoles = allJobRoles.filter(role => 
        selectedDept.jobRoles?.includes(role.id || role._id || '')
      );
      setFilteredJobRoles(departmentRoles);
    } else {
      // If no department selected or no roles specified, show all roles
      setFilteredJobRoles(allJobRoles);
    }
  };

  // Function to fetch job details
  const fetchJobDetails = useCallback(async (jobId: string) => {
    if (!jobId) return;
    
    setIsLoadingJob(true);
    try {
      const jobData = await jobService.getJob(jobId);
      setJobDetails(jobData);
      console.log('Fetched job details:', jobData);
    } catch (error) {
      console.error('Error fetching job details:', error);
      toast.error('Failed to load job details');
    } finally {
      setIsLoadingJob(false);
    }
  }, []);

  // Function to refresh headcount request data
  const refreshHeadcountRequest = useCallback(async () => {
    if (!id) return;
    
    try {
      const data = await headcountService.getById(id);
      setHeadcountRequest(data);
      console.log('Refreshed headcount request data:', data);
      
      // If the headcount request has a job created, fetch the job details
      if (data.hasJobCreated && data.jobId) {
        fetchJobDetails(data.jobId);
      }
    } catch (error) {
      console.error('Error refreshing headcount request:', error);
    }
  }, [id, fetchJobDetails]);

  // Initial fetch of headcount request data
  useEffect(() => {
    const fetchInitialData = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await headcountService.getById(id);
          setHeadcountRequest(data);
          
          // If the headcount request has a job created, fetch the job details
          if (data.hasJobCreated && data.jobId) {
            fetchJobDetails(data.jobId);
          }
          
          // If user doesn't have permission to view this request, redirect
          if (!canEdit && data.requestedBy._id !== userRole) {
            navigate('/headcount');
            return;
          }
          
          // Always populate form with existing data when viewing
          setFormData({
            role: data.role,
            department: data.department,
            teamName: data.teamName,
            reason: data.reason,
          });
        } catch (error) {
          console.error('Error fetching headcount request:', error);
          toast.error('Failed to load headcount request');
          navigate('/headcount');
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    // Fetch data if we're viewing an existing request
    if (isViewingExisting) {
      fetchInitialData();
    }
  }, [id, navigate, canEdit, userRole, fetchJobDetails]);
  
  // Effect to refresh data when returning to the page
  useEffect(() => {
    // Add a listener for when the component becomes visible again after navigation
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && isEditing && id) {
        refreshHeadcountRequest();
      }
    };
    
    // Add a listener for focus events to refresh data when the window regains focus
    const handleFocus = () => {
      if (isEditing && id) {
        refreshHeadcountRequest();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    // Clean up the event listeners when the component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [isEditing, id, refreshHeadcountRequest]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Special handling for department selection
    if (name === 'department' && e.target instanceof HTMLSelectElement) {
      handleDepartmentChange(e as React.ChangeEvent<HTMLSelectElement>);
      return;
    }
    
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Only create new requests, editing is no longer supported
      await headcountService.create(formData);
      toast.success('Headcount request submitted successfully');
      navigate('/headcount');
    } catch (error) {
      console.error('Error saving headcount request:', error);
      toast.error('Failed to save headcount request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await headcountService.approve(id, reviewNotes);
      toast.success('Headcount request approved');
      navigate('/headcount');
    } catch (error) {
      console.error('Error approving request:', error);
      toast.error('Failed to approve request');
    } finally {
      setIsLoading(false);
      setIsReviewing(false);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    
    setIsLoading(true);
    try {
      await headcountService.reject(id, reviewNotes);
      toast.success('Headcount request rejected');
      navigate('/headcount');
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast.error('Failed to reject request');
    } finally {
      setIsLoading(false);
      setIsReviewing(false);
    }
  };
  
  // This duplicate function has been removed

  // Handle creating a job from an approved headcount request
  const handleCreateJob = async () => {
    if (!id || !headcountRequest) return;
    
    setIsCreatingJob(true);
    try {
      // Navigate to job creation form with headcount request ID
      navigate(`/jobs/create?headcountRequestId=${id}&role=${encodeURIComponent(headcountRequest.role)}&department=${encodeURIComponent(headcountRequest.department)}`);
    } catch (error) {
      console.error('Error navigating to job creation:', error);
      toast.error('Failed to create job from headcount request');
      setIsCreatingJob(false);
    }
  };

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If viewing an existing request
  if (isViewingExisting && headcountRequest) {
    const isPending = headcountRequest.status === 'pending';
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-6">
          <button 
            onClick={() => navigate(-1)}
            className="mr-4 p-2 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeftIcon className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-800">
            Headcount Requests
          </h1>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold">
              Headcount Request Details
              <span className="ml-2">
                {headcountRequest.status === 'pending' && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Pending</span>
                )}
                {headcountRequest.status === 'approved' && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">Approved</span>
                )}
                {headcountRequest.status === 'rejected' && (
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">Rejected</span>
                )}
              </span>
            </h1>
            
            {canApprove && isPending && !isReviewing && (
              <div>
                <button
                  onClick={() => setIsReviewing(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center"
                >
                  <i className="bi bi-clipboard-check me-2"></i> Review Request
                </button>
              </div>
            )}
            
            {/* Add Create Job button for approved headcount requests */}
            {canCreateJob && (
              <div>
                <button
                  onClick={handleCreateJob}
                  disabled={isCreatingJob}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center"
                >
                  {isCreatingJob ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Creating...
                    </>
                  ) : (
                    <><i className="bi bi-briefcase me-2"></i> Create Job Opening</>
                  )}
                </button>
              </div>
            )}
          </div>
          
          {isReviewing ? (
            <div className="mb-6 p-4 border border-gray-200 rounded-lg">
              <h2 className="text-lg font-semibold mb-4">Review Decision</h2>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2">
                  Review Notes
                </label>
                <textarea
                  name="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows={4}
                  placeholder="Enter your review notes here..."
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  onClick={() => setIsReviewing(false)}
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2 flex items-center"
                  disabled={isLoading}
                >
                  <i className="bi bi-x-circle me-2"></i> Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2 flex items-center"
                  disabled={isLoading}
                >
                  <i className="bi bi-x-circle me-2"></i> Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center"
                  disabled={isLoading}
                >
                  <i className="bi bi-check-circle me-2"></i> Approve
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h2 className="text-lg font-semibold mb-4">Request Information</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Role</label>
                  <p className="text-gray-900">{headcountRequest.role}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Department</label>
                  <p className="text-gray-900">{headcountRequest.department}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Team Name</label>
                  <p className="text-gray-900">{headcountRequest.teamName}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Reason</label>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="text-gray-900 whitespace-pre-wrap">{headcountRequest.reason}</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold mb-4">Request Details</h2>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Requested By</label>
                  <p className="text-gray-900">{headcountRequest.requestedBy?.name}</p>
                  <p className="text-gray-500 text-sm">{headcountRequest.requestedBy?.email}</p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">Requested Date</label>
                  <p className="text-gray-900">{formatDate(headcountRequest.createdAt)}</p>
                </div>
                
                {/* Job Details Section */}
                {headcountRequest.hasJobCreated && headcountRequest.jobId && (
                  <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h3 className="text-md font-semibold text-green-800 mb-2">Job Opening Created</h3>
                    {isLoadingJob ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin h-4 w-4 border-t-2 border-b-2 border-green-500 rounded-full"></div>
                        <p className="text-sm text-gray-600">Loading job details...</p>
                      </div>
                    ) : jobDetails ? (
                      <div>
                        <p className="text-sm mb-2"><span className="font-medium">Title:</span> {jobDetails.title}</p>
                        <p className="text-sm mb-2"><span className="font-medium">Status:</span> {jobDetails.status.toUpperCase()}</p>
                        {jobDetails.publishedDate && (
                          <p className="text-sm mb-2"><span className="font-medium">Published:</span> {formatDate(jobDetails.publishedDate)}</p>
                        )}
                        <div className="mt-3">
                          <Link 
                            to={`/job-boards/${jobDetails.jobBoardId}/jobs/${jobDetails.id}`}
                            className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            View full job details
                          </Link>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600">Job details not available</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
          
          {headcountRequest.reviewedBy && (
            <>
              <hr className="my-6 border-t border-gray-300" />
              <h2 className="text-lg font-semibold mb-4">Review Information</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Reviewed By</label>
                    <p className="text-gray-900">{headcountRequest.reviewedBy?.name}</p>
                    <p className="text-gray-500 text-sm">{headcountRequest.reviewedBy?.email}</p>
                  </div>
                  
                  {headcountRequest.reviewedAt && (
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">Review Date</label>
                      <p className="text-gray-900">{formatDate(headcountRequest.reviewedAt)}</p>
                    </div>
                  )}
                </div>
                
                {headcountRequest.reviewNotes && (
                  <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Review Notes</label>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200">
                      <p className="text-gray-900 whitespace-pre-wrap">{headcountRequest.reviewNotes}</p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
          
          {/* Edit button removed as per requirements */}
        </div>
      </div>
    );
  }

  // Form for creating/editing
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <button 
          onClick={() => navigate('/headcount')}
          className="text-blue-600 hover:text-blue-800 flex items-center"
        >
          <i className="bi bi-arrow-left me-2"></i> Back to Headcount Requests
        </button>
      </div>
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold mb-6">
          {isEditing ? 'Edit Headcount Request' : 'New Headcount Request'}
        </h1>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="department">
              Department *
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isLoadingOptions}
            >
              <option value="">Select a department...</option>
              {departments.map((department) => (
                <option key={department.id || department._id} value={department.title}>
                  {department.title}
                </option>
              ))}
            </select>
            {isLoadingOptions && (
              <p className="text-sm text-gray-500 mt-1">Loading departments...</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="role">
              Role *
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
              disabled={isLoadingOptions || !formData.department}
            >
              <option value="">Select a role...</option>
              {filteredJobRoles.map((role) => (
                <option key={role.id || role._id} value={role.title}>
                  {role.title}
                </option>
              ))}
            </select>
            {isLoadingOptions ? (
              <p className="text-sm text-gray-500 mt-1">Loading roles...</p>
            ) : !formData.department ? (
              <p className="text-sm text-gray-500 mt-1">Select a department first</p>
            ) : filteredJobRoles.length === 0 ? (
              <p className="text-sm text-gray-500 mt-1">No roles available for this department</p>
            ) : null}
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="teamName">
              Team Name *
            </label>
            <input
              type="text"
              id="teamName"
              name="teamName"
              value={formData.teamName}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              placeholder="e.g. Web Development"
              required
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="reason">
              Reason *
            </label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={6}
              placeholder="Explain why this headcount is needed..."
              required
            />
          </div>
          
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <i className="bi bi-arrow-repeat me-2 animate-spin"></i> Saving...
                </>
              ) : isEditing ? (
                <>
                  <i className="bi bi-save me-2"></i> Update Request
                </>
              ) : (
                <>
                  <i className="bi bi-send me-2"></i> Submit Request
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeadcountRequestForm;
