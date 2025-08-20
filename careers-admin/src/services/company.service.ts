import { api } from '../utils/api';

export interface SocialLinks {
  linkedin: string;
  twitter: string;
  facebook: string;
  instagram: string;
}

export interface CompanyValue {
  text: string;
  icon?: string;
}

export interface CompanyDetails {
  name: string;
  logo: string;
  website: string;
  description: string;
  industry: string;
  foundedYear: string;
  size: string;
  headquarters: string;
  socialLinks: SocialLinks;
  mission: string;
  vision: string;
  values: CompanyValue[];
}

export const companyService = {
  /**
   * Get company details
   */
  async getCompanyDetails(): Promise<CompanyDetails> {
    try {
      const response = await api.get<CompanyDetails>('/company');
      return response;
    } catch (error) {
      // If no company details exist yet, return empty object
      if ((error as any)?.message?.includes('404')) {
        return {
          name: '',
          logo: '',
          website: '',
          description: '',
          industry: '',
          foundedYear: '',
          size: '',
          headquarters: '',
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
          },
          mission: '',
          vision: '',
          values: []
        };
      }
      throw error;
    }
  },

  /**
   * Save company details
   */
  async saveCompanyDetails(data: CompanyDetails): Promise<CompanyDetails> {
    const response = await api.post<CompanyDetails>('/company', data);
    return response;
  },
};
