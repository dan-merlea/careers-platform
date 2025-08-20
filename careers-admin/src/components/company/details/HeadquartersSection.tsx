import React from 'react';
import { Headquarters, CreateHeadquartersDto, UpdateHeadquartersDto } from '../../../services/headquartersService';
import HeadquartersList from '../HeadquartersList';
import HeadquartersForm from '../HeadquartersForm';

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
  handleHQFormSubmit: (data: CreateHeadquartersDto | UpdateHeadquartersDto) => Promise<void>;
  handleHQFormCancel: () => void;
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
  handleHQFormSubmit,
  handleHQFormCancel,
  handleDeleteHeadquarters
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showHQForm ? (
        <HeadquartersForm
          headquarters={selectedHQ}
          onSubmit={handleHQFormSubmit}
          onCancel={handleHQFormCancel}
          isSubmitting={savingHQ}
        />
      ) : (
        <>
          {hqSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{hqSuccess}</p>
            </div>
          )}
          
          {hqError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{hqError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Headquarters</h2>
            <button
              onClick={handleAddHeadquarters}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Add Headquarters
            </button>
          </div>
          
          {loadingHQ ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading headquarters...</p>
            </div>
          ) : (
            <HeadquartersList
              headquarters={headquarters}
              onEdit={handleEditHeadquarters}
              onDelete={handleDeleteHeadquarters}
              onAddNew={handleAddHeadquarters}
            />
          )}
        </>
      )}
    </div>
  );
};

export default HeadquartersSection;
