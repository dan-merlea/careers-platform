import React, { useState } from 'react';
import { useCompany } from '../../context/CompanyContext';

/**
 * Test component to verify CompanyContext updates
 * This component displays current company data and provides a button to test updates
 */
const CompanyContextTest: React.FC = () => {
  const { company, loading, updateCompany, refreshCompany } = useCompany();
  const [testStatus, setTestStatus] = useState<string | null>(null);

  const handleTestUpdate = async () => {
    if (!company) return;
    
    try {
      setTestStatus('Updating company name...');
      
      // Create a modified copy of the company with a timestamp in the name
      const updatedCompany = {
        ...company,
        name: `${company.name.split(' - ')[0]} - ${new Date().toLocaleTimeString()}`
      };
      
      // Update the company using the context
      await updateCompany(updatedCompany);
      setTestStatus('Company name updated successfully!');
    } catch (error) {
      console.error('Error updating company:', error);
      setTestStatus('Error updating company');
    }
  };

  const handleRefresh = async () => {
    try {
      setTestStatus('Refreshing company data...');
      await refreshCompany();
      setTestStatus('Company data refreshed successfully!');
    } catch (error) {
      console.error('Error refreshing company:', error);
      setTestStatus('Error refreshing company');
    }
  };

  if (loading) {
    return <div className="alert alert-info">Loading company data...</div>;
  }

  if (!company) {
    return <div className="alert alert-warning">No company data available</div>;
  }

  return (
    <div className="card">
      <div className="card-header">
        <h5>Company Context Test</h5>
      </div>
      <div className="card-body">
        <h6>Current Company Data:</h6>
        <pre className="bg-light p-3 rounded">
          {JSON.stringify({
            name: company.name,
            website: company.website,
            industry: company.industry,
            size: company.size,
            lastUpdated: new Date().toLocaleTimeString()
          }, null, 2)}
        </pre>
        
        <div className="d-flex gap-2 mt-3">
          <button 
            className="btn btn-primary" 
            onClick={handleTestUpdate}
            disabled={loading}
          >
            Test Update Company
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={handleRefresh}
            disabled={loading}
          >
            Refresh Company Data
          </button>
        </div>
        
        {testStatus && (
          <div className="alert alert-info mt-3">
            {testStatus}
          </div>
        )}
      </div>
    </div>
  );
};

export default CompanyContextTest;
