import React, { useState, useEffect } from 'react';
import { headquartersService, Headquarters } from '../../services/headquartersService';

interface HeadquartersListProps {
  onEdit: (headquarters: Headquarters) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const HeadquartersList: React.FC<HeadquartersListProps> = ({ onEdit, onDelete, onAddNew }) => {
  const [headquarters, setHeadquarters] = useState<Headquarters[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHeadquarters();
  }, []);

  const loadHeadquarters = async () => {
    try {
      setLoading(true);
      const data = await headquartersService.getAll();
      setHeadquarters(data);
      setError(null);
    } catch (err) {
      console.error('Error loading headquarters:', err);
      setError('Failed to load headquarters. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-2 text-gray-600">Loading headquarters...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
        {error}
        <button 
          onClick={loadHeadquarters}
          className="ml-2 underline text-red-700 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (headquarters.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">No headquarters found.</p>
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Headquarters
        </button>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-end mb-4">
        <button
          onClick={onAddNew}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Headquarters
        </button>
      </div>
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Name
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Location
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {headquarters.map((hq) => (
            <tr key={hq._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{hq.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900">
                  {hq.city}, {hq.state ? `${hq.state}, ` : ''}{hq.country}
                </div>
                <div className="text-sm text-gray-500">{hq.address}</div>
                <div className="text-sm text-gray-500">{hq.postalCode}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {hq.isMainHeadquarters ? (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    Main HQ
                  </span>
                ) : (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                    Branch
                  </span>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => onEdit(hq)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(hq._id!)}
                  className="text-red-600 hover:text-red-900"
                  disabled={hq.isMainHeadquarters}
                  title={hq.isMainHeadquarters ? "Cannot delete main headquarters" : ""}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HeadquartersList;
