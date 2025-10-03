import React from 'react';
import { Office } from '../../services/officesService';
import Button from '../common/Button';

interface OfficesListProps {
  offices: Office[];
  onEdit: (office: Office) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const OfficesList: React.FC<OfficesListProps> = ({ offices, onEdit, onDelete, onAddNew }) => {
  if (offices.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No offices have been added yet.</p>
        <Button onClick={onAddNew} variant="secondary">
          Add First Office
        </Button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {offices.map((office) => (
            <tr key={office.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{office.name}</div>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm text-gray-500">{office.address}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(office)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  <i className="bi bi-pencil-square me-1"></i> Edit
                </button>
                <button
                  onClick={() => onDelete(office.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <i className="bi bi-trash me-1"></i> Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OfficesList;
