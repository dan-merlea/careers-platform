import Link from "next/link";

export default function Features() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-32 lg:py-40">
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Platform <span className="gradient-text">Features</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover all the tools and features that will help you find your dream job and accelerate your career.
          </p>
        </div>

        <div className="space-y-32">
          {/* Feature 1 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-12 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF6363] to-[#A855F7] flex items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                  </div>
                  <div className="text-6xl font-bold text-gray-200">01</div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                AI-Powered Job Matching
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Our advanced algorithm analyzes your skills, experience, and preferences to match you with the perfect job opportunities. Get personalized recommendations that align with your career goals.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Skill-based matching for relevant opportunities
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Personalized job recommendations
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-purple-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Salary insights and company culture fit
                  </p>
                </li>
              </ul>
            </div>
          </div>

          {/* Feature 2 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="mt-10 lg:mt-0 order-2 lg:order-1">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Professional Networking
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Connect with industry professionals, mentors, and potential employers. Build meaningful relationships that can help advance your career.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Industry-specific networking groups
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Direct messaging with recruiters
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-pink-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Virtual networking events and webinars
                  </p>
                </li>
              </ul>
            </div>
            <div className="relative order-1 lg:order-2">
              <div className="bg-gradient-to-br from-pink-50 to-red-50 rounded-3xl p-12 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                    </svg>
                  </div>
                  <div className="text-6xl font-bold text-gray-200">02</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
            <div className="relative">
              <div className="bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-12 border border-gray-200">
                <div className="space-y-4">
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#FF6363] flex items-center justify-center">
                    <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="text-6xl font-bold text-gray-200">03</div>
                </div>
              </div>
            </div>
            <div className="mt-10 lg:mt-0">
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Resume Builder & Career Tools
              </h2>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                Create professional resumes and cover letters that stand out to employers. Get feedback and tips to improve your application materials.
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Professional resume templates
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    AI-powered resume feedback
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center">
                      <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <p className="ml-4 text-lg text-gray-700">
                    Cover letter generator and interview preparation
                  </p>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-32 text-center">
          <Link 
            href="/signup" 
            className="inline-flex items-center px-8 py-4 bg-gray-900 text-white rounded-xl font-semibold text-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl hover:scale-105 group"
          >
            Get Started Today
            <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
