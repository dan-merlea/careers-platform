import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

export default function TermsOfServicePage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
            <p className="text-gray-600">Last updated: January 2025</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Agreement to Terms</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms of Service (&quot;Terms&quot;) constitute a legally binding agreement between you and Hatch Beacon, Inc. (&quot;Hatch Beacon,&quot; &quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) concerning your access to and use of our applicant tracking system and career platform services.
              </p>
              <p className="text-gray-700 leading-relaxed">
                By accessing or using our services, you agree to be bound by these Terms. If you do not agree to these Terms, you may not access or use our services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Definitions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>&quot;Services&quot;</strong> refers to our applicant tracking system, career platform, and all related features and functionality.</li>
                <li><strong>&quot;User&quot;</strong> refers to any individual or entity that accesses or uses our Services.</li>
                <li><strong>&quot;Employer&quot;</strong> refers to organizations using our Services to manage recruitment and hiring.</li>
                <li><strong>&quot;Candidate&quot;</strong> refers to individuals applying for jobs through our platform.</li>
                <li><strong>&quot;Content&quot;</strong> refers to all information, data, text, software, graphics, or other materials uploaded or transmitted through our Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Eligibility</h2>
              <p className="text-gray-700 leading-relaxed mb-3">To use our Services, you must:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Be at least 16 years of age</li>
                <li>Have the legal capacity to enter into binding contracts</li>
                <li>Not be prohibited from using our Services under applicable laws</li>
                <li>Provide accurate and complete registration information</li>
                <li>Maintain the security of your account credentials</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">4. User Accounts</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.1 Account Creation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                When you create an account, you must provide accurate, current, and complete information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.2 Account Security</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You agree to immediately notify us of any unauthorized access to or use of your account. We are not liable for any loss or damage arising from your failure to maintain account security.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">4.3 Account Termination</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We reserve the right to suspend or terminate your account at any time, with or without notice, for violation of these Terms or for any other reason at our sole discretion.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Acceptable Use</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.1 Permitted Use</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may use our Services only for lawful purposes and in accordance with these Terms. You agree to use our Services in a professional and ethical manner.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">5.2 Prohibited Activities</h3>
              <p className="text-gray-700 leading-relaxed mb-3">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Violate any applicable laws or regulations</li>
                <li>Infringe upon the rights of others</li>
                <li>Upload or transmit viruses, malware, or other malicious code</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Interfere with or disrupt the Services</li>
                <li>Scrape, harvest, or collect user information without permission</li>
                <li>Use automated systems to access the Services without authorization</li>
                <li>Impersonate any person or entity</li>
                <li>Post false, misleading, or fraudulent information</li>
                <li>Discriminate against candidates based on protected characteristics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Employer Obligations</h2>
              <p className="text-gray-700 leading-relaxed mb-3">If you are an Employer using our Services, you agree to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Comply with all applicable employment and anti-discrimination laws</li>
                <li>Provide accurate job descriptions and requirements</li>
                <li>Handle candidate information in accordance with privacy laws</li>
                <li>Not use the Services to discriminate against candidates</li>
                <li>Maintain appropriate data security measures</li>
                <li>Respond to candidate inquiries in a timely manner</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Intellectual Property</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.1 Our Intellectual Property</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                The Services, including all software, designs, text, graphics, logos, and other content, are owned by Hatch Beacon and protected by copyright, trademark, and other intellectual property laws. You may not copy, modify, distribute, or create derivative works without our express written permission.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.2 User Content</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You retain ownership of any content you submit to our Services. By submitting content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, and display such content solely for the purpose of providing and improving our Services.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">7.3 Feedback</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any feedback, suggestions, or ideas you provide to us become our property, and we may use them without any obligation to you.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Payment Terms</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.1 Subscription Fees</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Certain features of our Services require payment of subscription fees. All fees are non-refundable unless otherwise stated. We reserve the right to change our pricing at any time with reasonable notice.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.2 Billing</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You authorize us to charge your payment method on a recurring basis for your subscription. You are responsible for maintaining valid payment information.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">8.3 Cancellation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                You may cancel your subscription at any time. Cancellation will be effective at the end of your current billing period.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Protection and Privacy</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Your use of our Services is also governed by our Privacy Policy. By using our Services, you consent to our collection and use of your information as described in the Privacy Policy.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Employers are responsible for complying with all applicable data protection laws when processing candidate information through our Services.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Disclaimers</h2>
              <p className="text-gray-700 leading-relaxed mb-4 uppercase font-semibold">
                THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">We disclaim all warranties, including but not limited to:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Warranties of merchantability and fitness for a particular purpose</li>
                <li>Warranties that the Services will be uninterrupted or error-free</li>
                <li>Warranties regarding the accuracy or reliability of information</li>
                <li>Warranties that defects will be corrected</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
              <p className="text-gray-700 leading-relaxed mb-4 uppercase font-semibold">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, HATCH BEACON SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our total liability to you for all claims arising from or related to the Services shall not exceed the amount you paid us in the twelve months preceding the claim.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Indemnification</h2>
              <p className="text-gray-700 leading-relaxed">
                You agree to indemnify, defend, and hold harmless Hatch Beacon and its officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses arising from your use of the Services or violation of these Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Dispute Resolution</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.1 Governing Law</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                These Terms shall be governed by and construed in accordance with the laws of the State of California, without regard to its conflict of law provisions.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">13.2 Arbitration</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Any dispute arising from these Terms or the Services shall be resolved through binding arbitration in accordance with the rules of the American Arbitration Association.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Modifications to Terms</h2>
              <p className="text-gray-700 leading-relaxed">
                We reserve the right to modify these Terms at any time. We will provide notice of material changes by posting the updated Terms on our website. Your continued use of the Services after such changes constitutes acceptance of the modified Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">15. General Provisions</h2>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li><strong>Severability:</strong> If any provision of these Terms is found to be unenforceable, the remaining provisions will remain in effect.</li>
                <li><strong>Waiver:</strong> Our failure to enforce any right or provision shall not constitute a waiver of such right or provision.</li>
                <li><strong>Assignment:</strong> You may not assign these Terms without our prior written consent.</li>
                <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Hatch Beacon regarding the Services.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Contact Information</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                If you have questions about these Terms, please contact us:
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
