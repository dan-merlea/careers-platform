import React from 'react';
import { JobRole, CreateJobRoleDto, UpdateJobRoleDto } from '../../../services/jobRoleService';
import { JobFunction } from '../../../services/jobFunctionService';
import JobRoleForm from '../../company/JobRoleForm';
import Button from '../../common/Button';
import Card from '../../common/Card';
import ScrollableTable from '../../common/ScrollableTable';
import ActionsMenu from '../../common/ActionsMenu';

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
            <Button onClick={handleAddJobRole} variant="primary" disabled={jobFunctions.length === 0}>
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
            <ScrollableTable>
              <>
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Title
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Job Function
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      
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
                        <td className="py-2 px-4 whitespace-nowrap text-center">
                          <ActionsMenu
                            items={[
                              {
                                label: 'Edit',
                                onClick: () => handleEditJobRole(jobRole),
                                icon: (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                ),
                              },
                              {
                                label: 'Delete',
                                onClick: () => {
                                  if (window.confirm('Are you sure you want to delete this job role?')) {
                                    handleDeleteJobRole(jobRole._id);
                                  }
                                },
                                variant: 'danger',
                                icon: (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                ),
                              },
                            ]}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </>
            </ScrollableTable>
          )}
        </>
      )}
    </Card>
  );
};

export default JobRolesSection;
