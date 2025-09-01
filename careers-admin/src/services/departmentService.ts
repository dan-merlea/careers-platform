import { api } from '../utils/api';
import { UserRole } from './auth.service';

// Types
export interface Department {
  _id?: string;
  id?: string;
  title: string;
  parentDepartment?: string | null;
  subDepartments?: Department[]; // Used for hierarchical view
  approvalRole?: UserRole;
  jobRoles?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDepartmentDto {
  title: string;
  parentDepartment?: string | null;
  approvalRole?: UserRole;
  jobRoles?: string[];
}

export interface UpdateDepartmentDto {
  title?: string;
  parentDepartment?: string | null;
  approvalRole?: UserRole;
  jobRoles?: string[];
}

// API endpoints
const DEPARTMENT_API = '/company/departments';

// Service methods
export const departmentService = {
  /**
   * Get job roles for a specific department
   */
  getJobRoles: (departmentId: string) => {
    return api.get<string[]>(`${DEPARTMENT_API}/${departmentId}/job-roles`);
  },
  /**
   * Get all departments
   */
  getAll: () => {
    return api.get<Department[]>(DEPARTMENT_API);
  },

  /**
   * Get a single department by ID
   */
  getById: (id: string) => {
    return api.get<Department>(`${DEPARTMENT_API}/${id}`);
  },

  /**
   * Create a new department
   */
  create: (data: CreateDepartmentDto) => {
    return api.post<Department>(DEPARTMENT_API, data);
  },

  /**
   * Update an existing department
   */
  update: (id: string, data: UpdateDepartmentDto) => {
    return api.patch<Department>(`${DEPARTMENT_API}/${id}`, data);
  },

  /**
   * Delete a department
   */
  delete: (id: string) => {
    return api.delete<{success: boolean; message: string}>(`${DEPARTMENT_API}/${id}`);
  },

  /**
   * Get the full department hierarchy
   * Returns top-level departments with their sub-departments nested
   */
  getHierarchy: () => {
    return api.get<Department[]>(`${DEPARTMENT_API}/hierarchy`);
  },
};
