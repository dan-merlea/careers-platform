import React from 'react';
import { Office, CreateOfficeDto, UpdateOfficeDto } from '../../../services/officesService';
import OfficesList from '../OfficesList';
import OfficesForm from '../OfficesForm';

interface OfficesSectionProps {
  offices: Office[];
  loadingOffice: boolean;
  selectedOffice: Office | undefined;
  showOfficeForm: boolean;
  savingOffice: boolean;
  officeError: string | null;
  officeSuccess: string | null;
  handleEditOffice: (office: Office) => void;
  handleAddOffice: () => void;
  handleOfficeFormSubmit: (data: CreateOfficeDto | UpdateOfficeDto) => Promise<void>;
  handleOfficeFormCancel: () => void;
  handleDeleteOffice: (id: string) => void;
}

const OfficesSection: React.FC<OfficesSectionProps> = ({
  offices,
  loadingOffice,
  selectedOffice,
  showOfficeForm,
  savingOffice,
  officeError,
  officeSuccess,
  handleEditOffice,
  handleAddOffice,
  handleOfficeFormSubmit,
  handleOfficeFormCancel,
  handleDeleteOffice
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showOfficeForm ? (
        <OfficesForm
          office={selectedOffice}
          onSubmit={handleOfficeFormSubmit}
          onCancel={handleOfficeFormCancel}
          isSubmitting={savingOffice}
        />
      ) : (
        <>
          {officeSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{officeSuccess}</p>
            </div>
          )}
          
          {officeError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{officeError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Offices</h2>
            <button
              onClick={handleAddOffice}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Add Office
            </button>
          </div>
          
          {loadingOffice ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading offices...</p>
            </div>
          ) : (
            <OfficesList
              offices={offices}
              onEdit={handleEditOffice}
              onDelete={handleDeleteOffice}
              onAddNew={handleAddOffice}
            />
          )}
        </>
      )}
    </div>
  );
};

export default OfficesSection;
