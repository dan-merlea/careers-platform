import React, { useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../utils/api';

const Auth0CallbackPage: React.FC = () => {
  const { isAuthenticated, isLoading, user, getIdTokenClaims } = useAuth0();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuth0Callback = async () => {
      if (isLoading) {
        return;
      }

      if (isAuthenticated && user) {
        try {
          // Get the Auth0 ID token
          const idTokenClaims = await getIdTokenClaims();
          const idToken = idTokenClaims?.__raw;
          
          if (!idToken) {
            throw new Error('No ID token available');
          }
          
          // Exchange Auth0 token for your backend token
          const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://localhost:3001'}/auth/auth0/exchange`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              idToken,
              email: user.email,
              name: user.name,
              sub: user.sub,
            }),
          });

          if (!response.ok) {
            throw new Error('Failed to exchange Auth0 token');
          }

          const data = await response.json();
          
          // Store the backend token
          localStorage.setItem('token', data.token);
          
          // Fetch user profile
          const profileData = await api.get<{ 
            user: { 
              id: string; 
              email: string; 
              role: string; 
              name?: string; 
              departmentId?: string; 
              companyId?: string 
            }; 
            company?: { id: string; name: string } | null 
          }>('/users/me');

          const { user: meUser, company: meCompany } = profileData || ({} as any);
          
          if (meUser) {
            localStorage.setItem('userId', meUser.id);
            localStorage.setItem('userEmail', meUser.email);
            localStorage.setItem('isAdmin', meUser.role === 'admin' ? 'true' : 'false');
            localStorage.setItem('userRole', meUser.role || '');
            localStorage.setItem('userDepartment', meUser.departmentId || '');
            localStorage.setItem('name', meUser.name || '');
            if (meUser.companyId) localStorage.setItem('companyId', meUser.companyId);
          }
          
          if (meCompany) {
            localStorage.setItem('companyName', meCompany.name || '');
          }

          // Redirect to dashboard
          window.location.href = '/';
        } catch (error) {
          console.error('Error during Auth0 callback:', error);
          navigate('/login?error=auth0_callback_failed');
        }
      } else if (!isLoading) {
        // Not authenticated, redirect to login
        navigate('/login');
      }
    };

    handleAuth0Callback();
  }, [isAuthenticated, isLoading, user, getIdTokenClaims, navigate]);

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center items-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-white mb-2">Completing sign in...</h2>
        <p className="text-gray-400">Please wait while we authenticate you with Okta.</p>
      </div>
    </div>
  );
};

export default Auth0CallbackPage;
