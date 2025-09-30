import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, clearAuth, getAuthToken, SESSION_EXPIRED_EVENT } from '../utils/api';
import { authService } from '../services/auth.service';

// Define company type
interface Company {
  id: string;
  name: string;
}

// Define the shape of our auth context
interface AuthContextType {
  isAuthenticated: boolean;
  userId: string | null;
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
  impersonateUser: (userId: string) => Promise<void>;
  isImpersonating: boolean;
  impersonatedBy: {
    id: string;
    email: string;
    name: string;
  } | null;
  returnToAdmin: () => Promise<void>;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  userId: null,
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
  impersonateUser: async () => {},
  isImpersonating: false,
  impersonatedBy: null,
  returnToAdmin: async () => {},
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
  const [userId, setUserId] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userDepartment, setUserDepartment] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [company, setCompany] = useState<Company | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [name, setName] = useState<string | null>(null);
  const [isImpersonating, setIsImpersonating] = useState<boolean>(false);
  const [impersonatedBy, setImpersonatedBy] = useState<{
    id: string;
    email: string;
    name: string;
  } | null>(null);
  
  // We can't use useNavigate directly in the provider because it's not inside a Router
  // Instead, we'll handle navigation in a separate effect

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      const storedToken = getAuthToken();
      const storedUserId = localStorage.getItem('userId');
      const storedEmail = localStorage.getItem('userEmail');
      const storedIsAdmin = localStorage.getItem('isAdmin') === 'true';
      const storedRole = localStorage.getItem('userRole');
      const storedDepartment = localStorage.getItem('userDepartment');
      const storedCompanyId = localStorage.getItem('companyId');
      const storedCompanyName = localStorage.getItem('companyName');
      const storedName = localStorage.getItem('name');
      
      // Check if user is being impersonated
      const storedImpersonatedBy = localStorage.getItem('impersonatedBy');
      let impersonationData = null;
      if (storedImpersonatedBy) {
        try {
          impersonationData = JSON.parse(storedImpersonatedBy);
          setIsImpersonating(true);
          setImpersonatedBy(impersonationData);
        } catch (e) {
          console.error('Error parsing impersonation data:', e);
          localStorage.removeItem('impersonatedBy');
        }
      }

      if (storedToken) {
        // Validate token with the backend
        try {
          // Optional: Make a request to validate the token
          // await api.get('/users/validate-token');
          
          // If no error, token is valid
          setIsAuthenticated(true);
          setToken(storedToken);
          setUserId(storedUserId);
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
          setUserId(null);
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
        setUserId(null);
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
      // Token is invalid, clear auth data
      clearAuth();
      setIsAuthenticated(false);
      setToken(null);
      setUserId(null);
      setUserEmail(null);
      setIsAdmin(false);
      setUserRole(null);
      setUserDepartment(null);
      setCompanyId(null);
      setCompany(null);
      setName(null);
      setIsImpersonating(false);
      setImpersonatedBy(null);
      setIsImpersonating(false);
      setImpersonatedBy(null);
      
      // We can't use navigate here, so we'll redirect manually
      // window.location.href = '/login';
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

  // Login function: expect token-only response, then fetch profile via /auth/me
  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      const tokenResp = await api.post<{ token: string }>('/users/login', { email, password });
      const tokenValue = (tokenResp as any)?.token;
      if (!tokenValue) {
        throw new Error('No token returned from login');
      }

      // Store token first so the api util includes Authorization header
      localStorage.setItem('token', tokenValue);
      setToken(tokenValue);

      // Fetch authenticated user profile
      const me = await api.get<{ user: { id: string; email: string; role: string; name?: string; departmentId?: string; companyId?: string }, company?: { id: string; name: string } | null }>('/users/me');

      const { user: meUser, company: meCompany } = me || ({} as any);
      if (!meUser) {
        throw new Error('Unable to fetch user profile');
      }

      console.log('User profile:', meUser);
      console.log('Company profile:', meCompany);

      // Persist user/company details
      localStorage.setItem('userId', meUser.id);
      localStorage.setItem('userEmail', meUser.email);
      localStorage.setItem('isAdmin', meUser.role === 'admin' ? 'true' : 'false');
      localStorage.setItem('userRole', meUser.role || '');
      localStorage.setItem('userDepartment', meUser.departmentId || '');
      localStorage.setItem('name', meUser.name || '');
      if (meUser.companyId) localStorage.setItem('companyId', meUser.companyId);
      if (meCompany) localStorage.setItem('companyName', meCompany.name || '');

      // Update state
      setIsAuthenticated(true);
      setUserId(meUser.id);
      setUserEmail(meUser.email);
      setIsAdmin(meUser.role === 'admin');
      setUserRole(meUser.role || null);
      setUserDepartment(meUser.departmentId || null);
      setCompanyId(meUser.companyId || null);
      setCompany(meCompany || null);
      setName(meUser.name || null);
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
      localStorage.setItem('userId', data.user.id);
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
      setUserId(data.user.id);
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
      localStorage.setItem('userId', data.user.id);
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
      setUserId(data.user.id);
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
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userDepartment');
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('name');
      localStorage.removeItem('impersonatedBy');
      
      // Update state
      setIsAuthenticated(false);
      setToken(null);
      setUserId(null);
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

  // Impersonate user function
  const impersonateUser = async (userId: string) => {
    setLoading(true);
    
    try {
      const data = await authService.impersonateUser(userId);
      
      // Store auth data
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      localStorage.setItem('userEmail', data.user.email);
      localStorage.setItem('isAdmin', data.user.role === 'admin' ? 'true' : 'false');
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
      
      // Store impersonation data
      if (data.impersonatedBy) {
        localStorage.setItem('impersonatedBy', JSON.stringify(data.impersonatedBy));
      }
      
      // Update state
      setIsAuthenticated(true);
      setToken(data.token);
      setUserId(data.user.id);
      setUserEmail(data.user.email);
      setIsAdmin(data.user.role === 'admin');
      setUserRole(data.user.role);
      setUserDepartment(data.user.departmentId || null);
      setCompanyId(data.user.companyId || null);
      setCompany(data.company || null);
      setName(data.user.name || null);
      setIsImpersonating(true);
      setImpersonatedBy(data.impersonatedBy || null);
    } catch (error) {
      console.error('Error impersonating user:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Return to admin function
  const returnToAdmin = async () => {
    setLoading(true);
    
    try {
      if (!impersonatedBy) {
        throw new Error('Not currently impersonating a user');
      }
      
      // Log in as the admin user
      const adminEmail = impersonatedBy.email;
      
      // Clear current user data
      clearAuth();
      localStorage.removeItem('userId');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userDepartment');
      localStorage.removeItem('companyId');
      localStorage.removeItem('companyName');
      localStorage.removeItem('name');
      localStorage.removeItem('impersonatedBy');
      
      // Reset impersonation state
      setIsImpersonating(false);
      setImpersonatedBy(null);
      
      // Redirect to login page with admin email pre-filled
      window.location.href = `/login?email=${encodeURIComponent(adminEmail)}`;
    } catch (error) {
      console.error('Error returning to admin:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  // Create the auth value object
  const value = {
    isAuthenticated,
    userId,
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
    impersonateUser,
    isImpersonating,
    impersonatedBy,
    returnToAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;
