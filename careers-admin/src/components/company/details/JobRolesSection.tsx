import React from 'react';
import { JobRole, CreateJobRoleDto, UpdateJobRoleDto } from '../../../services/jobRoleService';
import { JobFunction } from '../../../services/jobFunctionService';
import JobRoleForm from '../../company/JobRoleForm';
import Button from '../../common/Button';
import Card from '../../common/Card';

interface JobRolesSectionProps {
  jobRoles: JobRole[];
  jobFunctions: JobFunction[];
  loadingJobRole: boolean;
  selectedJobRole: JobRole | undefined;
  showJobRoleForm: boolean;
  savingJobRole: boolean;
  jobRoleError: string | null;
  jobRoleSuccess: string | null;
  handleEditJobRole: (jobRole: JobRole) => void;
  handleAddJobRole: () => void;
  handleJobRoleFormSubmit: (data: CreateJobRoleDto | UpdateJobRoleDto) => Promise<void>;
  handleJobRoleFormCancel: () => void;
  handleDeleteJobRole: (id: string) => void;
}

const JobRolesSection: React.FC<JobRolesSectionProps> = ({
  jobRoles,
  jobFunctions,
  loadingJobRole,
  selectedJobRole,
  showJobRoleForm,
  savingJobRole,
  jobRoleError,
  jobRoleSuccess,
  handleEditJobRole,
  handleAddJobRole,
  handleJobRoleFormSubmit,
  handleJobRoleFormCancel,
  handleDeleteJobRole
}) => {

  return (
    <Card>
      {showJobRoleForm ? (
        <JobRoleForm
          jobRole={selectedJobRole}
          jobFunctions={jobFunctions}
          onSubmit={handleJobRoleFormSubmit}
          onCancel={handleJobRoleFormCancel}
          isSubmitting={savingJobRole}
        />
      ) : (
        <>
          {jobRoleSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{jobRoleSuccess}</p>
            </div>
          )}
          
          {jobRoleError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{jobRoleError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Job Roles</h2>
            <Button onClick={handleAddJobRole} variant="secondary" disabled={jobFunctions.length === 0}>
              Add Job Role
            </Button>
          </div>
          
          {jobFunctions.length === 0 && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4">
              <p>Please add job functions before creating job roles.</p>
            </div>
          )}
          
          {loadingJobRole ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading job roles...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Function
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobRoles.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                        No job roles found. Add your first job role.
                      </td>
                    </tr>
                  ) : (
                    jobRoles.map((jobRole) => (
                      <tr key={jobRole._id}>
                        <td className="py-2 px-4 whitespace-nowrap">
                          {jobRole.title}
                        </td>
                        <td className="py-2 px-4">
                          {jobRole.jobFunction.title}
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button onClick={() => handleEditJobRole(jobRole)} variant="white" className="!h-auto py-1 px-2 text-sm">
                            Edit
                          </Button>
                          <Button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this job role?')) {
                                handleDeleteJobRole(jobRole._id);
                              }
                            }}
                            variant="primary"
                            className="!h-auto py-1 px-2 text-sm"
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </Card>
  );
};

export default JobRolesSection;
