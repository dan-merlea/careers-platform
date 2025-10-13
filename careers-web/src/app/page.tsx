import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-black pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-black to-black"></div>
        
        <div className="relative max-w-[1200px] mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="animated-border inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm text-gray-300">Your shortcut to career success</span>
            </div>

            <a href="#" className="hero-announcement">
              <span className="text">Introducing Hatch Beacon</span>
            </a>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-white mb-2">Find Your Dream</span>
              <span className="block gradient-text">Career Today</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Connect with top employers and discover opportunities that match your skills. 
              <span className="text-white"> It&apos;s not about finding a job.</span> It&apos;s about building your future.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/signup" 
                className="group relative px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
              >
                Get Started
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/features" 
                className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">10k+</div>
                <div className="text-sm text-gray-500 mt-1">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">500+</div>
                <div className="text-sm text-gray-500 mt-1">Companies</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">50k+</div>
                <div className="text-sm text-gray-500 mt-1">Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              There&apos;s a feature for that
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to advance your career, all in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF6363] to-[#A855F7] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Job Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                AI-powered matching connects you with opportunities that perfectly align with your skills and career goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Network</h3>
              <p className="text-gray-400 leading-relaxed">
                Build meaningful connections with industry leaders and expand your professional circle effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-red-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#FF6363] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Resume Builder</h3>
              <p className="text-gray-400 leading-relaxed">
                Create stunning, ATS-optimized resumes that make you stand out from the competition.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF6363] to-[#FF6B35] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Interview Scheduler</h3>
              <p className="text-gray-400 leading-relaxed">
                Seamlessly schedule and manage interviews with integrated calendar and video conferencing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#FF6363] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Career Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your application progress and get insights to improve your job search strategy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#A855F7] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Notifications</h3>
              <p className="text-gray-400 leading-relaxed">
                Get real-time updates on new opportunities, application status, and interview invitations.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/features" 
              className="inline-flex items-center px-8 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm group"
            >
              Explore All Features
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#FF6363] via-[#A855F7] to-[#EC4899] rounded-3xl p-1">
            <div className="bg-black rounded-3xl p-12 sm:p-16">
              <div className="text-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Ready to accelerate your career?
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Join thousands of professionals who have transformed their careers with Hatch Beacon.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/signup" 
                    className="group px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Get Started Free
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link 
                    href="/contact" 
                    className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
