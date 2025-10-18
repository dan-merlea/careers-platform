import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { API_URL } from "../../config";
import { api } from "../../utils/api";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { useAuth0 } from "@auth0/auth0-react";

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loading } = useAuth();
  const { loginWithRedirect } = useAuth0();

  // Check if there was a redirect from a protected route
  useEffect(() => {
    // Handle backend redirect query params for Google SSO
    const params = new URLSearchParams(location.search);
    const tokenFromSSO = params.get("token");
    const errorFromSSO = params.get("error");
    const emailPrefill = params.get("email");

    if (errorFromSSO) {
      setError(errorFromSSO);
    }

    if (emailPrefill) {
      setEmail(emailPrefill);
    }

    if (tokenFromSSO) {
      // Persist token so api util sends it
      localStorage.setItem("token", tokenFromSSO);
      
      // Fetch authenticated user profile to hydrate localStorage like a normal login
      api
        .get<{ user: { id: string; email: string; role: string; name?: string; departmentId?: string; companyId?: string }; company?: { id: string; name: string } | null }>(
          "/users/me"
        )
        .then((data) => {
          console.log("User profile data:", data);
          const { user, company } = data || ({} as any);
          if (user) {
            localStorage.setItem("userId", user.id);
            localStorage.setItem("userEmail", user.email);
            localStorage.setItem("isAdmin", user.role === "admin" ? "true" : "false");
            localStorage.setItem("userRole", user.role || "");
            localStorage.setItem("userDepartment", user.departmentId || "");
            localStorage.setItem("name", user.name || "");
            if (user.companyId) localStorage.setItem("companyId", user.companyId);
          }
          if (company) {
            localStorage.setItem("companyName", company.name || "");
          }
        })
        .catch(() => {
          // If /auth/me fails, proceed with token only; AuthProvider may still validate later
        })
        .finally(() => {
          // Redirect to dashboard (root) – a full reload ensures context picks it up
          window.location.href = "/";
        });
      return;
    }

    const from = location.state?.from?.pathname;
    if (from) {
      setError(`You need to sign in to access ${from}`);
    }
  }, [location]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      // Use the login function from AuthContext
      await login(email, password);
      
      // Redirect to dashboard or the page they were trying to access
      // This is handled by the AuthContext and LoginRoute component
      const from = location.state?.from?.pathname || "/";
      navigate(from);
    } catch (err: Error | unknown) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred during login";
      setError(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <img src="/logo_white.svg" alt="Company Logo" className="h-24 w-24" />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
          Hatch Beacon
        </h2>
        <p className="mt-2 text-center text-sm text-gray-400">
          The beacon for hiring success
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700">
          {error && (
            <div className="mb-4 bg-red-900/30 border-l-4 border-red-500 p-4 text-red-200">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-200">
                Email address
              </label>
              <div className="mt-1">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  variant="dark"
                  placeholder="admin@careers.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                Password
              </label>
              <div className="mt-1">
                <Input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  variant="dark"
                  placeholder="••••••••••"
                />
              </div>
            </div>

            <div>
              <Button type="submit" disabled={loading} variant="primary" fullWidth>
                {loading ? "Authenticating..." : "Sign in to Admin"}
              </Button>
            </div>
          </form>

          <div className="mt-4 space-y-3">
            <a
              href={`${API_URL}/auth/google`}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="h-5 w-5">
                <path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.7 32.4 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/>
                <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.2 16.2 18.7 12 24 12c3 0 5.7 1.1 7.8 2.9l5.7-5.7C34.2 6.1 29.4 4 24 4 16.3 4 9.6 8.3 6.3 14.7z"/>
                <path fill="#4CAF50" d="M24 44c5.2 0 10-2 13.6-5.2l-6.3-5.3C29.2 35.6 26.7 36 24 36c-5.3 0-9.7-3.6-11.3-8.5l-6.6 5.1C9.4 39.7 16.1 44 24 44z"/>
                <path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-1.1 3.2-3.5 5.7-6.7 7.3l6.3 5.3C37.1 38.7 40 32.9 40 26c0-1.3-.1-2.7-.4-3.5z"/>
              </svg>
              Sign in with Google
            </a>
            
            <button
              onClick={() => loginWithRedirect()}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-white bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6S6.698 2.4 12 2.4s9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6z"/>
                <path d="M12 6c-3.309 0-6 2.691-6 6s2.691 6 6 6 6-2.691 6-6-2.691-6-6-6zm0 9.6c-1.988 0-3.6-1.612-3.6-3.6s1.612-3.6 3.6-3.6 3.6 1.612 3.6 3.6-1.612 3.6-3.6 3.6z"/>
              </svg>
              Sign in with Okta (Auth0)
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Need an account?</span>
              </div>
            </div>
            <div className="mt-6 text-center">
              <Link to="/signup" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                Sign up for a new account
              </Link>
            </div>
            <div className="mt-2 text-center">
              <Link to="/company-signup" className="text-sm font-medium text-blue-500 hover:text-blue-400">
                Create a new company
              </Link>
            </div>
            <div className="relative mt-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-800 text-gray-400">Security Notice</span>
              </div>
            </div>
            <p className="mt-3 text-xs text-center text-gray-400">
              This is a secure system and unauthorized access is prohibited. All activities are logged and monitored.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
