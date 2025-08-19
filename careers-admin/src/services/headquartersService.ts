import { api } from '../utils/api';

// Types
export interface Headquarters {
  _id?: string;
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isMainHeadquarters: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CreateHeadquartersDto {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  postalCode: string;
  isMainHeadquarters: boolean;
}

export interface UpdateHeadquartersDto {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  isMainHeadquarters?: boolean;
}

// API endpoints
const HEADQUARTERS_API = '/company/headquarters';

// Service methods
export const headquartersService = {
  /**
   * Get all headquarters
   */
  getAll: () => {
    return api.get<Headquarters[]>(HEADQUARTERS_API);
  },

  /**
   * Get a single headquarters by ID
   */
  getById: (id: string) => {
    return api.get<Headquarters>(`${HEADQUARTERS_API}/${id}`);
  },

  /**
   * Create a new headquarters
   */
  create: (data: CreateHeadquartersDto) => {
    return api.post<Headquarters>(HEADQUARTERS_API, data);
  },

  /**
   * Update an existing headquarters
   */
  update: (id: string, data: UpdateHeadquartersDto) => {
    return api.patch<Headquarters>(`${HEADQUARTERS_API}/${id}`, data);
  },

  /**
   * Delete a headquarters
   */
  delete: (id: string) => {
    return api.delete(`${HEADQUARTERS_API}/${id}`);
  },

  /**
   * Get the main headquarters
   */
  getMainHeadquarters: () => {
    return api.get<Headquarters>(`${HEADQUARTERS_API}/main`);
  },
};
