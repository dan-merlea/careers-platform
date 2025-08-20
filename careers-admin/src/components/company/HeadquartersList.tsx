import React, { useState, useEffect } from 'react';
import { headquartersService, Headquarters } from '../../services/headquartersService';

interface HeadquartersListProps {
  headquarters?: Headquarters[];
  onEdit: (headquarters: Headquarters) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const HeadquartersList: React.FC<HeadquartersListProps> = ({ headquarters: hqProp, onEdit, onDelete, onAddNew }) => {
  const [localHeadquarters, setLocalHeadquarters] = useState<Headquarters[]>([]);
  const [loading, setLoading] = useState<boolean>(hqProp ? false : true);
  const [error, setError] = useState<string | null>(null);
  
  // Use the prop value if provided
  const headquarters = hqProp || localHeadquarters;

  useEffect(() => {
    loadHeadquarters();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadHeadquarters = async () => {
    // Skip loading if headquarters are provided via props
    if (hqProp) {
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      const data = await headquartersService.getAll();
      setLocalHeadquarters(data);
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
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      {/* Button removed - now in parent component */}
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
          {headquarters.map((hq) => (
            <tr key={hq._id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">{hq.name}</div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-500">{hq.address}</div>
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
