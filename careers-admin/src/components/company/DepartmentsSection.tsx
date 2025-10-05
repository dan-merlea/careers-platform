import React from 'react';
import { Department, CreateDepartmentDto, UpdateDepartmentDto } from '../../services/departmentService';
import DepartmentTree from './DepartmentTree';
import DepartmentForm from './DepartmentForm';
import Button from '../common/Button';

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
  handleCancelDeptForm: () => void;
  handleSaveDepartment: (data: CreateDepartmentDto | UpdateDepartmentDto) => Promise<void>;
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
  handleCancelDeptForm,
  handleSaveDepartment,
  handleDeleteDepartment,
}) => {
  if (loadingDept) {
    return (
      <div className="flex justify-center items-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {deptError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
          {deptError}
        </div>
      )}
      
      {deptSuccess && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {deptSuccess}
        </div>
      )}
      
      {showDeptForm ? (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-lg font-medium text-gray-900">
              {selectedDept ? 'Edit Department' : 'Add New Department'}
            </h3>
          </div>
          <div className="py-3">
            <DepartmentForm
              department={selectedDept}
              departments={departments}
              onSubmit={handleSaveDepartment}
              onCancel={handleCancelDeptForm}
              isSubmitting={savingDept}
            />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">Company Departments</h3>
            <Button onClick={handleAddDepartment} variant="primary">
              Add Department
            </Button>
          </div>
          <div className="py-3">
            <DepartmentTree
              departments={departments}
              onEdit={handleEditDepartment}
              onDelete={handleDeleteDepartment}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentsSection;
