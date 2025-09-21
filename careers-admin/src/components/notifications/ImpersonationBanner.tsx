import React from 'react';
import { useAuth } from '../../context/AuthContext';

const ImpersonationBanner: React.FC = () => {
  const { isImpersonating, impersonatedBy, name, userRole, returnToAdmin } = useAuth();

  if (!isImpersonating || !impersonatedBy) {
    return null;
  }

  return (
    <div className="bg-purple-600 text-white px-4 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
        <span>
          <strong>Impersonation Mode:</strong> You ({impersonatedBy.name}) are currently signed in as {name} ({userRole})
        </span>
      </div>
      <button
        onClick={returnToAdmin}
        className="bg-white text-purple-600 px-3 py-1 rounded-md text-sm font-medium hover:bg-purple-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
      >
        Return to Admin
      </button>
    </div>
  );
};

export default ImpersonationBanner;
