export interface Company {
  id: string;
  name: string;
  description?: string;
  website?: string;
  logo_url?: string;
  founded_year?: number;
  size?: string;
  industry?: string;
  social_media?: {
    linkedin?: string;
    twitter?: string;
    facebook?: string;
    instagram?: string;
  };
  created_at: Date;
  updated_at: Date;
}
