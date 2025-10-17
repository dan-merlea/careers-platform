'use client';

import DefaultLayout from "@/layouts/DefaultLayout";

export default function ApiDocsPage() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Public API Documentation</h1>
            <p className="text-lg text-gray-600">
              Access our public APIs to integrate job listings, company information, and job applications into your platform.
            </p>
          </div>

          {/* Base URL */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Base URL</h2>
            <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm">
              <code>{process.env.NEXT_PUBLIC_API_URL}/public-api</code>
            </div>
            <p className="mt-4 text-gray-600">
              All API endpoints are relative to this base URL. Replace <code className="bg-gray-100 px-2 py-1 rounded">{process.env.NEXT_PUBLIC_API_URL}</code> with your actual backend server URL.
            </p>
          </div>

          {/* Authentication */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Authentication</h2>
            <p className="text-gray-600">
              All endpoints listed below are public and do not require authentication.
            </p>
          </div>

          {/* Rate Limiting */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Rate Limiting</h2>
            <p className="text-gray-600 mb-4">
              To ensure fair usage and system stability, all public API endpoints are rate limited.
            </p>

            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Default Rate Limit</h3>
                <p className="text-blue-800 text-sm">
                  <strong>300 requests per minute</strong> (average of 5 requests per second)
                </p>
                <p className="text-blue-700 text-sm mt-2">
                  Applies to: Company info, Job boards, Job listings
                </p>
              </div>

              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <h3 className="font-semibold text-orange-900 mb-2">Job Applications Rate Limit</h3>
                <p className="text-orange-800 text-sm">
                  <strong>60 requests per minute</strong> (1 request per second)
                </p>
                <p className="text-orange-700 text-sm mt-2">
                  Stricter limit to prevent spam and ensure quality submissions
                </p>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2">Rate Limit Headers</h3>
                <p className="text-gray-700 text-sm mb-2">
                  When rate limited, you&apos;ll receive a <code className="bg-gray-200 px-2 py-1 rounded">429 Too Many Requests</code> response with the following headers:
                </p>
                <ul className="list-disc list-inside text-gray-700 text-sm space-y-1">
                  <li><code className="bg-gray-200 px-2 py-1 rounded">X-RateLimit-Limit</code> - Maximum requests allowed</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">X-RateLimit-Remaining</code> - Requests remaining</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">X-RateLimit-Reset</code> - Time when limit resets</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Endpoints */}
          <div className="space-y-8">
            {/* Get Company Info */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">GET</span>
                <h3 className="text-xl font-bold text-gray-900">Get Company Information</h3>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm mb-4">
                <code>/company/:companyId</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve basic information about a company including name, logo, and brand colors.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Parameter</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">companyId</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">MongoDB ObjectId of the company</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm"><code>{`{
  "companyName": "Acme Corp",
  "logo": "https://example.com/logo.png",
  "slogan": "Building the future",
  "primaryColor": "#3B82F6",
  "secondaryColor": "#8B5CF6"
}`}</code></pre>
              </div>
            </div>

            {/* Get Job Board */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">GET</span>
                <h3 className="text-xl font-bold text-gray-900">Get Job Board by Slug</h3>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm mb-4">
                <code>/job-boards/slug/:slug</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve job board details using its unique slug.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Parameter</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">slug</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">URL-friendly identifier for the job board</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm"><code>{`{
  "_id": "68bdee88b858cd75883621cd",
  "slug": "acme-careers",
  "title": "Acme Careers",
  "companyId": "68bdee88b858cd75883621cd",
  "isActive": true
}`}</code></pre>
              </div>
            </div>

            {/* Get Job Board Jobs */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">GET</span>
                <h3 className="text-xl font-bold text-gray-900">Get Jobs by Job Board</h3>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm mb-4">
                <code>/jobs/job-board/:jobBoardId</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve all published jobs for a specific job board.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Parameter</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">jobBoardId</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">MongoDB ObjectId of the job board</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm"><code>{`[
  {
    "_id": "68ec13ea2a75bad5539d37b8",
    "title": "Senior Backend Engineer",
    "location": "San Francisco, CA (Hybrid)",
    "content": "<p>Job description...</p>",
    "company": {
      "id": "68bdee88b858cd75883621cd",
      "name": "Acme Corp"
    },
    "departments": [
      {
        "id": "68bdee88b858cd75883621ce",
        "name": "Engineering"
      }
    ],
    "slug": "senior-backend-engineer-68ec13ea2a75bad5539d37b8",
    "createdAt": "2025-01-15T10:30:00.000Z"
  }
]`}</code></pre>
              </div>
            </div>

            {/* Get Job by ID */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg font-semibold text-sm">GET</span>
                <h3 className="text-xl font-bold text-gray-900">Get Job by ID</h3>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm mb-4">
                <code>/jobs/:jobId</code>
              </div>
              <p className="text-gray-600 mb-4">Retrieve detailed information about a specific job, including populated job board data.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Parameters</h4>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Parameter</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">jobId</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">MongoDB ObjectId of the job</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto">
                <pre className="text-green-400 text-sm"><code>{`{
  "_id": "68ec13ea2a75bad5539d37b8",
  "title": "Senior Backend Engineer",
  "location": "San Francisco, CA (Hybrid)",
  "content": "<p>Job description...</p>",
  "company": {
    "id": "68bdee88b858cd75883621cd",
    "name": "Acme Corp"
  },
  "jobBoard": {
    "_id": "68bdee88b858cd75883621cd",
    "slug": "acme-careers",
    "title": "Acme Careers",
    "companyId": "68bdee88b858cd75883621cd"
  },
  "departments": [...],
  "slug": "senior-backend-engineer-68ec13ea2a75bad5539d37b8"
}`}</code></pre>
              </div>
            </div>

            {/* Submit Application */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm">POST</span>
                <h3 className="text-xl font-bold text-gray-900">Submit Job Application</h3>
              </div>
              <div className="bg-gray-100 text-gray-900 rounded-lg p-4 font-mono text-sm mb-4">
                <code>/job-applications/public</code>
              </div>
              <p className="text-gray-600 mb-4">Submit a job application with resume file. Files are scanned for malicious content before processing.</p>

              <h4 className="font-semibold text-gray-900 mb-2">Request Body (multipart/form-data)</h4>
              <div className="bg-gray-50 text-gray-900 rounded-lg p-4 mb-4">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-2 font-semibold">Field</th>
                      <th className="text-left py-2 font-semibold">Type</th>
                      <th className="text-left py-2 font-semibold">Required</th>
                      <th className="text-left py-2 font-semibold">Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">firstName</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Applicant&apos;s first name</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">lastName</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Applicant&apos;s last name</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">email</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Applicant&apos;s email address</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">phone</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2"></td>
                      <td className="py-2">Applicant&apos;s phone number</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">jobId</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Id of the job</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">companyId</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Id of the company</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">resume</code></td>
                      <td className="py-2">file</td>
                      <td className="py-2">✓</td>
                      <td className="py-2">Resume file (PDF, DOC, DOCX - Max 5MB)</td>
                    </tr>
                    <tr className="border-b border-gray-100">
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">coverLetter</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2"></td>
                      <td className="py-2">Cover letter text</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">linkedinUrl</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2"></td>
                      <td className="py-2">LinkedIn profile URL</td>
                    </tr>
                    <tr>
                      <td className="py-2"><code className="bg-gray-200 px-2 py-1 rounded">source</code></td>
                      <td className="py-2">string</td>
                      <td className="py-2"></td>
                      <td className="py-2">Source of the application (default: `career_site`)</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Response (Success)</h4>
              <div className="bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4">
                <pre className="text-green-400 text-sm"><code>{`{
  "success": true,
  "message": "Application submitted successfully",
  "application": {
    "_id": "68ec13ea2a75bad5539d37b9",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@example.com",
    "status": "new",
    "appliedAt": "2025-01-15T10:30:00.000Z"
  }
}`}</code></pre>
              </div>

              <h4 className="font-semibold text-gray-900 mb-2">Error Responses</h4>
              <div className="space-y-2">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-900">400 Bad Request</p>
                  <p className="text-sm text-red-700">Missing required fields, invalid file type, or file size exceeds limit</p>
                </div>
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-sm font-semibold text-red-900">400 Bad Request (Malicious Content)</p>
                  <p className="text-sm text-red-700">File contains potentially malicious content and cannot be accepted</p>
                </div>
              </div>
            </div>
          </div>

          {/* Support */}
          <div className="bg-white rounded-lg shadow-sm p-8 mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Support</h2>
            <p className="text-gray-600">
              For API support, questions, or to report issues, please contact us at{' '}
              <a href="mailto:api-support@example.com" className="text-blue-600 hover:text-blue-700 font-medium">
                contact@hatchbeacon.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
