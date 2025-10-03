import React from 'react';
import { JobFunction, CreateJobFunctionDto, UpdateJobFunctionDto } from '../../../services/jobFunctionService';
import JobFunctionForm from '../JobFunctionForm';
import Button from '../../common/Button';
import Card from '../../common/Card';

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
            <div className="overflow-x-auto">
              <table className="min-w-full bg-white">
                <thead>
                  <tr>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="py-2 px-4 border-b border-gray-200 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
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
                        <td className="py-2 px-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                          <Button onClick={() => handleEditJobFunction(jobFunction)} variant="white" className="!h-auto py-1 px-2 text-sm">
                            Edit
                          </Button>
                          <Button
                            onClick={() => {
                              if (window.confirm('Are you sure you want to delete this job function?')) {
                                handleDeleteJobFunction(jobFunction._id);
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

export default JobFunctionsSection;
