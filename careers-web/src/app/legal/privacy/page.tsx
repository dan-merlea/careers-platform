import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

export default function PrivacyPolicyPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Welcome to Hatch Beacon (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our applicant tracking system (ATS) and career platform services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By using our services, you agree to the collection and use of information in accordance with this policy. If you do not agree with our policies and practices, please do not use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.1 Information You Provide</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We collect information that you voluntarily provide to us when you:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Register for an account</li>
                <li>Submit job applications</li>
                <li>Upload resumes and other documents</li>
                <li>Communicate with us via email or contact forms</li>
                <li>Participate in surveys or provide feedback</li>
              </ul>
              
              <p className="text-gray-700 leading-relaxed mt-4 mb-3">This information may include:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Name, email address, phone number</li>
                <li>Resume, cover letter, and portfolio materials</li>
                <li>Work history, education, and qualifications</li>
                <li>Professional references</li>
                <li>Any other information you choose to provide</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">2.2 Automatically Collected Information</h3>
              <p className="text-gray-700 leading-relaxed mb-3">When you access our services, we automatically collect certain information, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>IP address and browser type</li>
                <li>Device information and operating system</li>
                <li>Pages viewed and time spent on pages</li>
                <li>Referring website addresses</li>
                <li>Cookies and similar tracking technologies</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
              <p className="text-gray-700 leading-relaxed mb-3">We use the information we collect for various purposes, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Providing and maintaining our services</li>
                <li>Processing job applications and managing recruitment workflows</li>
                <li>Communicating with you about your applications and our services</li>
                <li>Improving our platform and user experience</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Detecting and preventing fraud or security issues</li>
                <li>Complying with legal obligations</li>
                <li>Sending marketing communications (with your consent)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Information Sharing and Disclosure</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 With Employers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you apply for a job through our platform, we share your application information with the relevant employer or hiring organization. This is necessary to facilitate the recruitment process.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Service Providers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may share your information with third-party service providers who perform services on our behalf, such as hosting, data analysis, email delivery, and customer service. These providers are contractually obligated to protect your information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Legal Requirements</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We may disclose your information if required by law or in response to valid requests by public authorities (e.g., court orders, subpoenas).
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.4 Business Transfers</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                In connection with any merger, sale of company assets, financing, or acquisition of all or a portion of our business, your information may be transferred to the acquiring entity.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Retention</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this Privacy Policy, unless a longer retention period is required or permitted by law.
              </p>
              <p className="text-gray-700 leading-relaxed">
                For job applicants, we typically retain application data for 12 months after the application date, unless you request deletion or the hiring organization requires a different retention period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Your Privacy Rights</h2>
              <p className="text-gray-700 leading-relaxed mb-3">Depending on your location, you may have the following rights:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Access:</strong> Request access to your personal information</li>
                <li><strong>Correction:</strong> Request correction of inaccurate information</li>
                <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                <li><strong>Objection:</strong> Object to processing of your personal information</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent where processing is based on consent</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                To exercise these rights, please contact us at <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Data Security</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. These measures include:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and audits</li>
                <li>Access controls and authentication mechanisms</li>
                <li>Employee training on data protection</li>
                <li>Incident response procedures</li>
              </ul>
              <p className="text-gray-700 leading-relaxed mt-4">
                However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. International Data Transfers</h2>
              <p className="text-gray-700 leading-relaxed">
                Your information may be transferred to and processed in countries other than your country of residence. These countries may have data protection laws that differ from those in your country. We ensure appropriate safeguards are in place to protect your information in accordance with this Privacy Policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Children&apos;s Privacy</h2>
              <p className="text-gray-700 leading-relaxed">
                Our services are not intended for individuals under the age of 16. We do not knowingly collect personal information from children. If you believe we have collected information from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Changes to This Privacy Policy</h2>
              <p className="text-gray-700 leading-relaxed">
                We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date. We encourage you to review this Privacy Policy periodically.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Contact Us</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions or concerns about this Privacy Policy or our data practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Email:</strong> <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a></p>
                <p className="text-gray-700 mb-2"><strong>Address:</strong> Hatch Beacon BV</p>
                <p className="text-gray-700">Amsterdam, Netherlands</p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
