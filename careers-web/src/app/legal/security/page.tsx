import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

export default function SecurityPage() {
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
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Security</h1>
            <p className="text-gray-600">Our commitment to protecting your data</p>
          </div>

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Security Commitment</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                At Hatch Beacon, security is not an afterthought—it&apos;s built into everything we do. We understand that you&apos;re entrusting us with sensitive candidate information and business data, and we take that responsibility seriously.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Our security program is designed to protect your data through multiple layers of defense, continuous monitoring, and adherence to industry best practices and compliance standards.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Encryption</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Encryption in Transit</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All data transmitted between your browser and our servers is encrypted using industry-standard TLS 1.3 protocol. This ensures that your information cannot be intercepted or read by unauthorized parties during transmission.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Encryption at Rest</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All data stored in our databases is encrypted using AES-256 encryption, the same standard used by banks and government agencies. This includes candidate resumes, personal information, and all other sensitive data.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Key Management</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use industry-leading key management services to securely generate, store, and rotate encryption keys. Keys are never stored alongside the data they protect.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Infrastructure Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Cloud Infrastructure</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our services are hosted on enterprise-grade cloud infrastructure with multiple layers of physical and logical security controls. Our infrastructure providers maintain SOC 2 Type II and ISO 27001 certifications.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Network Security</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Firewalls and intrusion detection systems monitor all network traffic</li>
                <li>DDoS protection prevents service disruptions</li>
                <li>Network segmentation isolates sensitive systems</li>
                <li>Regular vulnerability scanning and penetration testing</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Redundancy and Availability</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our infrastructure is designed for high availability with automatic failover, load balancing, and geographic redundancy. We maintain a 99.9% uptime SLA.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Controls</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Authentication</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Strong password requirements with complexity rules</li>
                {/* <li>Multi-factor authentication (MFA) available for all accounts</li> */}
                <li>Session management with automatic timeout</li>
                <li>Single Sign-On (SSO) support for enterprise customers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Authorization</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Role-based access control (RBAC) ensures users can only access data and features appropriate to their role. Permissions are granted on a least-privilege basis.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Employee Access</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Access to production systems is strictly limited and logged. All employees undergo background checks and security training. Access is reviewed quarterly and revoked immediately upon termination.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Security</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Secure Development</h3>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Security is integrated into our software development lifecycle</li>
                <li>Code reviews include security considerations</li>
                <li>Automated security testing in CI/CD pipeline</li>
                <li>Regular security training for developers</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Vulnerability Management</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We maintain a comprehensive vulnerability management program that includes regular security assessments, dependency scanning, and prompt patching of identified vulnerabilities.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Input Validation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All user input is validated and sanitized to prevent injection attacks, cross-site scripting (XSS), and other common vulnerabilities. We follow OWASP security guidelines.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Data Protection</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Data Backup</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All data is automatically backed up daily with encrypted backups stored in geographically separate locations. We maintain point-in-time recovery capabilities.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Data Retention</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We retain data only as long as necessary for business purposes or as required by law. Data deletion requests are processed promptly and securely.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Data Isolation</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Each customer&apos;s data is logically isolated to prevent unauthorized access between organizations. Multi-tenancy is implemented with strict separation controls.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Monitoring and Incident Response</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">24/7 Monitoring</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Our security operations team monitors systems around the clock for suspicious activity, security events, and potential threats. Automated alerts enable rapid response to incidents.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Audit Logging</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                Comprehensive audit logs track all system access and data modifications. Logs are encrypted, tamper-proof, and retained for compliance purposes.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Incident Response Plan</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We maintain a documented incident response plan that defines procedures for detecting, responding to, and recovering from security incidents. Our team conducts regular drills to ensure readiness.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Breach Notification</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                In the unlikely event of a data breach, we will notify affected parties promptly in accordance with applicable laws and regulations.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Compliance and Certifications</h2>
              
              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Regulatory Compliance</h3>
              <p className="text-gray-700 leading-relaxed mb-3">We maintain compliance with relevant data protection regulations, including:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>General Data Protection Regulation (GDPR)</li>
                <li>California Consumer Privacy Act (CCPA)</li>
                <li>SOC 2 Type II (in progress)</li>
                <li>ISO 27001 (planned)</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Third-Party Audits</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                We undergo regular third-party security audits and assessments to validate our security controls and identify areas for improvement.
              </p>

              <h3 className="text-xl font-semibold text-gray-900 mb-3 mt-6">Vendor Management</h3>
              <p className="text-gray-700 leading-relaxed mb-4">
                All third-party vendors are carefully vetted for security practices. We maintain data processing agreements and regularly review vendor security posture.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Security Best Practices for Users</h2>
              
              <p className="text-gray-700 leading-relaxed mb-3">Help us keep your account secure by following these best practices:</p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700 mb-4">
                <li>Use a strong, unique password for your account</li>
                {/* <li>Enable multi-factor authentication (MFA)</li> */}
                <li>Never share your login credentials</li>
                <li>Log out when using shared computers</li>
                <li>Keep your contact information up to date</li>
                <li>Report suspicious activity immediately</li>
                <li>Review account activity regularly</li>
                <li>Be cautious of phishing attempts</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Responsible Disclosure</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                We welcome reports of potential security vulnerabilities from security researchers and the community. If you discover a security issue, please report it responsibly.
              </p>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">How to Report a Vulnerability</h3>
                <p className="text-blue-800 mb-3">
                  Email us at <a href="mailto:contact@hatchbeacon.com" className="text-blue-600 hover:text-blue-700 font-medium">contact@hatchbeacon.com</a> with:
                </p>
                <ul className="list-disc pl-6 space-y-1 text-blue-800">
                  <li>Description of the vulnerability</li>
                  <li>Steps to reproduce the issue</li>
                  <li>Potential impact assessment</li>
                  <li>Your contact information</li>
                </ul>
              </div>

              <p className="text-gray-700 leading-relaxed">
                We commit to acknowledging reports within 48 hours and providing regular updates on remediation progress. We ask that you do not publicly disclose the vulnerability until we have had a chance to address it.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Continuous Improvement</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Security is an ongoing process, not a destination. We continuously evaluate and improve our security posture through:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-gray-700">
                <li>Regular security assessments and audits</li>
                <li>Staying current with emerging threats and vulnerabilities</li>
                <li>Investing in security tools and technologies</li>
                <li>Employee security awareness training</li>
                <li>Participating in security communities and forums</li>
                <li>Learning from industry incidents and best practices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Contact Our Security Team</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Have questions about our security practices? Want to request our security documentation? Contact our security team:
              </p>
              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-700 mb-2"><strong>Security Inquiries:</strong> <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a></p>
                <p className="text-gray-700 mb-2"><strong>Vulnerability Reports:</strong> <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a></p>
                <p className="text-gray-700"><strong>Privacy Concerns:</strong> <a href="mailto:contact@hatchbeacon.com" className="text-purple-600 hover:text-purple-700">contact@hatchbeacon.com</a></p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
