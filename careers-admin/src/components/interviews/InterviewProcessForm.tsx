import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import '../../styles/QuillFix.css';
import { toast } from 'react-toastify';
import { 
  InterviewProcess, 
  InterviewProcessCreateDto, 
  InterviewProcessUpdateDto,
  InterviewStage
} from '../../services/interviewProcessService';
import { jobRoleService, JobRole } from '../../services/jobRoleService';

interface InterviewProcessFormProps {
  initialData?: InterviewProcess;
  onSubmit: (data: InterviewProcessCreateDto | InterviewProcessUpdateDto) => Promise<void>;
  isEdit?: boolean;
}

const InterviewProcessForm: React.FC<InterviewProcessFormProps> = ({
  initialData,
  onSubmit,
  isEdit = false,
}) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<InterviewProcessCreateDto | InterviewProcessUpdateDto>({
    jobRoleId: '',
    stages: [],
    ...initialData && {
      jobRoleId: initialData.jobRole.id,
      stages: initialData.stages,
    }
  });
  
  const [jobRoles, setJobRoles] = useState<JobRole[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [activeStageIndex, setActiveStageIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchJobRoles = async () => {
      setIsLoading(true);
      try {
        const roles = await jobRoleService.getAll();
        setJobRoles(roles);
      } catch (err) {
        console.error('Error fetching job roles:', err);
        setError('Failed to load job roles. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchJobRoles();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleAddStage = () => {
    const newStage: InterviewStage = {
      title: '',
      description: '',
      considerations: [],
      emailTemplate: '',
      order: formData.stages ? formData.stages.length : 0
    };

    setFormData({
      ...formData,
      stages: [...(formData.stages || []), newStage]
    });
    
    // Set the new stage as active for editing
    setActiveStageIndex((formData.stages || []).length);
  };

  const handleRemoveStage = (index: number) => {
    const updatedStages = [...(formData.stages || [])];
    updatedStages.splice(index, 1);
    
    // Reorder stages
    const reorderedStages = updatedStages.map((stage, idx) => ({
      ...stage,
      order: idx
    }));
    
    setFormData({
      ...formData,
      stages: reorderedStages
    });
    
    // Reset active stage if the active one was removed
    if (activeStageIndex === index) {
      setActiveStageIndex(null);
    } else if (activeStageIndex !== null && activeStageIndex > index) {
      // Adjust active index if a stage before it was removed
      setActiveStageIndex(activeStageIndex - 1);
    }
  };

  const handleStageInputChange = (index: number, field: keyof InterviewStage, value: string | string[]) => {
    const updatedStages = [...(formData.stages || [])];
    updatedStages[index] = {
      ...updatedStages[index],
      [field]: value
    };
    
    setFormData({
      ...formData,
      stages: updatedStages
    });
  };

  const handleAddConsideration = (stageIndex: number) => {
    const updatedStages = [...(formData.stages || [])];
    updatedStages[stageIndex] = {
      ...updatedStages[stageIndex],
      considerations: [...updatedStages[stageIndex].considerations, '']
    };
    
    setFormData({
      ...formData,
      stages: updatedStages
    });
  };

  const handleRemoveConsideration = (stageIndex: number, considerationIndex: number) => {
    const updatedStages = [...(formData.stages || [])];
    const updatedConsiderations = [...updatedStages[stageIndex].considerations];
    updatedConsiderations.splice(considerationIndex, 1);
    
    updatedStages[stageIndex] = {
      ...updatedStages[stageIndex],
      considerations: updatedConsiderations
    };
    
    setFormData({
      ...formData,
      stages: updatedStages
    });
  };

  const handleConsiderationChange = (stageIndex: number, considerationIndex: number, value: string) => {
    const updatedStages = [...(formData.stages || [])];
    const updatedConsiderations = [...updatedStages[stageIndex].considerations];
    updatedConsiderations[considerationIndex] = value;
    
    updatedStages[stageIndex] = {
      ...updatedStages[stageIndex],
      considerations: updatedConsiderations
    };
    
    setFormData({
      ...formData,
      stages: updatedStages
    });
  };

  const handleMoveStage = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === (formData.stages?.length || 0) - 1)
    ) {
      return; // Can't move first item up or last item down
    }
    
    const updatedStages = [...(formData.stages || [])];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap items
    [updatedStages[index], updatedStages[newIndex]] = [updatedStages[newIndex], updatedStages[index]];
    
    // Update order property
    const reorderedStages = updatedStages.map((stage, idx) => ({
      ...stage,
      order: idx
    }));
    
    setFormData({
      ...formData,
      stages: reorderedStages
    });
    
    // Update active stage index if needed
    if (activeStageIndex === index) {
      setActiveStageIndex(newIndex);
    } else if (activeStageIndex === newIndex) {
      setActiveStageIndex(index);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.jobRoleId || !(formData.stages && formData.stages.length > 0)) {
      toast.error('Please select a job role and add at least one stage');
      return;
    }
    
    // Validate stages
    const invalidStages = (formData.stages || []).filter(stage => !stage.title || !stage.description);
    if (invalidStages.length > 0) {
      toast.error('Please fill in all required fields for each stage');
      return;
    }
    
    try {
      await onSubmit(formData);
      navigate('/interviews');
    } catch (err) {
      console.error('Error submitting form:', err);
      toast.error('Failed to save interview process. Please try again.');
    }
  };

  const handleCancel = () => {
    navigate('/interviews');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center mb-4">
          <div className="bg-blue-100 p-2 rounded-full mr-3">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-blue-800">Select Job Role</h2>
        </div>
        
        <div className="mb-2">
          <label htmlFor="jobRoleId" className="block text-sm font-medium text-gray-700 mb-1">
            Job Role *
          </label>
          <select
            id="jobRoleId"
            name="jobRoleId"
            value={formData.jobRoleId || ''}
            onChange={handleInputChange}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            required
          >
            <option value="">Select a job role</option>
            {jobRoles.map(role => (
              <option key={role._id} value={role._id}>
                {role.title}
              </option>
            ))}
          </select>
        </div>
        
        <p className="text-sm text-gray-500 italic">
          The interview process will be created for the selected job role.
        </p>
      </div>


      <div className="mt-8 bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-blue-100 p-2 rounded-full mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h2 className="text-lg font-semibold text-blue-800">Interview Stages</h2>
          </div>
          <button
            type="button"
            onClick={handleAddStage}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
            </svg>
            Add Stage
          </button>
        </div>

        {formData.stages && formData.stages.length > 0 ? (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="w-full md:w-1/4">
                <ul className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
                  {(formData.stages || []).map((stage, index) => (
                    <li 
                      key={index}
                      className={`p-4 border-b border-gray-200 last:border-b-0 cursor-pointer transition-all duration-200 hover:bg-gray-50 ${activeStageIndex === index ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''}`}
                      onClick={() => setActiveStageIndex(index)}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center">
                          <div className="bg-blue-100 text-blue-800 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                            {index + 1}
                          </div>
                          <span className="font-medium">{stage.title || `Stage ${index + 1}`}</span>
                        </div>
                        <div className="flex space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStage(index, 'up');
                          }}
                          disabled={index === 0}
                          className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveStage(index, 'down');
                          }}
                          disabled={index === (formData.stages?.length || 0) - 1}
                          className={`p-1 rounded ${index === (formData.stages?.length || 0) - 1 ? 'text-gray-300' : 'text-gray-500 hover:bg-gray-200'}`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRemoveStage(index);
                          }}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="w-full md:w-3/4">
                {activeStageIndex !== null && formData.stages && formData.stages[activeStageIndex] ? (
                  <div className="bg-white rounded border border-gray-200 p-4 space-y-4">
                    <div>
                      <label htmlFor={`stage-title-${activeStageIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Stage Title *
                      </label>
                      <input
                        type="text"
                        id={`stage-title-${activeStageIndex}`}
                        value={formData.stages?.[activeStageIndex]?.title || ''}
                        onChange={(e) => handleStageInputChange(activeStageIndex, 'title', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded"
                        required
                      />
                    </div>

                    <div>
                      <label htmlFor={`stage-description-${activeStageIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Stage Description *
                      </label>
                      <textarea
                        id={`stage-description-${activeStageIndex}`}
                        value={formData.stages?.[activeStageIndex]?.description || ''}
                        onChange={(e) => handleStageInputChange(activeStageIndex, 'description', e.target.value)}
                        className="w-full p-2 border border-gray-300 rounded h-24"
                        required
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Interview Considerations
                        </label>
                        <button
                          type="button"
                          onClick={() => handleAddConsideration(activeStageIndex)}
                          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                          </svg>
                          Add Consideration
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.stages?.[activeStageIndex]?.considerations?.map((consideration, idx) => (
                          <div key={idx} className="flex items-center">
                            <input
                              type="text"
                              value={consideration}
                              onChange={(e) => handleConsiderationChange(activeStageIndex, idx, e.target.value)}
                              className="flex-grow p-2 border border-gray-300 rounded"
                              placeholder="Enter consideration point"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveConsideration(activeStageIndex, idx)}
                              className="ml-2 p-1 text-red-500 hover:bg-red-50 rounded"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </div>
                        ))}
                        {(formData.stages?.[activeStageIndex]?.considerations?.length || 0) === 0 && (
                          <p className="text-sm text-gray-500 italic">No considerations added yet.</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor={`stage-email-${activeStageIndex}`} className="block text-sm font-medium text-gray-700 mb-1">
                        Email Template *
                      </label>
                      <ReactQuill
                        theme="snow"
                        value={formData.stages?.[activeStageIndex]?.emailTemplate || ''}
                        onChange={(content) => handleStageInputChange(activeStageIndex, 'emailTemplate', content)}
                        modules={{
                          toolbar: [
                            [{ 'header': [1, 2, 3, false] }],
                            ['bold', 'italic', 'underline', 'strike'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link'],
                            ['clean']
                          ],
                        }}
                        formats={[
                          'header',
                          'bold', 'italic', 'underline', 'strike',
                          'list', 'bullet',
                          'link'
                        ]}
                        className="bg-white h-64 max-w-full"
                        style={{ maxWidth: '100%', overflow: 'hidden' }}
                      />
                    </div>
                    
                    <div className="mt-6 flex justify-end">
                      <button
                        type="button"
                        onClick={() => setActiveStageIndex(null)}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors shadow-sm flex items-center"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Save & Collapse
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded border border-gray-200 p-6 text-center">
                    <p className="text-gray-500">
                      {formData.stages && formData.stages.length > 0
                        ? 'Select a stage from the list to edit its details'
                        : 'Add a stage to get started'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 rounded border border-gray-200 p-6 text-center">
            <p className="text-gray-500">No stages added yet. Click "Add Stage" to create your first interview stage.</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-8 border-t border-gray-200 mt-8">
        <button
          type="button"
          onClick={handleCancel}
          className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors shadow-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
          {isEdit ? 'Update' : 'Create'} Interview Process
        </button>
      </div>
    </form>
  );
};

export default InterviewProcessForm;
