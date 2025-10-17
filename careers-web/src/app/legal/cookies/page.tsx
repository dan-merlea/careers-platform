import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

export default function CookiePolicyPage() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Cookie Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. What Are Cookies?</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Cookies allow websites to recognize your device and remember information about your visit, such as your preferences and login status. This helps provide you with a better, more personalized experience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. How We Use Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Hatch Beacon uses cookies and similar technologies to provide, protect, and improve our services. We use cookies for various purposes, including:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Keeping you signed in to your account</li>
                <li>Understanding how you use our services</li>
                <li>Personalizing your experience</li>
                <li>Improving our platform performance</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Preventing fraud and enhancing security</li>
                <li>Delivering relevant content and features</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Types of Cookies We Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.1 Essential Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These cookies are necessary for our website to function properly. They enable core functionality such as security, network management, and accessibility. Without these cookies, services you have requested cannot be provided.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>Authentication cookies (keeping you logged in)</li>
                  <li>Security cookies (protecting against fraud)</li>
                  <li>Session cookies (maintaining your session state)</li>
                  <li>Load balancing cookies (distributing traffic)</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.2 Functional Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These cookies enable enhanced functionality and personalization. They may be set by us or by third-party providers whose services we use on our pages. If you do not allow these cookies, some or all of these services may not function properly.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>Remembering your preferences and settings</li>
                  <li>Storing your language preference</li>
                  <li>Remembering your region or country</li>
                  <li>Customizing content based on your usage</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.3 Analytics Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our services and user experience.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>Google Analytics (tracking page visits and user behavior)</li>
                  <li>Performance monitoring (measuring page load times)</li>
                  <li>Error tracking (identifying technical issues)</li>
                  <li>Usage statistics (understanding feature adoption)</li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">3.4 Marketing Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These cookies track your online activity to help us deliver more relevant advertising or to limit how many times you see an advertisement. We may share this information with other organizations, such as advertisers.
              </p>
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-2"><strong>Examples:</strong></p>
                <ul className="list-disc pl-6 space-y-1 text-sm text-gray-600">
                  <li>Advertising cookies (delivering targeted ads)</li>
                  <li>Social media cookies (enabling social sharing)</li>
                  <li>Retargeting cookies (showing relevant ads on other sites)</li>
                  <li>Conversion tracking (measuring campaign effectiveness)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Third-Party Cookies</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some cookies on our website are placed by third-party services that appear on our pages. We do not control these cookies, and you should check the third-party websites for more information about how they use cookies.
              </p>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Third-Party Services We Use</h3>
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Google Analytics</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    We use Google Analytics to understand how users interact with our website. Google Analytics uses cookies to collect information about website usage.
                  </p>
                  <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-sm text-purple-600 hover:text-purple-700">
                    Google Privacy Policy →
                  </a>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Social Media Platforms</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    We may use social media plugins that allow you to share content. These platforms may set cookies when you interact with their features.
                  </p>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Content Delivery Networks (CDN)</h4>
                  <p className="text-sm text-gray-700 mb-2">
                    We use CDNs to deliver content efficiently. These services may use cookies to optimize content delivery.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Cookie Duration</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Session Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These temporary cookies are deleted when you close your browser. They are used to maintain your session state while you navigate our website.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Persistent Cookies</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These cookies remain on your device for a set period or until you delete them. They help us remember your preferences and provide a better experience on repeat visits.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Note:</strong> Most persistent cookies on our site expire within 12 months, though some may last longer depending on their purpose.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Managing Your Cookie Preferences</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Browser Settings</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Most web browsers allow you to control cookies through their settings. You can set your browser to refuse cookies or delete certain cookies. However, please note that if you block or delete cookies, some features of our website may not work properly.
              </p>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-gray-700 mb-3"><strong>How to manage cookies in popular browsers:</strong></p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li>
                    <strong>Chrome:</strong> Settings → Privacy and security → Cookies and other site data
                  </li>
                  <li>
                    <strong>Firefox:</strong> Settings → Privacy & Security → Cookies and Site Data
                  </li>
                  <li>
                    <strong>Safari:</strong> Preferences → Privacy → Manage Website Data
                  </li>
                  <li>
                    <strong>Edge:</strong> Settings → Cookies and site permissions → Manage and delete cookies
                  </li>
                </ul>
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Opt-Out Tools</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You can opt out of certain types of cookies using these tools:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>
                  <strong>Google Analytics:</strong> Use the{' '}
                  <a href="https://tools.google.com/dlpage/gaoptout" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                    Google Analytics Opt-out Browser Add-on
                  </a>
                </li>
                <li>
                  <strong>Advertising cookies:</strong> Visit{' '}
                  <a href="https://www.youronlinechoices.com/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                    Your Online Choices
                  </a>
                  {' '}or{' '}
                  <a href="https://optout.aboutads.info/" target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                    Digital Advertising Alliance
                  </a>
                </li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Mobile Devices</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                On mobile devices, you can manage cookies and tracking through your device settings. You can also use the &quot;Limit Ad Tracking&quot; (iOS) or &quot;Opt out of Ads Personalization&quot; (Android) features.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Do Not Track Signals</h2>
              <p className="text-gray-700 leading-relaxed">
                Some browsers include a &quot;Do Not Track&quot; (DNT) feature that signals to websites that you do not want to be tracked. Currently, there is no industry standard for how to respond to DNT signals. We do not currently respond to DNT signals, but we provide you with choices about cookie usage as described in this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Personal Data</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Some cookies may collect personal data, such as your IP address or unique identifiers. The use of this data is governed by our Privacy Policy. We process this data in accordance with applicable data protection laws.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For more information about how we handle your personal data, please review our{' '}
                <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Updates to This Cookie Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Cookie Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. We encourage you to review this policy periodically. The &quot;Last updated&quot; date at the top of this page indicates when this policy was last revised.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about our use of cookies or this Cookie Policy, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a></p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Hatch Beacon BV</p>
                <p className="text-gray-700">Amsterdam, Netherlands</p>
              </div>
            </section>

            {/* Quick Reference Table */}
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Cookie Quick Reference</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cookie Type</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Purpose</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Can Be Disabled?</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Essential</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Required for site functionality</td>
                      <td className="px-4 py-3 text-sm text-gray-700">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Functional</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Enhanced features and personalization</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Analytics</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Understanding usage and improving services</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">Marketing</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Targeted advertising and tracking</td>
                      <td className="px-4 py-3 text-sm text-gray-700">Yes</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
