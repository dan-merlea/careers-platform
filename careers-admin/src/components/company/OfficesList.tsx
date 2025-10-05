import React from 'react';
import { Office } from '../../services/officesService';
import Button from '../common/Button';
import ScrollableTable from '../common/ScrollableTable';
import ActionsMenu from '../common/ActionsMenu';

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
    <ScrollableTable>
      <>
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Address
            </th>
            <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-16">
              
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
              <td className="px-6 py-4 whitespace-nowrap text-center">
                <ActionsMenu
                  items={[
                    {
                      label: 'Edit',
                      onClick: () => onEdit(office),
                      icon: <i className="bi bi-pencil-square"></i>,
                    },
                    {
                      label: 'Delete',
                      onClick: () => onDelete(office.id),
                      variant: 'danger',
                      icon: <i className="bi bi-trash"></i>,
                    },
                  ]}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </>
    </ScrollableTable>
  );
};

export default OfficesList;
