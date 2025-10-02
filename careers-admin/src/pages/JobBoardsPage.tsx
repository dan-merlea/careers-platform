import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import ActionsMenu, { ActionsMenuItem } from '../components/common/ActionsMenu';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';

const JobBoardsPage: React.FC = () => {
  const navigate = useNavigate();
  const [jobBoards, setJobBoards] = useState<JobBoard[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentJobBoard, setCurrentJobBoard] = useState<JobBoard | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    isActive: true
  });
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [jobBoardToDelete, setJobBoardToDelete] = useState<JobBoard | null>(null);

  // Fetch job boards on component mount
  useEffect(() => {
    fetchJobBoards();
  }, []);

  // Fetch all job boards
  const fetchJobBoards = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await jobBoardsService.getAllJobBoards();
      setJobBoards(data);
    } catch (err) {
      console.error('Error fetching job boards:', err);
      setError('Failed to load job boards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  // Open modal for creating a new job board
  const openCreateModal = () => {
    setCurrentJobBoard(null);
    setFormData({
      title: '',
      description: '',
      isActive: true
    });
    setIsModalOpen(true);
  };

  // Open modal for editing an existing job board
  const openEditModal = (jobBoard: JobBoard) => {
    setCurrentJobBoard(jobBoard);
    setFormData({
      title: jobBoard.title,
      description: jobBoard.description || '',
      isActive: jobBoard.isActive
    });
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (currentJobBoard) {
        // Update existing job board
        await jobBoardsService.updateJobBoard(currentJobBoard._id, formData);
      } else {
        // Create new job board
        await jobBoardsService.createJobBoard(formData);
      }
      
      // Refresh job boards list
      await fetchJobBoards();
      closeModal();
    } catch (err) {
      console.error('Error saving job board:', err);
      setError('Failed to save job board. Please try again.');
    }
  };

  // Open delete confirmation modal
  const openDeleteModal = (jobBoard: JobBoard) => {
    setJobBoardToDelete(jobBoard);
    setIsDeleting(true);
  };

  // Close delete confirmation modal
  const closeDeleteModal = () => {
    setIsDeleting(false);
    setJobBoardToDelete(null);
  };

  // Handle job board deletion
  const handleDelete = async () => {
    if (!jobBoardToDelete) return;
    
    try {
      await jobBoardsService.deleteJobBoard(jobBoardToDelete._id);
      await fetchJobBoards();
      closeDeleteModal();
    } catch (err) {
      console.error('Error deleting job board:', err);
      setError('Failed to delete job board. Please try again.');
    }
  };

  // Create external job board (Greenhouse or Ashby)
  const createExternalJobBoard = async (source: 'greenhouse' | 'ashby') => {
    try {
      await jobBoardsService.createExternalJobBoard(source);
      await fetchJobBoards();
    } catch (err) {
      console.error(`Error creating ${source} job board:`, err);
      setError(`Failed to create ${source} job board. Please try again.`);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Boards</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => createExternalJobBoard('greenhouse')}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            Connect Greenhouse
          </button>
          <button
            onClick={() => createExternalJobBoard('ashby')}
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Connect Ashby
          </button>
          <button
            onClick={openCreateModal}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Job Board
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : jobBoards.length === 0 ? (
        <div className="bg-white p-6 rounded shadow text-center">
          <p className="text-gray-500">No job boards found. Create your first job board to get started.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobBoards.map((jobBoard) => (
            <div
              key={jobBoard._id}
              className={`bg-white p-6 rounded shadow border-l-4 cursor-pointer ${
                jobBoard.isExternal
                  ? jobBoard.source === 'greenhouse'
                    ? 'border-green-500'
                    : 'border-purple-500'
                  : 'border-blue-500'
              }`}
              onClick={() => navigate(`/job-boards/${jobBoard._id}/jobs`)}
            >
              <div className="flex justify-between items-start">
                <h2 className="text-xl font-semibold text-gray-800">{jobBoard.title}</h2>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionsMenu
                    buttonAriaLabel="Job board actions"
                    buttonContent={<EllipsisHorizontalIcon className="w-5 h-5 text-gray-600" />}
                    align="right"
                    menuWidthPx={192}
                    items={(() => {
                      const items: ActionsMenuItem[] = [
                        { label: 'Edit', onClick: () => openEditModal(jobBoard), icon: <PencilIcon className="w-4 h-4" /> },
                        { label: 'Delete', onClick: () => openDeleteModal(jobBoard), icon: <TrashIcon className="w-4 h-4" />, variant: 'danger' },
                      ];
                      return items;
                    })()}
                  />
                </div>
              </div>
              
              <p className="text-gray-600 mt-2">{jobBoard.description || 'No description'}</p>
              
              <div className="mt-4 flex items-center">
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    jobBoard.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {jobBoard.isActive ? 'Active' : 'Inactive'}
                </span>
                
                {jobBoard.isExternal && (
                  <span
                    className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      jobBoard.source === 'greenhouse'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-purple-100 text-purple-800'
                    }`}
                  >
                    {jobBoard.source === 'greenhouse' ? 'Greenhouse' : 'Ashby'}
                  </span>
                )}
              </div>
              
              <div className="mt-4 text-xs text-gray-500">
                Created: {new Date(jobBoard.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">
              {currentJobBoard ? 'Edit Job Board' : 'Create Job Board'}
            </h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full p-2 border border-gray-300 rounded"
                  rows={3}
                />
              </div>
              
              <div className="mb-6">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isActive"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleCheckboxChange}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded"
                  />
                  <label htmlFor="isActive" className="ml-2 block text-sm text-gray-700">
                    Active
                  </label>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  {currentJobBoard ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleting && jobBoardToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Delete Job Board</h2>
            <p className="mb-6">
              Are you sure you want to delete the job board "{jobBoardToDelete.title}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-2">
              <button
                onClick={closeDeleteModal}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardsPage;
