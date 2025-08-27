import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/ScrollFix.css';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import SetupPage from './pages/SetupPage';
import CompanyDetailsPage from './pages/CompanyDetailsPage';
import UsersPage from './pages/UsersPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './pages/ProfilePage';
import JobBoardsPage from './pages/JobBoardsPage';
import JobBoardJobsPage from './pages/JobBoardJobsPage';
import JobBoardJobCreatePage from './pages/JobBoardJobCreatePage';
import JobsPage from './pages/JobsPage';
import JobCreatePage from './pages/JobCreatePage';
import JobEditPage from './pages/JobEditPage';
import JobDetailPage from './pages/JobDetailPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import RoleGuard from './components/guards/RoleGuard';
import SessionExpiredNotification from './components/notifications/SessionExpiredNotification';

// Protected route component
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Login route component - redirects to dashboard if already logged in
interface LoginRouteProps {
  children: React.ReactNode;
}

const LoginRoute: React.FC<LoginRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (isAuthenticated) {
    // Redirect to dashboard if already authenticated
    return <Navigate to={from} replace />;
  }
  
  return <>{children}</>;
};

// App Routes component - separated to use the auth context
const AppRoutes: React.FC = () => {
  return (
    <>
      <SessionExpiredNotification />
    <Routes>
      {/* Public route for login - redirects to dashboard if already logged in */}
      <Route path="/login" element={
        <LoginRoute>
          <LoginPage />
        </LoginRoute>
      } />
      
      {/* Public route for signup - redirects to dashboard if already logged in */}
      <Route path="/signup" element={
        <LoginRoute>
          <SignupPage />
        </LoginRoute>
      } />
      
      {/* All other routes are protected */}
      <Route path="/*" element={
        <ProtectedRoute>
          <Layout>
            <Routes>
              <Route path="/" element={<HomePage />} />
              
              {/* Admin-only routes */}
              <Route
                path="/setup"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <SetupPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/company-details/*"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <CompanyDetailsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/users"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <UsersPage />
                  </RoleGuard>
                }
              />
              {/* User profile page - accessible to all authenticated users */}
              <Route path="/profile" element={<ProfilePage />} />
              
              {/* Job boards page - accessible to admin users */}
              <Route
                path="/job-boards"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobBoardsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/job-boards/:jobBoardId/jobs"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobBoardJobsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/job-boards/:jobBoardId/jobs/create"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobBoardJobCreatePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/job-boards/:jobBoardId/jobs/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/job-boards/:jobBoardId/jobs/:id/edit"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobEditPage />
                  </RoleGuard>
                }
              />
              
              {/* Job pages - accessible to admin users */}
              <Route
                path="/jobs"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/jobs/create"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobCreatePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/jobs/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/jobs/:id/edit"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <JobEditPage />
                  </RoleGuard>
                }
              />
              
              {/* Job approval functionality has been merged into the Jobs page */}
              
              {/* Access control pages */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Add more role-based routes as needed */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Layout>
        </ProtectedRoute>
      } />
    </Routes>
    </>
  );
};

// Main App component
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
