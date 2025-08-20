import React from 'react';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../../../services/departmentService';
import DepartmentTree from '../DepartmentTree';
import DepartmentForm from '../DepartmentForm';

interface DepartmentsSectionProps {
  departments: Department[];
  loadingDept: boolean;
  selectedDept: Department | undefined;
  showDeptForm: boolean;
  savingDept: boolean;
  deptError: string | null;
  deptSuccess: string | null;
  handleEditDepartment: (dept: Department) => void;
  handleAddDepartment: () => void;
  handleDeptFormSubmit: (data: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
  handleDeptFormCancel: () => void;
  handleDeleteDepartment: (id: string) => void;
}

const DepartmentsSection: React.FC<DepartmentsSectionProps> = ({
  departments,
  loadingDept,
  selectedDept,
  showDeptForm,
  savingDept,
  deptError,
  deptSuccess,
  handleEditDepartment,
  handleAddDepartment,
  handleDeptFormSubmit,
  handleDeptFormCancel,
  handleDeleteDepartment
}) => {
  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      {showDeptForm ? (
        <DepartmentForm
          department={selectedDept}
          departments={departments}
          onSubmit={handleDeptFormSubmit}
          onCancel={handleDeptFormCancel}
          isSubmitting={savingDept}
        />
      ) : (
        <>
          {deptSuccess && (
            <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-4">
              <p>{deptSuccess}</p>
            </div>
          )}
          
          {deptError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
              <p>{deptError}</p>
            </div>
          )}
          
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Departments</h2>
            <button
              onClick={handleAddDepartment}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md"
            >
              Add Department
            </button>
          </div>
          
          {loadingDept ? (
            <div className="flex justify-center items-center h-32">
              <p className="text-gray-500">Loading departments...</p>
            </div>
          ) : (
            <DepartmentTree
              departments={departments}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
            />
          )}
        </>
      )}
    </div>
  );
};

export default DepartmentsSection;
