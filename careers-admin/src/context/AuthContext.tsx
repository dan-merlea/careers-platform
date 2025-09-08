import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, clearAuth, getAuthToken, SESSION_EXPIRED_EVENT } from '../utils/api';

// Define company type
interface Company {
  id: string;
  name: string;
}

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  name: string | null;
  userEmail: string | null;
  isAdmin: boolean;
  userRole: string | null;
  userDepartment: string | null;
  companyId: string | null;
  company: Company | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  companySignup: (companyName: string, email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
  hasPermission: (requiredRoles: string[]) => boolean;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  name: null,
  userEmail: null,
  isAdmin: false,
  userRole: null,
  userDepartment: null,
  companyId: null,
  company: null,
  token: null,
  login: async () => {},
  signup: async () => {},
  companySignup: async () => {},
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
    departmentId?: string;
    companyId?: string;
  };
  company?: {
    id: string;
    name: string;
  } | null;
}

// Provider component that wraps the app and makes auth object available
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string | null>(null);
  
  // We can't use useNavigate directly in the provider because it's not inside a Router
  // Instead, we'll handle navigation in a separate effect

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAuthToken();
      const storedEmail = localStorage.getItem('userEmail');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      const storedRole = localStorage.getItem('userRole');
      const storedDepartment = localStorage.getItem('userDepartment');
      const storedCompanyId = localStorage.getItem('companyId');
      const storedCompanyName = localStorage.getItem('companyName');
      const storedName = localStorage.getItem('name');

      if (storedToken) {
        // Validate token with the backend
        try {
          // Optional: Make a request to validate the token
          // await api.get('/users/validate-token');
          
          // If no error, token is valid
          setIsAuthenticated(true);
          setToken(storedToken);
          setUserEmail(storedEmail);
          setName(storedName);
          setIsAdmin(storedIsAdmin);
          setUserRole(storedRole);
          setUserDepartment(storedDepartment);
          setCompanyId(storedCompanyId);
          
          // Set company if we have both id and name
          if (storedCompanyId && storedCompanyName) {
            setCompany({
              id: storedCompanyId,
              name: storedCompanyName
            });
          }
        } catch {
          // Token is invalid, clear auth data
          clearAuth();
          setIsAuthenticated(false);
          setToken(null);
          setUserEmail(null);
          setIsAdmin(false);
          setUserRole(null);
          setUserDepartment(null);
          setCompanyId(null);
          setCompany(null);
          setName(null);
        }
      } else {
        setIsAuthenticated(false);
        setToken(null);
        setUserEmail(null);
        setIsAdmin(false);
        setUserRole(null);
        setUserDepartment(null);
        setCompanyId(null);
        setCompany(null);
        setName(null);
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
      setUserDepartment(null);
      setCompanyId(null);
      setCompany(null);
      setName(null);
      
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
      localStorage.setItem('userDepartment', data.user.departmentId || '');
      localStorage.setItem('name', data.user.name || '');
      
      // Store company data if available
      if (data.user.companyId) {
        localStorage.setItem('companyId', data.user.companyId);
      }
      
      if (data.company) {
        localStorage.setItem('companyName', data.company.name);
      }
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserEmail(email);
      setIsAdmin(data.user.isAdmin);
      setUserRole(data.user.role);
      setUserDepartment(data.user.departmentId || null);
      setCompanyId(data.user.companyId || null);
      setCompany(data.company || null);
      setName(data.user.name || null);
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
      localStorage.setItem('userDepartment', data.user.departmentId || '');
      localStorage.setItem('name', data.user.name || '');
      
      // Store company data if available
      if (data.user.companyId) {
        localStorage.setItem('companyId', data.user.companyId);
      }
      
      if (data.company) {
        localStorage.setItem('companyName', data.company.name);
      }
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserEmail(email);
      setIsAdmin(data.user.isAdmin);
      setUserRole(data.user.role);
      setUserDepartment(data.user.departmentId || null);
      setCompanyId(data.user.companyId || null);
      setCompany(data.company || null);
      setName(data.user.name || null);
    } finally {
      setLoading(false);
    }
  };

  // Company signup function
  const companySignup = async (companyName: string, email: string, password: string, name: string) => {
    setLoading(true);
    
    try {
      const data = await api.post<AuthResponse>('/users/company-signup', { 
        companyName, 
        email, 
        password, 
        name 
      });
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userEmail', email);
      localStorage.setItem('isAdmin', data.user.isAdmin ? 'true' : 'false');
      localStorage.setItem('userRole', data.user.role);
      localStorage.setItem('userDepartment', data.user.departmentId || '');
      localStorage.setItem('name', data.user.name || '');
      
      // Store company data
      if (data.user.companyId) {
        localStorage.setItem('companyId', data.user.companyId);
      }
      
      if (data.company) {
        localStorage.setItem('companyName', data.company.name);
      }
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserEmail(email);
      setIsAdmin(data.user.isAdmin);
      setUserRole(data.user.role);
      setUserDepartment(data.user.departmentId || null);
      setCompanyId(data.user.companyId || null);
      setCompany(data.company || null);
      setName(data.user.name || null);
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
      localStorage.removeItem('userDepartment');
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('name');
      
      // Update state
      setIsAuthenticated(false);
      setToken(null);
      setUserEmail(null);
      setIsAdmin(false);
      setUserRole(null);
      setUserDepartment(null);
      setCompanyId(null);
      setCompany(null);
    } finally {
      setLoading(false);
    }
  };

  // Create the auth value object
  const value = {
    isAuthenticated,
    userEmail,
    name,
    isAdmin,
    userRole,
    userDepartment,
    companyId,
    company,
    token,
    login,
    signup,
    companySignup,
    logout,
    loading,
    hasPermission,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
