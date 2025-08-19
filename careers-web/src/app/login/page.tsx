"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginRedirect() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to admin login page
    window.location.href = "http://localhost:3000/login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center max-w-md p-6 bg-white rounded-lg shadow-md">
        <h1 className="text-2xl font-semibold text-gray-900">Redirecting to Authentication...</h1>
        <p className="mt-2 text-gray-600">Please wait, you are being redirected to the authentication page.</p>
        <div className="mt-4">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
        </div>
        <p className="mt-4 text-sm text-gray-600">
          If you are not redirected automatically, please choose an option below:
        </p>
        <div className="mt-6 flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
          <a 
            href="http://localhost:3000/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sign In
          </a>
          <a 
            href="http://localhost:3000/signup" 
            className="px-4 py-2 border border-blue-600 text-blue-600 rounded hover:bg-blue-50 transition-colors"
          >
            Create Account
          </a>
        </div>
      </div>
    </div>
  );
}
