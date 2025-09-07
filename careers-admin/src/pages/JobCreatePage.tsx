import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import JobForm from '../components/jobs/JobForm';
import jobService, { JobCreateDto, JobUpdateDto } from '../services/jobService';
import headcountService, { HeadcountRequest } from '../services/headcountService';
import { departmentService } from '../services/departmentService';
import { useCompany } from '../context/CompanyContext';
import { toast } from 'react-toastify';

const JobCreatePage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { jobBoardId } = useParams<{ jobBoardId: string }>();
  const { company } = useCompany();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [initialData, setInitialData] = useState<Partial<JobCreateDto> | null>(null);
  const [isFromHeadcount, setIsFromHeadcount] = useState<boolean>(false);
  const [headcountRequestId, setHeadcountRequestId] = useState<string | null>(null);
  const [isFromJobBoard, setIsFromJobBoard] = useState<boolean>(false);
  
  // Check if approval workflow is set to headcount
  const isHeadcountApprovalWorkflow = company?.settings?.approvalType === 'headcount';

  // Check if we're creating a job from a job board
  useEffect(() => {
    if (jobBoardId) {
      setIsFromJobBoard(true);
      setInitialData(prevData => ({
        ...prevData || {},
        jobBoardId: jobBoardId
      }));
    }
  }, [jobBoardId]);

  // Parse query parameters for headcount request data
  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const headcountId = queryParams.get('headcountRequestId');
    const role = queryParams.get('role');
    const department = queryParams.get('department');
    
    if (headcountId && role) {
      setIsFromHeadcount(true);
      setHeadcountRequestId(headcountId);
      
      // Fetch headcount request details
      const fetchHeadcountRequest = async () => {
        setIsLoading(true);
        try {
          const headcountRequest = await headcountService.getById(headcountId);
          
          // Find department ID by name
          let departmentId = '';
          if (department) {
            // Fetch all departments to find the matching one
            const departments = await departmentService.getAll();
            const matchingDept = departments.find((dept) => dept.title === department);
            if (matchingDept && matchingDept._id) {
              departmentId = matchingDept._id;
            }
          }
          
          // Prepare initial data for the job form
          setInitialData({
            title: role,
            companyId: company?._id || '',
            headcountRequestId: headcountId,
            skipApproval: true,
            departmentIds: departmentId ? [departmentId] : [],
            // Set other fields from headcount request if available
            location: headcountRequest.location || '',
            content: `<h2>Job Description</h2><p>Role requested through headcount approval process.</p><p>Department: ${department || 'Not specified'}</p><p>Location: ${headcountRequest.location || 'Not specified'}</p>`,
            // Add role title for job role matching
            roleTitle: role
          });
        } catch (err) {
          console.error('Error fetching headcount request:', err);
          setError('Failed to load headcount request data. Please try again.');
        } finally {
          setIsLoading(false);
        }
      };
      
      fetchHeadcountRequest();
    }
  }, [location.search, company]);

  const handleSubmit = async (formData: JobCreateDto | JobUpdateDto) => {
    try {
      let jobId;
      
      if (isFromHeadcount && headcountRequestId) {
        // Create job from headcount request
        const result = await jobService.createJobFromHeadcount(
          headcountRequestId, 
          formData as JobCreateDto
          // Backend will determine if approval should be skipped based on company settings
        );
        jobId = result._id;
        
        // Mark the headcount request as having a job created
        await headcountService.markJobCreated(headcountRequestId, jobId);
        
        toast.success('Job created successfully from headcount request');
      } else {
        // Regular job creation
        const result = await jobService.createJob(formData as JobCreateDto);
        jobId = result._id;
        toast.success('Job created successfully');
      }
      
      navigate('/jobs');
    } catch (err: any) {
      console.error('Error creating job:', err);
      
      // Check for duplicate job creation error
      if (err.response && err.response.data && err.response.data.message && 
          err.response.data.message.includes('job has already been created for headcount request')) {
        toast.error('A job has already been created for this headcount request');
        // Navigate back to headcount requests page
        navigate('/headcount');
      } else {
        // Generic error handling
        toast.error('Failed to create job. Please try again.');
        setError('Failed to create job. Please try again.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/jobs');
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Create New Job</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded shadow">
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <JobForm
            initialData={initialData || undefined}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            isFromHeadcount={isFromHeadcount}
            headcountRequestId={headcountRequestId || undefined}
            isFromJobBoard={isFromJobBoard}
            jobBoardId={jobBoardId}
          />
        )}
      </div>
    </div>
  );
};

export default JobCreatePage;
