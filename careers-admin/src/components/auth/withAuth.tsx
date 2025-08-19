import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { isAuthenticated } from '../../utils/api';

/**
 * Higher-order component (HOC) that adds authentication checking to any component
 * This ensures that the component will only render if the user is authenticated
 * 
 * @param WrappedComponent - The component to wrap with authentication
 * @returns A new component with authentication checks
 */
export const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>
): React.FC<P> => {
  const WithAuth: React.FC<P> = (props) => {
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
      // Check if user is authenticated
      if (!isAuthenticated()) {
        // Redirect to login if not authenticated
        navigate('/login', { state: { from: window.location.pathname } });
        return;
      }
      
      // User is authenticated, continue loading the component
      setLoading(false);
    }, [navigate]);

    if (loading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      );
    }

    // Render the wrapped component with all props
    return <WrappedComponent {...props} />;
  };

  // Set display name for debugging purposes
  const displayName = WrappedComponent.displayName || WrappedComponent.name || 'Component';
  WithAuth.displayName = `withAuth(${displayName})`;

  return WithAuth;
};

export default withAuth;
