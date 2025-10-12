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
import CompanySignupPage from './pages/CompanySignupPage';
import UnauthorizedPage from './pages/UnauthorizedPage';
import ProfilePage from './pages/ProfilePage';
import JobBoardsPage from './pages/JobBoardsPage';
import JobBoardJobsPage from './pages/JobBoardJobsPage';
import JobBoardJobCreatePage from './pages/JobBoardJobCreatePage';
import JobsPage from './pages/JobsPage';
import JobCreatePage from './pages/JobCreatePage';
import JobEditPage from './pages/JobEditPage';
import JobDetailPage from './pages/JobDetailPage';
import HeadcountListPage from './pages/HeadcountListPage';
import HeadcountRequestForm from './pages/HeadcountRequestForm';
import DebugJobApplications from './pages/DebugJobApplications';
import InterviewsPage from './pages/InterviewsPage';
import InterviewProcessCreatePage from './pages/InterviewProcessCreatePage';
import InterviewProcessEditPage from './pages/InterviewProcessEditPage';
import InterviewProcessDetailPage from './pages/InterviewProcessDetailPage';
import InterviewDetailPage from './pages/InterviewDetailPage';
import ApplicantDetailPage from './pages/ApplicantDetailPage';
import ApplicantsPage from './pages/ApplicantsPage';
import ReferralPage from './pages/ReferralPage';
import LogsPage from './pages/LogsPage';
import AnalyticsPage from './pages/AnalyticsPage';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CompanyProvider } from './context/CompanyContext';
import { NotificationProvider } from './context/NotificationContext';
import RoleGuard from './components/guards/RoleGuard';
import InterviewAccessGuard from './components/guards/InterviewAccessGuard';
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
  const location = useLocation();
  
  // Handle OAuth redirect back from Google
  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('googleCalendarConnected') === 'true') {
      // Get stored return URL
      const returnUrl = sessionStorage.getItem('oauthReturnUrl');
      if (returnUrl && returnUrl !== location.pathname) {
        sessionStorage.removeItem('oauthReturnUrl');
        window.location.href = returnUrl;
      }
    }
  }, [location]);
  
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
      
      {/* Public route for company signup - redirects to dashboard if already logged in */}
      <Route path="/company-signup" element={
        <LoginRoute>
          <CompanySignupPage />
        </LoginRoute>
      } />
      
      {/* All other routes are protected */}
      <Route path="/*" element={
        <ProtectedRoute>
          <CompanyProvider>
            <NotificationProvider>
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
                  <RoleGuard requiredRoles={['admin']} showUnauthorized>
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
              
              {/* Headcount routes */}
              <Route
                path="/headcount"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'manager']} showUnauthorized>
                    <HeadcountListPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/headcount/new"
                element={
                  <RoleGuard requiredRoles={['admin', 'manager']} showUnauthorized>
                    <HeadcountRequestForm />
                  </RoleGuard>
                }
              />
              <Route
                path="/headcount/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'manager']} showUnauthorized>
                    <HeadcountRequestForm />
                  </RoleGuard>
                }
              />
              
              {/* Interview Process routes */}
              <Route
                path="/interview-processes/create"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <InterviewProcessCreatePage />
                  </RoleGuard>
                }
              />
              <Route
                path="/interview-processes/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <InterviewProcessDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/interview-processes/:id/edit"
                element={
                  <RoleGuard requiredRoles={['admin', 'director']} showUnauthorized>
                    <InterviewProcessEditPage />
                  </RoleGuard>
                }
              />
              
              {/* Interviews routes */}
              <Route
                path="/interviews"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter', 'user']} showUnauthorized>
                    <InterviewsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/interview/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter', 'interviewer', 'user']} showUnauthorized>
                    <InterviewAccessGuard>
                      <InterviewDetailPage />
                    </InterviewAccessGuard>
                  </RoleGuard>
                }
              />
              
              {/* Debug routes - only visible in development mode */}
              <Route
                path="/debug"
                element={
                  <RoleGuard requiredRoles={['admin']} showUnauthorized>
                    <DebugJobApplications />
                  </RoleGuard>
                }
              />
              
              {/* Analytics Dashboard */}
              <Route
                path="/analytics"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/analytics/:section"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />
              
              {/* User Activity Logs */}
              <Route
                path="/logs"
                element={
                  <RoleGuard requiredRoles={['admin']} showUnauthorized>
                    <LogsPage />
                  </RoleGuard>
                }
              />
              
              {/* Applicants List Page */}
              <Route
                path="/applicants"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <ApplicantsPage />
                  </RoleGuard>
                }
              />

              {/* Applicant Detail Page */}
              <Route
                path="/applicants/:id"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <ApplicantDetailPage />
                  </RoleGuard>
                }
              />
              <Route
                path="/applicants/:id/:tab"
                element={
                  <RoleGuard requiredRoles={['admin', 'director', 'recruiter']} showUnauthorized>
                    <ApplicantDetailPage />
                  </RoleGuard>
                }
              />
              
              {/* Referral Page - accessible to all authenticated users */}
              <Route
                path="/referrals"
                element={<ReferralPage />}
              />
              <Route
                path="/referrals/my-referrals"
                element={<ReferralPage />}
              />
              
              {/* Access control pages */}
              <Route path="/unauthorized" element={<UnauthorizedPage />} />
              
              {/* Add more role-based routes as needed */}
              <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
              </Layout>
            </NotificationProvider>
          </CompanyProvider>
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
