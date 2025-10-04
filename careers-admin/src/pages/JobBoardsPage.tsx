import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';
import ActionsMenu, { ActionsMenuItem } from '../components/common/ActionsMenu';
import jobBoardsService, { JobBoard } from '../services/jobBoardsService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

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


  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Job Boards</h1>
        <Button onClick={openCreateModal} variant="primary" leadingIcon={<PlusIcon className="w-5 h-5" />}> 
          Add Job Board
        </Button>
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
        <Card className="text-center">
          <p className="text-gray-500">No job boards found. Create your first job board to get started.</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobBoards.map((jobBoard) => (
            <Card
              key={jobBoard._id}
              className="cursor-pointer hover:shadow-xl transition-shadow duration-200 group"
              onClick={() => navigate(`/job-boards/${jobBoard._id}/jobs`)}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-xl font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">{jobBoard.title}</h2>
                <div onClick={(e) => e.stopPropagation()}>
                  <ActionsMenu
                    buttonAriaLabel="Job board actions"
                    buttonContent={<EllipsisHorizontalIcon className="w-5 h-5 text-gray-400 hover:text-gray-600" />}
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
              
              {jobBoard.isExternal && (
                <div className="mb-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium ${
                      jobBoard.source === 'greenhouse'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}
                  >
                    {jobBoard.source === 'greenhouse' ? 'Greenhouse' : 'Ashby'}
                  </span>
                </div>
              )}
              
              <p className="text-gray-600 text-sm mb-4 line-clamp-2">{jobBoard.description || 'No description'}</p>
              
              <div className="flex items-center justify-between pt-4 border-t border-gray-200/50">
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      jobBoard.isActive
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {jobBoard.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div className="text-xs text-gray-500">
                  {new Date(jobBoard.createdAt).toLocaleDateString()}
                </div>
              </div>
            </Card>
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
                <Input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
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
                <Button type="button" onClick={closeModal} variant="white">
                  Cancel
                </Button>
                <Button type="submit" variant="primary">
                  {currentJobBoard ? 'Update' : 'Create'}
                </Button>
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
              <Button onClick={closeDeleteModal} variant="white">
                Cancel
              </Button>
              <Button onClick={handleDelete} variant="primary">
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JobBoardsPage;
