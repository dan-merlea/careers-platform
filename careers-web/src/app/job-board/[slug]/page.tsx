'use client';

import { useEffect, useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import CandidateLayout from '@/layouts/CandidateLayout';
import Select from '@/components/Select';

interface Department {
  id: string;
  name: string;
}

interface Job {
  _id: string;
  title: string;
  location: string;
  status: string;
  createdAt: string;
  internalId?: string;
  slug?: string;
  departments?: Department[];
}

interface JobBoard {
  _id: string;
  title: string;
  description?: string;
  companyId: string;
  slug: string;
}

export default function JobBoardPage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const [jobBoard, setJobBoard] = useState<JobBoard | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#2563eb');
  
  // Filter states
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [selectedEmploymentType, setSelectedEmploymentType] = useState<string>('all');

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch job board by slug
        const backendUrl = process.env.NEXT_PUBLIC_API_URL;
        const jobBoardResponse = await fetch(`${backendUrl}/public-api/job-boards/slug/${slug}`);
        if (!jobBoardResponse.ok) {
          throw new Error('Job board not found');
        }
        const jobBoardData = await jobBoardResponse.json();
        setJobBoard(jobBoardData);

        // Fetch jobs for this job board
        const jobsResponse = await fetch(`${backendUrl}/public-api/jobs/job-board/${jobBoardData._id}`);
        if (jobsResponse.ok) {
          const jobsData = await jobsResponse.json();
          setJobs(jobsData);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      fetchData();
    }
  }, [slug]);

  // Extract unique departments, locations, and employment types from jobs
  const departments = useMemo(() => {
    const deptSet = new Set<string>();
    jobs.forEach(job => {
      job.departments?.forEach(dept => deptSet.add(dept.name));
    });
    return Array.from(deptSet).sort();
  }, [jobs]);

  const locations = useMemo(() => {
    const locSet = new Set<string>();
    jobs.forEach(job => {
      // Extract base location (before parentheses)
      const baseLocation = job.location.split('(')[0].trim();
      locSet.add(baseLocation);
    });
    return Array.from(locSet).sort();
  }, [jobs]);

  const employmentTypes = useMemo(() => {
    const typeSet = new Set<string>();
    jobs.forEach(job => {
      // Extract employment type from location (inside parentheses)
      const match = job.location.match(/\((.*?)\)/);
      if (match) {
        // Capitalize first letter
        const type = match[1];
        const capitalized = type.charAt(0).toUpperCase() + type.slice(1);
        typeSet.add(capitalized);
      }
    });
    return Array.from(typeSet).sort();
  }, [jobs]);

  // Filter jobs based on selected filters
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Department filter
      if (selectedDepartment !== 'all') {
        const hasDepartment = job.departments?.some(dept => dept.name === selectedDepartment);
        if (!hasDepartment) return false;
      }

      // Location filter
      if (selectedLocation !== 'all') {
        const baseLocation = job.location.split('(')[0].trim();
        if (baseLocation !== selectedLocation) return false;
      }

      // Employment type filter
      if (selectedEmploymentType !== 'all') {
        const match = job.location.match(/\((.*?)\)/);
        const employmentType = match ? match[1] : '';
        // Capitalize first letter for comparison
        const capitalizedType = employmentType.charAt(0).toUpperCase() + employmentType.slice(1);
        if (capitalizedType !== selectedEmploymentType) return false;
      }

      return true;
    });
  }, [jobs, selectedDepartment, selectedLocation, selectedEmploymentType]);

  const getJobUrl = (job: Job) => {
    const jobSlug = job.slug || job._id;
    return `/job-board/${slug}/${jobSlug}`;
  };

  if (isLoading) {
    return (
      <CandidateLayout companyId={jobBoard?.companyId}>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  if (error || !jobBoard) {
    return (
      <CandidateLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600">{error || 'Job board not found'}</p>
          </div>
        </div>
      </CandidateLayout>
    );
  }

  return (
    <CandidateLayout 
      companyId={jobBoard.companyId}
      onCompanyLoaded={(companyInfo) => {
        if (companyInfo.primaryColor) {
          setPrimaryColor(companyInfo.primaryColor);
        }
      }}
    >
      <div className="py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Filters - Inline at top */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Department Filter */}
              <div>
                <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <Select
                  value={selectedDepartment}
                  onChange={(value) => setSelectedDepartment(value || 'all')}
                  options={[
                    { label: 'All Departments', value: 'all' },
                    ...departments.map(dept => ({ label: dept, value: dept }))
                  ]}
                  placeholder="All Departments"
                  ariaLabel="Filter by department"
                  primaryColor={primaryColor}
                />
              </div>

              {/* Location Filter */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Location
                </label>
                <Select
                  value={selectedLocation}
                  onChange={(value) => setSelectedLocation(value || 'all')}
                  options={[
                    { label: 'All Locations', value: 'all' },
                    ...locations.map(loc => ({ label: loc, value: loc }))
                  ]}
                  placeholder="All Locations"
                  ariaLabel="Filter by location"
                  primaryColor={primaryColor}
                />
              </div>

              {/* Employment Type Filter */}
              <div>
                <label htmlFor="employmentType" className="block text-sm font-medium text-gray-700 mb-2">
                  Employment Type
                </label>
                <Select
                  value={selectedEmploymentType}
                  onChange={(value) => setSelectedEmploymentType(value || 'all')}
                  options={[
                    { label: 'All Types', value: 'all' },
                    ...employmentTypes.map(type => ({ label: type, value: type }))
                  ]}
                  placeholder="All Types"
                  ariaLabel="Filter by employment type"
                  primaryColor={primaryColor}
                />
              </div>
            </div>

            {/* Clear Filters Button */}
            {(selectedDepartment !== 'all' || selectedLocation !== 'all' || selectedEmploymentType !== 'all') && (
              <div className="mt-4">
                <button
                  onClick={() => {
                    setSelectedDepartment('all');
                    setSelectedLocation('all');
                    setSelectedEmploymentType('all');
                  }}
                  className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 font-medium border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>

          {/* Jobs List */}
          {filteredJobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500">
                {jobs.length === 0 
                  ? 'No open positions at the moment. Check back soon!' 
                  : 'No jobs match your filters. Try adjusting your search criteria.'}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-4 text-sm text-gray-600">
                Showing {filteredJobs.length} of {jobs.length} {jobs.length === 1 ? 'position' : 'positions'}
              </div>
              <div className="space-y-4">
                {filteredJobs.map((job) => (
                  <a
                    key={job._id}
                    href={getJobUrl(job)}
                    className="block bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow border border-gray-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">
                          {job.title}
                        </h2>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {job.location}
                          </span>
                          <span className="text-gray-400">•</span>
                          <span>
                            Posted {new Date(job.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <div>
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </CandidateLayout>
  );
}
