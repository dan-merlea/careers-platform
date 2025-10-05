import React from 'react';
import { JobFunction, CreateJobFunctionDto, UpdateJobFunctionDto } from '../../../services/jobFunctionService';
import JobFunctionForm from '../JobFunctionForm';
import Button from '../../common/Button';
import Card from '../../common/Card';
import ScrollableTable from '../../common/ScrollableTable';
import ActionsMenu from '../../common/ActionsMenu';

interface JobFunctionsSectionProps {
  jobFunctions: JobFunction[];
  loadingJobFunction: boolean;
  selectedJobFunction: JobFunction | undefined;
  showJobFunctionForm: boolean;
  savingJobFunction: boolean;
  jobFunctionError: string | null;
  jobFunctionSuccess: string | null;
  handleEditJobFunction: (jobFunction: JobFunction) => void;
  handleAddJobFunction: () => void;
  handleJobFunctionFormSubmit: (data: CreateJobFunctionDto | UpdateJobFunctionDto) => Promise<void>;
  handleJobFunctionFormCancel: () => void;
  handleDeleteJobFunction: (id: string) => void;
}

const JobFunctionsSection: React.FC<JobFunctionsSectionProps> = ({
  jobFunctions,
  loadingJobFunction,
  selectedJobFunction,
  showJobFunctionForm,
  savingJobFunction,
  jobFunctionError,
  jobFunctionSuccess,
  handleEditJobFunction,
  handleAddJobFunction,
  handleJobFunctionFormSubmit,
  handleJobFunctionFormCancel,
  handleDeleteJobFunction
}) => {
  return (
    <Card>
      {showJobFunctionForm ? (
        <JobFunctionForm
          jobFunction={selectedJobFunction}
          onSubmit={handleJobFunctionFormSubmit}
          onCancel={handleJobFunctionFormCancel}
          isSubmitting={savingJobFunction}
        />
      ) : (
        <>
          {jobFunctionSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{jobFunctionSuccess}</p>
            </div>
          )}
          
          {jobFunctionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{jobFunctionError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Job Functions</h2>
            <Button onClick={handleAddJobFunction} variant="secondary">
              Add Job Function
            </Button>
          </div>
          
          {loadingJobFunction ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading job functions...</p>
            </div>
          ) : (
            <ScrollableTable>
              <>
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
                      
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {jobFunctions.length === 0 ? (
                    <tr>
                      <td colSpan={3} className="py-4 px-4 text-center text-gray-500">
                        No job functions found. Add your first job function.
                      </td>
                    </tr>
                  ) : (
                    jobFunctions.map((jobFunction) => (
                      <tr key={jobFunction._id}>
                        <td className="py-2 px-4 whitespace-nowrap">
                          {jobFunction.title}
                        </td>
                        <td className="py-2 px-4">
                          {jobFunction.description || '-'}
                        </td>
                        <td className="py-2 px-4 whitespace-nowrap text-center">
                          <ActionsMenu
                            items={[
                              {
                                label: 'Edit',
                                onClick: () => handleEditJobFunction(jobFunction),
                                icon: (
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                ),
                              },
                              {
                                label: 'Delete',
                                onClick: () => {
                                  if (window.confirm('Are you sure you want to delete this job function?')) {
                                    handleDeleteJobFunction(jobFunction._id);
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

export default JobFunctionsSection;
