import Link from "next/link";

export default function Pricing() {
  return (
    <div className="bg-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Choose the plan that works best for your career goals
          </p>
        </div>

        <div className="mt-16 space-y-12 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-x-8">
          {/* Free Plan */}
          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Basic</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$0</span>
                <span className="ml-1 text-xl font-semibold">/month</span>
              </p>
              <p className="mt-6 text-gray-500">
                Perfect for job seekers just getting started.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Basic job search</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Simple resume builder</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Limited job applications (5/month)</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-5 inline-flex items-center justify-center text-base font-medium text-white hover:bg-blue-700">
                Get Started
              </a>
            </div>
          </div>

          {/* Pro Plan */}
          <div className="relative p-8 bg-blue-600 rounded-2xl shadow-lg flex flex-col">
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-blue-800 rounded-full px-4 py-1 text-sm font-semibold text-white">
                Popular
              </span>
            </div>
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-white">Professional</h3>
              <p className="mt-4 flex items-baseline text-white">
                <span className="text-5xl font-extrabold tracking-tight">$19</span>
                <span className="ml-1 text-xl font-semibold">/month</span>
              </p>
              <p className="mt-6 text-blue-100">
                Everything you need for a successful job search.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-blue-100">All Basic features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-blue-100">Advanced AI job matching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-blue-100">Unlimited job applications</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-blue-100">Resume review by experts</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-blue-100">Priority application status</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-white border border-transparent rounded-md py-3 px-5 inline-flex items-center justify-center text-base font-medium text-blue-600 hover:bg-gray-50">
                Get Started
              </a>
            </div>
          </div>

          {/* Enterprise Plan */}
          <div className="relative p-8 bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col">
            <div className="flex-1">
              <h3 className="text-xl font-semibold text-gray-900">Enterprise</h3>
              <p className="mt-4 flex items-baseline text-gray-900">
                <span className="text-5xl font-extrabold tracking-tight">$49</span>
                <span className="ml-1 text-xl font-semibold">/month</span>
              </p>
              <p className="mt-6 text-gray-500">
                Advanced features for serious career advancement.
              </p>

              <ul className="mt-6 space-y-4">
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">All Professional features</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">1-on-1 career coaching</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Interview preparation sessions</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Exclusive networking events</p>
                </li>
                <li className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-6 w-6 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="ml-3 text-base text-gray-500">Salary negotiation support</p>
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <a href="http://localhost:3000/signup" className="w-full bg-blue-600 border border-transparent rounded-md py-3 px-5 inline-flex items-center justify-center text-base font-medium text-white hover:bg-blue-700">
                Get Started
              </a>
            </div>
          </div>
        </div>

        <div className="mt-16 border-t border-gray-200 pt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-extrabold text-gray-900">Frequently asked questions</h2>
          <div className="mt-6 space-y-8">
            <div>
              <h3 className="text-lg font-medium text-gray-900">Can I cancel my subscription at any time?</h3>
              <p className="mt-2 text-base text-gray-500">
                Yes, you can cancel your subscription at any time. Your plan will remain active until the end of your billing cycle.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Do you offer discounts for students?</h3>
              <p className="mt-2 text-base text-gray-500">
                Yes, we offer a 50% discount for students with a valid student ID. Contact our support team to apply for the discount.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">Can I switch between plans?</h3>
              <p className="mt-2 text-base text-gray-500">
                Yes, you can upgrade or downgrade your plan at any time. Changes will be applied at the start of your next billing cycle.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
