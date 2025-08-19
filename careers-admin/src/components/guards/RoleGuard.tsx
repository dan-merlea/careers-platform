import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import UnauthorizedPage from '../../pages/UnauthorizedPage';

interface RoleGuardProps {
  children: React.ReactNode;
  requiredRoles: string[];
  // redirectTo is now optional and only used for authentication redirects
  redirectTo?: string;
  // If true, show unauthorized page instead of redirecting when lacking permissions
  showUnauthorized?: boolean;
}

/**
 * A component that restricts access based on user roles
 * Only users with the required roles can access the protected content
 */
const RoleGuard: React.FC<RoleGuardProps> = ({ 
  children, 
  requiredRoles, 
  redirectTo = '/dashboard',
  showUnauthorized = true
}) => {
  const { isAuthenticated, hasPermission, loading } = useAuth();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check if user has required role
  if (!hasPermission(requiredRoles)) {
    // Either show unauthorized page or redirect based on prop
    return showUnauthorized ? <UnauthorizedPage /> : <Navigate to={redirectTo} replace />;
  }

  // User has permission, render the protected content
  return <>{children}</>;
};

export default RoleGuard;
