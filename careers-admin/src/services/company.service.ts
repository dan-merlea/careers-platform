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

export interface CompanySettings {
  approvalType: 'headcount' | 'job-opening';
  emailCalendarProvider?: 'google' | 'microsoft' | 'other';
  allowedDomains?: string[];
}

export interface CompanyDetails {
  _id?: string;
  id?: string;
  name: string;
  logo: string;
  website: string;
  description: string;
  industry: string;
  foundedYear: string;
  size: string;
  primaryColor: string;
  secondaryColor: string;
  socialLinks: SocialLinks;
  slogan: string;
  mission: string;
  vision: string;
  values: CompanyValue[];
  settings?: CompanySettings;
  allowedDomains?: string[];
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
          primaryColor: '',
          secondaryColor: '',
          socialLinks: {
            linkedin: '',
            twitter: '',
            facebook: '',
            instagram: ''
          },
          slogan: '',
          mission: '',
          vision: '',
          values: [],
          allowedDomains: [],
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

  /**
   * Get company (alias for getCompanyDetails for consistency with backend naming)
   */
  async getCompany(): Promise<CompanyDetails> {
    return this.getCompanyDetails();
  },

  /**
   * Save company settings
   */
  async saveCompanySettings(settings: CompanySettings): Promise<CompanyDetails> {
    // Use the dedicated settings endpoint
    return api.put<CompanyDetails>('/company/settings', settings);
  },
};
