import { api } from '../utils/api';

// Types
export interface Department {
  _id?: string;
  name: string;
  description?: string;
  parentDepartment?: string | null;
  subDepartments?: Department[]; // Used for hierarchical view
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  parentDepartment?: string | null;
}

export interface UpdateDepartmentDto {
  name?: string;
  description?: string;
  parentDepartment?: string | null;
}

// API endpoints
const DEPARTMENT_API = '/company/departments';

// Service methods
export const departmentService = {
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
    return api.delete(`${DEPARTMENT_API}/${id}`);
  },

  /**
   * Get the full department hierarchy
   * Returns top-level departments with their sub-departments nested
   */
  getHierarchy: () => {
    return api.get<Department[]>(`${DEPARTMENT_API}/hierarchy`);
  },
};
