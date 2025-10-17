import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SESSION_EXPIRED_EVENT } from '../../utils/api';

const SessionExpiredNotification: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleSessionExpired = () => {
      setVisible(true);
      
      // Automatically redirect after 3 seconds
      setTimeout(() => {
        navigate('/login', { replace: true });
      }, 3000);
    };
    
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, [navigate]);
  
  const handleLoginClick = () => {
    setVisible(false);
    navigate('/login', { replace: true });
  };
  
  if (!visible) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Session Expired</h3>
          <p className="mt-2 text-sm text-gray-500">
            Your session has expired. You will be redirected to the login page in a few seconds.
          </p>
          <div className="mt-4">
            <button
              type="button"
              className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:text-sm"
              onClick={handleLoginClick}
            >
              Login Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionExpiredNotification;
