import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import jobTemplateService, { JobTemplate, CreateJobTemplateRequest } from '../../services/jobTemplateService';
import { format } from 'date-fns';
import Button from '../common/Button';

interface SaveTemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  role: string; // This is the role ID
  roleTitle?: string; // Optional role title for display purposes
  departmentId?: string;
  onSaveSuccess: () => void;
}

const SaveTemplateModal: React.FC<SaveTemplateModalProps> = ({
  isOpen,
  onClose,
  content,
  role,
  departmentId,
  onSaveSuccess
}) => {
  const [templates, setTemplates] = useState<JobTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');

  const loadTemplates = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await jobTemplateService.getByRole(role);
      setTemplates(data);
    } catch (err) {
      setError('Failed to load templates');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [role]);

  useEffect(() => {
    if (isOpen) {
      loadTemplates();
    }
  }, [isOpen, loadTemplates]);

  const handleSave = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (isCreatingNew) {
        if (!newTemplateName.trim()) {
          setError('Template name is required');
          setIsLoading(false);
          return;
        }

        const templateData: CreateJobTemplateRequest = {
          name: newTemplateName,
          content,
          role,
          departmentId
        };

        await jobTemplateService.create(templateData);
        toast.success('Template created successfully');
      } else {
        if (!selectedTemplate) {
          setError('Please select a template to override');
          setIsLoading(false);
          return;
        }

        await jobTemplateService.update(selectedTemplate, { content });
        toast.success('Template updated successfully');
      }

      onSaveSuccess();
      onClose();
    } catch (err) {
      setError('Failed to save template');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Save as Template</h2>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block mb-2">
            <input
              type="radio"
              checked={!isCreatingNew}
              onChange={() => setIsCreatingNew(false)}
              className="mr-2"
            />
            Override existing template
          </label>
          
          {!isCreatingNew && (
            <select
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
              className="w-full border rounded p-2"
              disabled={isLoading || !templates || templates.length === 0}
            >
              <option value="">Select a template</option>
              {templates?.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.name} ({format(new Date(template.createdAt), 'MMM d, yyyy')})
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="mb-6">
          <label className="block mb-2">
            <input
              type="radio"
              checked={isCreatingNew}
              onChange={() => setIsCreatingNew(true)}
              className="mr-2"
            />
            Create new template
          </label>
          
          {isCreatingNew && (
            <input
              type="text"
              value={newTemplateName}
              onChange={(e) => setNewTemplateName(e.target.value)}
              placeholder="Template name"
              className="w-full border rounded p-2"
              disabled={isLoading}
            />
          )}
        </div>

        <div className="flex justify-end space-x-3">
          <Button type="button" onClick={onClose} disabled={isLoading} variant="white">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading || (isCreatingNew && !newTemplateName) || (!isCreatingNew && !selectedTemplate)}
            variant="primary"
          >
            {isLoading ? 'Saving...' : 'Save Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SaveTemplateModal;
