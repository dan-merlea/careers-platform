import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, clearAuth, getAuthToken, SESSION_EXPIRED_EVENT } from '../utils/api';

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  userEmail: string | null;
  isAdmin: boolean;
  userRole: string | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  hasPermission: (requiredRoles: string[]) => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userEmail: null,
  isAdmin: false,
  userRole: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  loading: true,
  hasPermission: () => false,
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

// Define the response type for login and signup
interface AuthResponse {
  token: string;
  user: {
    id: string;
    email: string;
    isAdmin: boolean;
    role: string;
    name?: string;
  };
}

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  // We can't use useNavigate directly in the provider because it's not inside a Router
  // Instead, we'll handle navigation in a separate effect

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAuthToken();
      const storedEmail = localStorage.getItem('userEmail');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      const storedRole = localStorage.getItem('userRole');

      if (storedToken) {
        // Validate token with the backend
        try {
          // Optional: Make a request to validate the token
          // await api.get('/users/validate-token');
          
          // If no error, token is valid
          setIsAuthenticated(true);
          setToken(storedToken);
          setUserEmail(storedEmail);
          setIsAdmin(storedIsAdmin);
          setUserRole(storedRole);
        } catch {
          // Token is invalid, clear auth data
          clearAuth();
          setIsAuthenticated(false);
          setToken(null);
          setUserEmail(null);
          setIsAdmin(false);
          setUserRole(null);
        }
      } else {
        setIsAuthenticated(false);
        setToken(null);
        setUserEmail(null);
        setIsAdmin(false);
        setUserRole(null);
      }

      setLoading(false);
    };

    checkAuth();
    
    // Listen for session expiration events
    const handleSessionExpired = () => {
      // Clear auth state
      clearAuth();
      setIsAuthenticated(false);
      setToken(null);
      setUserEmail(null);
      setIsAdmin(false);
      setUserRole(null);
      
      // We can't use navigate here, so we'll redirect manually
      window.location.href = '/login';
    };
    
    // Add event listener
    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    
    // Clean up
    return () => {
      window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    };
  }, []);

  // Permission check function
  const hasPermission = (requiredRoles: string[]): boolean => {
    if (!isAuthenticated || !userRole) return false;
    
    // Admin has access to everything
    if (userRole === 'admin') return true;
    
    // Check if user's role is in the required roles list
    return requiredRoles.includes(userRole);
  };

  // Login function
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const data = await api.post<AuthResponse>('/users/login', { email, password });
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false');
      localStorage.setItem('userRole', data.user.role);
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserEmail(email);
      setIsAdmin(data.user.isAdmin);
      setUserRole(data.user.role);
    } finally {
      setLoading(false);
    }
  };
  
  // Signup function
  const signup = async (email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const data = await api.post<AuthResponse>('/users/signup', { email, password, name });
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false');
      localStorage.setItem('userRole', data.user.role);
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserEmail(email);
      setIsAdmin(data.user.isAdmin);
      setUserRole(data.user.role);
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    setLoading(true);
    
    try {
      // Call logout endpoint if it exists
      try {
        await api.post('/users/logout');
      } catch {
        // Ignore errors from logout endpoint
      }
      
      // Clear auth data
      clearAuth();
      localStorage.removeItem('userRole');
      
      // Update state
      setIsAuthenticated(false);
      setToken(null);
      setUserEmail(null);
      setIsAdmin(false);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Create the auth value object
  const value = {
    isAuthenticated,
    userEmail,
    isAdmin,
    userRole,
    token,
    login,
    signup,
    logout,
    loading,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
