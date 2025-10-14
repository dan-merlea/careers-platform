
export default function Pricing() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-[1200px] mx-auto px-6 py-32 lg:py-40">
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6">
            Simple, <span className="gradient-text">Transparent</span> Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose the plan that works best for your career goals. No hidden fees, cancel anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 lg:gap-8">
          {/* Free Plan */}
          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl flex flex-col card-hover hover:shadow-xl">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">Basic</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold text-gray-600">/month</span>
              </p>
              <p className="mt-6 text-gray-600">
                Perfect for job seekers just getting started.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Basic job search</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Simple resume builder</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Limited job applications (5/month)</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold text-gray-900 hover:bg-gray-200 transition-all">
                Get Started
              </a>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-400 rounded-2xl flex flex-col card-hover hover:shadow-xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-full px-4 py-1 text-sm font-bold text-white">
                Popular
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">Professional</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$19</span>
                <span className="ml-1 text-xl font-semibold text-gray-700">/month</span>
              </p>
              <p className="mt-6 text-gray-700">
                Everything you need for a successful job search.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-900">All Basic features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-900">Advanced AI job matching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-900">Unlimited job applications</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-900">Resume review by experts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-900">Priority application status</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-gray-900 text-white border border-transparent rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold hover:bg-gray-800 transition-all">
                Get Started
              </a>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl flex flex-col card-hover hover:shadow-xl">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-gray-900">Enterprise</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$49</span>
                <span className="ml-1 text-xl font-semibold text-gray-600">/month</span>
              </p>
              <p className="mt-6 text-gray-600">
                Advanced features for serious career advancement.
              </p>

              <ul className="mt-8 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">All Professional features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">1-on-1 career coaching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Interview preparation sessions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Exclusive networking events</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="h-5 w-5 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-gray-700">Salary negotiation support</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-gray-100 border border-gray-300 rounded-xl py-3 px-5 inline-flex items-center justify-center font-semibold text-gray-900 hover:bg-gray-200 transition-all">
                Get Started
              </a>
            </div>
          </div>
        </div>

        <div className="mt-32 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I cancel my subscription at any time?</h3>
              <p className="text-gray-600">
                Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your billing cycle.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Do you offer discounts for students?</h3>
              <p className="text-gray-600">
                Yes, we offer a 50% discount for students with a valid student ID. Contact our support team to apply for the discount.
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I switch between plans?</h3>
              <p className="text-gray-600">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
