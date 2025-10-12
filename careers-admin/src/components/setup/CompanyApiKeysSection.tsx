import React, { useState, useEffect } from 'react';
import { PlusIcon, TrashIcon, ClipboardDocumentIcon, CheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import companyApiKeysService, { CompanyApiKey, GenerateApiKeyResponse } from '../../services/companyApiKeys.service';
import Button from '../common/Button';
import Card from '../common/Card';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from 'react-toastify';

const CompanyApiKeysSection: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<CompanyApiKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDescription, setNewKeyDescription] = useState('');
  const [generatedKey, setGeneratedKey] = useState<GenerateApiKeyResponse | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [keyToDelete, setKeyToDelete] = useState<{ id: string; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadApiKeys();
  }, []);

  const loadApiKeys = async () => {
    try {
      setLoading(true);
      const keys = await companyApiKeysService.getAll();
      setApiKeys(keys);
    } catch (error) {
      console.error('Error loading API keys:', error);
      toast.error('Failed to load API keys');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!newKeyName.trim()) {
      toast.error('Please enter a name for the API key');
      return;
    }

    try {
      setIsCreating(true);
      const result = await companyApiKeysService.generate({
        name: newKeyName,
        description: newKeyDescription || undefined,
      });
      
      setGeneratedKey(result);
      setNewKeyName('');
      setNewKeyDescription('');
      setShowCreateForm(false);
      await loadApiKeys();
    } catch (error) {
      console.error('Error creating API key:', error);
      toast.error('Failed to create API key');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setKeyToDelete({ id, name });
  };

  const handleDeleteConfirm = async () => {
    if (!keyToDelete) return;

    try {
      setIsDeleting(true);
      await companyApiKeysService.delete(keyToDelete.id);
      toast.success('API key deleted successfully');
      await loadApiKeys();
      setKeyToDelete(null);
    } catch (error) {
      console.error('Error deleting API key:', error);
      toast.error('Failed to delete API key');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setKeyToDelete(null);
  };

  const handleCopy = async (text: string, type: 'api' | 'secret') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedKey(type);
      toast.success(`${type === 'api' ? 'API Key' : 'Secret Key'} copied to clipboard`);
      setTimeout(() => setCopiedKey(null), 2000);
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const closeGeneratedKeyModal = () => {
    setGeneratedKey(null);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">API Keys</h2>
          <p className="text-sm text-gray-600 mt-1">
            Generate API keys to access the Careers Platform API programmatically
          </p>
        </div>
        {!showCreateForm && (
          <Button
            onClick={() => setShowCreateForm(true)}
            variant="secondary"
            leadingIcon={<PlusIcon className="w-5 h-5" />}
          >
            Generate New Key
          </Button>
        )}
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <Card className="mb-4 bg-blue-50 border-blue-200">
          <h3 className="text-lg font-medium mb-4">Generate New API Key</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name *
              </label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Production API Key"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={newKeyDescription}
                onChange={(e) => setNewKeyDescription(e.target.value)}
                placeholder="What will this key be used for?"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleCreate}
                disabled={isCreating}
                variant="primary"
              >
                {isCreating ? 'Generating...' : 'Generate Key'}
              </Button>
              <Button
                onClick={() => {
                  setShowCreateForm(false);
                  setNewKeyName('');
                  setNewKeyDescription('');
                }}
                variant="secondary"
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generated Key Modal */}
      {generatedKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card opaque className="max-w-2xl w-full mx-4">
            <div className="flex items-start gap-3 mb-4">
              <ExclamationTriangleIcon className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Save Your Secret Key</h3>
                <p className="text-sm text-gray-600 mt-1">
                  {generatedKey.warning}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  API Key (Public)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedKey.apiKey.apiKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy(generatedKey.apiKey.apiKey, 'api')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    {copiedKey === 'api' ? (
                      <CheckIcon className="w-5 h-5 text-green-600" />
                    ) : (
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Secret Key (Private - Save This Now!)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={generatedKey.secretKey}
                    readOnly
                    className="flex-1 px-3 py-2 border border-yellow-300 rounded-lg bg-white font-mono text-sm"
                  />
                  <button
                    onClick={() => handleCopy(generatedKey.secretKey, 'secret')}
                    className="px-3 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
                  >
                    {copiedKey === 'secret' ? (
                      <CheckIcon className="w-5 h-5" />
                    ) : (
                      <ClipboardDocumentIcon className="w-5 h-5" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-yellow-800 mt-2">
                  ⚠️ This secret key will never be shown again. Store it securely.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <Button onClick={closeGeneratedKeyModal} variant="primary">
                I've Saved the Secret Key
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* API Keys List */}
      {loading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : apiKeys.length === 0 ? (
        <Card className="text-center py-8">
          <p className="text-gray-500">No API keys yet. Generate one to get started.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {apiKeys.map((key) => (
            <Card key={key.id} className="hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h3 className="font-medium text-gray-900">{key.name}</h3>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        key.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {key.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  {key.description && (
                    <p className="text-sm text-gray-600 mt-1">{key.description}</p>
                  )}
                  <div className="flex items-center gap-4 mt-2">
                    <div className="flex items-center gap-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded font-mono">
                        {key.apiKey}
                      </code>
                      <button
                        onClick={() => handleCopy(key.apiKey, 'api')}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <ClipboardDocumentIcon className="w-4 h-4" />
                      </button>
                    </div>
                    <span className="text-xs text-gray-500">
                      Created {new Date(key.createdAt).toLocaleDateString()}
                    </span>
                    {key.lastUsedAt && (
                      <span className="text-xs text-gray-500">
                        Last used {new Date(key.lastUsedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteClick(key.id, key.name)}
                  className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete API key"
                >
                  <TrashIcon className="w-5 h-5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={keyToDelete !== null}
        title="Delete API Key"
        message={`Are you sure you want to delete the API key "${keyToDelete?.name}"? This action cannot be undone and will immediately revoke access for any applications using this key.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default CompanyApiKeysSection;
