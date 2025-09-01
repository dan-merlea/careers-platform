import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import headcountService, { HeadcountRequest, CreateHeadcountRequest } from '../services/headcountService';
import { useAuth } from '../context/AuthContext';
import { jobRoleService, JobRole } from '../services/jobRoleService';
import { departmentService, Department } from '../services/departmentService';

const HeadcountRequestForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  // We only need userRole for permission checks
  const { userRole } = useAuth();
  const isEditing = !!id;
  
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
  
  // State for dropdown options
  const [allJobRoles, setAllJobRoles] = useState<JobRole[]>([]);
  const [filteredJobRoles, setFilteredJobRoles] = useState<JobRole[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState<boolean>(false);
  
  // Check if user is a director or admin (can approve/reject)
  const canApprove = userRole === 'director' || userRole === 'admin';
  // Check if user is a manager (can create/edit)
  const canEdit = userRole === 'manager' || userRole === 'admin';

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

  useEffect(() => {
    const fetchHeadcountRequest = async () => {
      if (id) {
        setIsLoading(true);
        try {
          const data = await headcountService.getById(id);
          setHeadcountRequest(data);
          
          // Only populate form data if user can edit
          if (canEdit && data.status === 'pending') {
            setFormData({
              role: data.role,
              department: data.department,
              teamName: data.teamName,
              reason: data.reason,
            });
          }
        } catch (error) {
          console.error('Error fetching headcount request:', error);
          toast.error('Failed to load headcount request');
          navigate('/headcount');
        } finally {
          setIsLoading(false);
        }
      }
    };

    if (isEditing) {
      fetchHeadcountRequest();
    }
  }, [id, navigate, canEdit, isEditing]);

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
      if (isEditing) {
        await headcountService.update(id!, formData);
        toast.success('Headcount request updated successfully');
      } else {
        await headcountService.create(formData);
        toast.success('Headcount request submitted successfully');
      }
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

  if (isLoading && isEditing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If viewing an existing request
  if (isEditing && headcountRequest) {
    const isPending = headcountRequest.status === 'pending';
    
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <button 
            onClick={() => navigate('/headcount')}
            className="text-blue-600 hover:text-blue-800"
          >
            &larr; Back to Headcount Requests
          </button>
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2"
                >
                  Review Request
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
                  className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded mr-2"
                  disabled={isLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded mr-2"
                  disabled={isLoading}
                >
                  Reject
                </button>
                <button
                  onClick={handleApprove}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  Approve
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
                  <p className="text-gray-900">{new Date(headcountRequest.createdAt).toLocaleDateString()}</p>
                </div>
                
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
                      <p className="text-gray-900">{new Date(headcountRequest.reviewedAt).toLocaleDateString()}</p>
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
          
          {canEdit && isPending && !isReviewing && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/headcount/edit/${id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              >
                Edit Request
              </button>
            </div>
          )}
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
          className="text-blue-600 hover:text-blue-800"
        >
          &larr; Back to Headcount Requests
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
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditing ? 'Update Request' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default HeadcountRequestForm;
