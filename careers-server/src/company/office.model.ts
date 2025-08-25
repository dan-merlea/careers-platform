export interface Office {
  id: string;
  name: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}
