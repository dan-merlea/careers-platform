'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import CandidateLayout from '@/layouts/CandidateLayout';
import '@/styles/job-content.css';

interface Job {
  _id: string;
  title: string;
  location: string;
  content: string;
  createdAt: string;
  companyId: {
    _id: string;
    name: string;
  };
  jobBoard?: {
    _id: string;
    slug: string;
    title: string;
    companyId: string;
  };
}

export default function JobDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const jobSlug = params.jobId as string; // This is actually a slug now
  
  const [job, setJob] = useState<Job | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#2563eb');

  useEffect(() => {
    async function fetchData() {
      try {
        // Extract jobId from slug (format: title-slug-jobId)
        // The jobId is a 24-character hex string at the end
        // Match the last 24 characters that are valid MongoDB ObjectId format
        const objectIdPattern = /[a-f0-9]{24}$/i;
        const match = jobSlug.match(objectIdPattern);
        const extractedJobId = match ? match[0] : jobSlug;
        
        // Fetch job details by ID (jobBoard is populated in the response)
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
        const jobResponse = await fetch(`${backendUrl}/public-api/jobs/${extractedJobId}`);
        if (!jobResponse.ok) {
          throw new Error('Job not found');
        }
        const jobData = await jobResponse.json();
        setJob(jobData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (jobSlug) {
      fetchData();
    }
  }, [jobSlug]);

  const scrollToForm = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const formElement = document.getElementById('application-form');
    if (formElement) {
      formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);

    const formData = new FormData(e.currentTarget);
    formData.append('consentDuration', '12');
    
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${backendUrl}/public-api/job-applications`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Failed to submit application');
      }

      setSubmitSuccess(true);
      (e.target as HTMLFormElement).reset();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <CandidateLayout companyId={job?.companyId._id}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  if (error || !job) {
    return (
      <CandidateLayout companyId={job?.companyId._id}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error || 'Job not found'}</p>
            <a
              href={`/job-board/${slug}`}
              className="mt-4 inline-block text-blue-600 hover:text-blue-700 font-medium"
            >
              ← Back to jobs
            </a>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout 
      companyId={job.companyId._id}
      onCompanyLoaded={(companyInfo) => {
        if (companyInfo.primaryColor) {
          setPrimaryColor(companyInfo.primaryColor);
        }
      }}
    >
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Back button */}
          <a
            href={`/job-board/${job.jobBoard?.slug || slug}`}
            className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to all jobs
          </a>

          {/* Job Header */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {job.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-600 mb-6">
              <span className="flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {job.location}
              </span>
              <span className="text-gray-400">•</span>
              <span>
                Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
            <a
              href="#application-form"
              onClick={scrollToForm}
              className="inline-block w-full sm:w-auto px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
            >
              Apply for this position
            </a>
          </div>

          {/* Job Description */}
          <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
            <div 
              className="job-content"
              dangerouslySetInnerHTML={{ __html: job.content }}
            />
          </div>

          {/* Application Form */}
          <div id="application-form" className="bg-white rounded-lg shadow-sm p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Apply for this position</h2>
            
            {submitSuccess ? (
              <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
                <h3 className="text-lg font-semibold text-green-800 mb-2">Application Submitted!</h3>
                <p className="text-green-700">Thank you for your application. We&apos;ll review it and get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <input type="hidden" name="jobId" value={job._id} />
                <input type="hidden" name="jobTitle" value={job.title} />
                <input type="hidden" name="companyId" value={job.companyId._id} />
                
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                    {submitError}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-2">
                      Last Name *
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div>
                  <label htmlFor="resume" className="block text-sm font-medium text-gray-700 mb-2">
                    Resume * (PDF, DOC, DOCX - Max 5MB)
                  </label>
                  <input
                    type="file"
                    id="resume"
                    name="resume"
                    required
                    accept=".pdf,.doc,.docx"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                  <p className="mt-1 text-sm text-gray-500">Accepted formats: PDF, DOC, DOCX (Max 5MB)</p>
                </div>

                <div>
                  <label htmlFor="coverLetter" className="block text-sm font-medium text-gray-700 mb-2">
                    Cover Letter
                  </label>
                  <textarea
                    id="coverLetter"
                    name="coverLetter"
                    rows={6}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                    placeholder="Tell us why you're a great fit for this role..."
                  />
                </div>

                <div>
                  <label htmlFor="linkedinUrl" className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn Profile
                  </label>
                  <input
                    type="url"
                    id="linkedinUrl"
                    name="linkedinUrl"
                    placeholder="https://linkedin.com/in/yourprofile"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
                  />
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="consent"
                    name="consent"
                    required
                    className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="consent" className="ml-2 text-sm text-gray-700">
                    I consent to the processing of my personal data for recruitment purposes *
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  style={{
                    backgroundColor: isSubmitting ? '#9CA3AF' : primaryColor,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.opacity = '0.9';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isSubmitting) {
                      e.currentTarget.style.opacity = '1';
                    }
                  }}
                  className="w-full px-8 py-3 text-white font-semibold rounded-lg transition-all disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Application'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </CandidateLayout>
  );
}
