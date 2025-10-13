
export default function Pricing() {
  return (
    <div className="bg-black pt-24 min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-24">
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Choose the plan that works best for your career goals. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Free Plan */}
          <div className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col card-hover">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">Basic</h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
              </p>
              <p className="mt-6 text-gray-400">
                Perfect for job seekers just getting started.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Basic job search</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Simple resume builder</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Limited job applications (5/month)</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold text-white hover:bg-white/20 transition-all">
                Get Started
              </a>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 bg-gradient-to-br from-purple-900/40 to-pink-900/40 border-2 border-purple-500/50 rounded-2xl flex flex-col card-hover">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-1 text-sm font-bold text-white">
                Popular
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">Professional</h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$19</span>
                <span className="ml-1 text-xl font-semibold text-gray-300">/month</span>
              </p>
              <p className="mt-6 text-gray-300">
                Everything you need for a successful job search.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">All Basic features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Advanced AI job matching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Unlimited job applications</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Resume review by experts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-white">Priority application status</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-white text-black border border-transparent rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold hover:bg-gray-100 transition-all">
                Get Started
              </a>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="relative p-8 bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl flex flex-col card-hover">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-white">Enterprise</h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$49</span>
                <span className="ml-1 text-xl font-semibold text-gray-400">/month</span>
              </p>
              <p className="mt-6 text-gray-400">
                Advanced features for serious career advancement.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">All Professional features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">1-on-1 career coaching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Interview preparation sessions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Exclusive networking events</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-300">Salary negotiation support</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-white/10 border border-white/20 rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold text-white hover:bg-white/20 transition-all">
                Get Started
              </a>
            </div>
          </div>
        </div>

        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I cancel my subscription at any time?</h3>
              <p className="text-gray-400">
                Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your billing cycle.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Do you offer discounts for students?</h3>
              <p className="text-gray-400">
                Yes, we offer a 50% discount for students with a valid student ID. Contact our support team to apply for the discount.
              </p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-white mb-2">Can I switch between plans?</h3>
              <p className="text-gray-400">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
