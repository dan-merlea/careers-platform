import React, { useState } from 'react';
import { Department } from '../../services/departmentService';
import ActionsMenu from '../common/ActionsMenu';
import { PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

interface DepartmentTreeProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}

const DepartmentNode: React.FC<{
  department: Department;
  level: number;
  onEdit: (department: Department) => void;
  onDelete: (id: string) => void;
}> = ({ department, level, onEdit, onDelete }) => {
  const [expanded, setExpanded] = useState(true);
  const hasChildren = department.subDepartments && department.subDepartments.length > 0;
  
  return (
    <div className="department-node" style={{ marginLeft: `${level * 20}px` }}>
      <div className="flex items-center py-2">
        {hasChildren && (
          <button 
            onClick={() => setExpanded(!expanded)}
            className="mr-2 w-5 h-5 flex items-center justify-center text-gray-500 hover:text-gray-700"
          >
            {expanded ? '−' : '+'}
          </button>
        )}
        {!hasChildren && <div className="w-5 mr-2"></div>}
        
        <div className="flex-grow font-medium">{department.title}</div>
        
        <ActionsMenu
          buttonAriaLabel="Department actions"
          align="right"
          menuWidthPx={160}
          items={[
            {
              label: 'Edit',
              onClick: () => onEdit(department),
              icon: <PencilIcon className="w-4 h-4" />
            },
            {
              label: hasChildren ? 'Delete (has sub-departments)' : 'Delete',
              onClick: () => onDelete(department.id!),
              icon: <TrashIcon className="w-4 h-4" />,
              variant: 'danger',
              disabled: hasChildren
            }
          ]}
        />
      </div>
      
      {expanded && hasChildren && (
        <div className="department-children border-l border-gray-200 ml-2 pl-2">
          {department.subDepartments!.map((child) => (
            <DepartmentNode
              key={child.id}
              department={child}
              level={level + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const DepartmentTree: React.FC<DepartmentTreeProps> = ({ departments, onEdit, onDelete }) => {
  if (!departments || departments.length === 0) {
    return <div className="text-gray-500 py-4">No departments found.</div>;
  }

  return (
    <div className="department-tree bg-white rounded-md border border-gray-200 p-4">
      {departments.map((dept) => (
        <DepartmentNode
          key={dept.id}
          department={dept}
          level={0}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default DepartmentTree;
