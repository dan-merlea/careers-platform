import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <div className="lg:col-span-6">
              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
                Find Your Dream Career
              </h1>
              <p className="mt-6 text-xl">
                Connect with top employers and discover opportunities that match your skills and aspirations.
              </p>
              <div className="mt-10 flex space-x-4">
                <Link href="/signup" className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900">
                  Get Started
                </Link>
                <Link href="/features" className="px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-800 bg-white hover:bg-gray-100">
                  Learn More
                </Link>
              </div>
            </div>
            <div className="mt-12 lg:mt-0 lg:col-span-6">
              <div className="relative">
                <Image
                  src="/next.svg"
                  alt="Career opportunities"
                  width={600}
                  height={400}
                  className="rounded-lg shadow-xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Why Choose Our Platform
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-xl text-gray-500">
              Everything you need to advance your career and find the perfect job.
            </p>
          </div>

          <div className="mt-16 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Job Matching</h3>
              <p className="mt-2 text-gray-600">
                Our AI-powered matching system connects you with jobs that fit your skills and experience.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Career Networking</h3>
              <p className="mt-2 text-gray-600">
                Connect with professionals in your field and expand your career opportunities.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-gray-50 rounded-lg p-6 shadow-md">
              <div className="h-12 w-12 rounded-md bg-blue-600 flex items-center justify-center">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-medium text-gray-900">Resume Builder</h3>
              <p className="mt-2 text-gray-600">
                Create professional resumes that stand out to employers with our easy-to-use tools.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link href="/features" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              View All Features
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-blue-700 rounded-lg shadow-xl overflow-hidden">
            <div className="px-6 py-12 md:p-12 lg:py-16 lg:px-16">
              <div className="lg:grid lg:grid-cols-2 lg:gap-8">
                <div>
                  <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                    Ready to take the next step in your career?
                  </h2>
                  <p className="mt-4 text-lg text-blue-100">
                    Join thousands of professionals who have found their dream jobs through our platform.
                  </p>
                </div>
                <div className="mt-8 lg:mt-0 flex items-center justify-center lg:justify-end">
                  <div className="inline-flex rounded-md shadow">
                    <Link href="/signup" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-blue-700 bg-white hover:bg-gray-50">
                      Sign Up Now
                    </Link>
                  </div>
                  <div className="ml-4 inline-flex">
                    <Link href="/login" className="inline-flex items-center justify-center px-8 py-4 border border-transparent text-base font-medium rounded-md text-white bg-blue-800 hover:bg-blue-900">
                      Login
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
