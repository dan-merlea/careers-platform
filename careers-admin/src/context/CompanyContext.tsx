import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CompanyDetails, companyService } from '../services/company.service';

interface CompanyContextType {
  company: CompanyDetails | null;
  loading: boolean;
  error: string | null;
  refreshCompany: () => Promise<void>;
  updateCompany: (updatedCompany: CompanyDetails) => Promise<void>;
}

const defaultCompanyContext: CompanyContextType = {
  company: null,
  loading: true,
  error: null,
  refreshCompany: async () => {},
  updateCompany: async () => {},
};

export const CompanyContext = createContext<CompanyContextType>(defaultCompanyContext);

export const useCompany = () => useContext(CompanyContext);

interface CompanyProviderProps {
  children: ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [company, setCompany] = useState<CompanyDetails | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  const fetchCompanyDetails = useCallback(async () => {
    // Don't set loading to true if this is the initial load
    if (isInitialized) {
      setLoading(true);
    }
    
    try {
      setError(null);
      const companyData = await companyService.getCompanyDetails();
      setCompany(companyData);
      if (!isInitialized) {
        setIsInitialized(true);
      }
    } catch (err) {
      setError('Failed to load company details');
      console.error('Error fetching company details:', err);
    } finally {
      setLoading(false);
    }
  }, [isInitialized]);

  const updateCompany = async (updatedCompany: CompanyDetails) => {
    try {
      setLoading(true);
      setError(null);
      const savedCompany = await companyService.saveCompanyDetails(updatedCompany);
      setCompany(savedCompany);
    } catch (err) {
      setError('Failed to update company details');
      console.error('Error updating company details:', err);
      throw err; // Re-throw to allow components to handle the error
    } finally {
      setLoading(false);
    }
  };

  // Load company details on initial mount
  useEffect(() => {
    // Only fetch on initial mount
    if (!isInitialized) {
      fetchCompanyDetails();
    }
  }, [isInitialized, fetchCompanyDetails]);

  const value = {
    company,
    loading,
    error,
    refreshCompany: fetchCompanyDetails,
    updateCompany,
  };

  return <CompanyContext.Provider value={value}>{children}</CompanyContext.Provider>;
};
