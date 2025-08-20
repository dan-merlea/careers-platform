import React from 'react';
import { Headquarters } from '../../services/headquartersService';
import HeadquartersList from './HeadquartersList';
import HeadquartersForm from './HeadquartersForm';

interface HeadquartersSectionProps {
  headquarters: Headquarters[];
  loadingHQ: boolean;
  selectedHQ: Headquarters | undefined;
  showHQForm: boolean;
  savingHQ: boolean;
  hqError: string | null;
  hqSuccess: string | null;
  handleEditHeadquarters: (hq: Headquarters) => void;
  handleAddHeadquarters: () => void;
  handleCancelHQForm: () => void;
  handleSaveHeadquarters: (data: any) => Promise<void>;
  handleDeleteHeadquarters: (id: string) => void;
}

const HeadquartersSection: React.FC<HeadquartersSectionProps> = ({
  headquarters,
  loadingHQ,
  selectedHQ,
  showHQForm,
  savingHQ,
  hqError,
  hqSuccess,
  handleEditHeadquarters,
  handleAddHeadquarters,
  handleCancelHQForm,
  handleSaveHeadquarters,
  handleDeleteHeadquarters,
}) => {
  if (loadingHQ) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {hqError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {hqError}
        </div>
      )}
      
      {hqSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {hqSuccess}
        </div>
      )}
      
      {showHQForm ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedHQ ? 'Edit Headquarters' : 'Add New Headquarters'}
            </h3>
          </div>
          <div className="p-6">
            <HeadquartersForm
              headquarters={selectedHQ}
              onSubmit={handleSaveHeadquarters}
              onCancel={handleCancelHQForm}
              isSubmitting={savingHQ}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Company Headquarters</h3>
            <button
              onClick={handleAddHeadquarters}
              className="bg-blue-600 text-white py-1 px-3 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Add Headquarters
            </button>
          </div>
          <div className="p-6">
            <HeadquartersList
              headquarters={headquarters}
              onEdit={handleEditHeadquarters}
              onDelete={handleDeleteHeadquarters}
              onAddNew={handleAddHeadquarters}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default HeadquartersSection;
