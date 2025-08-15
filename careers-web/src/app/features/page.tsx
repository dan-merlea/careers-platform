import Image from "next/image";
import Link from "next/link";

export default function Features() {
  return (
    <div className="py-12 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Platform Features
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Discover all the tools and features that will help you find your dream job.
          </p>
        </div>

        <div className="mt-16">
          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="relative">
                <div className="aspect-w-3 aspect-h-2 rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src="/next.svg"
                    alt="Job matching feature"
                    className="object-cover"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  AI-Powered Job Matching
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                  Our advanced algorithm analyzes your skills, experience, and preferences to match you with the perfect job opportunities. Get personalized recommendations that align with your career goals.
                </p>
                <div className="mt-10">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Skill-based matching for relevant opportunities
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Personalized job recommendations
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Salary insights and company culture fit
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="mt-10 lg:mt-0 lg:col-start-1">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Professional Networking
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                  Connect with industry professionals, mentors, and potential employers. Build meaningful relationships that can help advance your career.
                </p>
                <div className="mt-10">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Industry-specific networking groups
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Direct messaging with recruiters
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Virtual networking events and webinars
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="relative lg:col-start-2">
                <div className="aspect-w-3 aspect-h-2 rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src="/next.svg"
                    alt="Professional networking feature"
                    className="object-cover"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="lg:grid lg:grid-cols-2 lg:gap-8 lg:items-center">
              <div className="relative">
                <div className="aspect-w-3 aspect-h-2 rounded-lg shadow-lg overflow-hidden">
                  <Image
                    src="/next.svg"
                    alt="Resume builder feature"
                    className="object-cover"
                    width={600}
                    height={400}
                  />
                </div>
              </div>
              <div className="mt-10 lg:mt-0">
                <h2 className="text-3xl font-extrabold text-gray-900">
                  Resume Builder & Career Tools
                </h2>
                <p className="mt-3 text-lg text-gray-500">
                  Create professional resumes and cover letters that stand out to employers. Get feedback and tips to improve your application materials.
                </p>
                <div className="mt-10">
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Professional resume templates
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        AI-powered resume feedback
                      </p>
                    </li>
                    <li className="flex items-start">
                      <div className="flex-shrink-0">
                        <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <p className="ml-3 text-base text-gray-500">
                        Cover letter generator and interview preparation
                      </p>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-20 text-center">
          <Link href="/signup" className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
            Get Started Today
          </Link>
        </div>
      </div>
    </div>
  );
}
