'use client';

import DefaultLayout from "@/layouts/DefaultLayout";
import Link from "next/link";

export default function CustomDomainSetupPage() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          <div className="mb-6">
            <Link
              href="/"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </Link>
            <h1 className="text-3xl font-bold text-gray-900">Custom Domain Setup Guide</h1>
            <p className="text-gray-600 mt-2">
              Learn how to configure a custom domain for your job board
            </p>
          </div>

          <div className="space-y-6">
            {/* Overview */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
              <p className="text-gray-700 mb-4">
                Custom domains allow you to host your job board on your own domain (e.g., careers.yourcompany.com) 
                instead of using the default platform URL. This provides a more professional appearance and better 
                brand consistency.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Recommendation:</strong> We strongly recommend using a subdomain (e.g., careers.yourcompany.com, 
                  jobs.yourcompany.com) rather than your root domain (yourcompany.com).
                </p>
              </div>
            </div>

            {/* Prerequisites */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Prerequisites</h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700">
                <li>A job board with a configured slug</li>
                <li>Access to your domain&apos;s DNS settings</li>
                <li>A subdomain you want to use (e.g., careers.yourcompany.com)</li>
              </ul>
            </div>

            {/* Step-by-Step Guide */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Step-by-Step Setup</h2>
              
              <div className="space-y-6">
                {/* Step 1 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      1
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Configure Your Job Board Slug</h3>
                  </div>
                  <p className="text-gray-700 ml-11 mb-2">
                    Before setting up a custom domain, ensure your job board has a slug configured. This is required 
                    for the custom domain to work properly.
                  </p>
                  <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      Contact your administrator to configure a slug for your job board in the admin panel.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      2
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Add CNAME Record to Your DNS</h3>
                  </div>
                  <p className="text-gray-700 ml-11 mb-3">
                    Log in to your domain registrar or DNS provider (e.g., Cloudflare, GoDaddy, Namecheap) and add a 
                    CNAME record with the following details:
                  </p>
                  <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-4">
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-gray-200">
                        <tr>
                          <td className="py-2 font-semibold text-gray-700 w-32">Type:</td>
                          <td className="py-2 text-gray-900"><code className="bg-white px-2 py-1 rounded border">CNAME</code></td>
                        </tr>
                        <tr>
                          <td className="py-2 font-semibold text-gray-700">Name:</td>
                          <td className="py-2 text-gray-900"><code className="bg-white px-2 py-1 rounded border">careers</code> .yourdomain.com (or your chosen subdomain)</td>
                        </tr>
                        <tr>
                          <td className="py-2 font-semibold text-gray-700">Value:</td>
                          <td className="py-2 text-gray-900"><code className="bg-white px-2 py-1 rounded border">hatchbeacon.com</code></td>
                        </tr>
                        <tr>
                          <td className="py-2 font-semibold text-gray-700">TTL:</td>
                          <td className="py-2 text-gray-900"><code className="bg-white px-2 py-1 rounded border">Auto</code> or <code className="bg-white px-2 py-1 rounded border">3600</code></td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="ml-11 mt-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                    <p className="text-sm text-amber-800">
                      <strong>Note:</strong> DNS changes can take anywhere from a few minutes to 48 hours to propagate, 
                      though they typically complete within 1-2 hours.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      3
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Enter Custom Domain in Job Board Settings</h3>
                  </div>
                  <p className="text-gray-700 ml-11 mb-2">
                    Once your DNS record is configured, contact your administrator to add your custom domain to your job board settings.
                  </p>
                  <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      Your administrator will enter the full subdomain (e.g., <code className="bg-gray-100 px-1 py-0.5 rounded">careers.yourcompany.com</code>) in the admin panel.
                    </p>
                  </div>
                </div>

                {/* Step 4 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      4
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">Verify Your Domain</h3>
                  </div>
                  <p className="text-gray-700 ml-11 mb-2">
                    After the custom domain is saved, your administrator can verify that your DNS configuration is correct 
                    using the verification tool in the admin panel.
                  </p>
                  <div className="ml-11 bg-gray-50 border border-gray-200 rounded-lg p-3">
                    <p className="text-sm text-gray-700">
                      The verification process checks that your CNAME record is properly configured and pointing to 
                      the correct destination. If verification fails, double-check your DNS settings and wait a bit 
                      longer for DNS propagation.
                    </p>
                  </div>
                </div>

                {/* Step 5 */}
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-blue-600 text-white rounded-full font-bold">
                      5
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900">SSL Certificate (Coming Soon)</h3>
                  </div>
                  <p className="text-gray-700 ml-11 mb-2">
                    Once your domain is verified, an SSL certificate will be automatically generated for your custom 
                    domain to ensure secure HTTPS connections.
                  </p>
                  <div className="ml-11 bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <p className="text-sm text-blue-800">
                      <strong>Note:</strong> Automatic SSL certificate generation is coming soon. For now, manual 
                      verification confirms your DNS setup is correct.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Common Issues & Troubleshooting</h2>
              
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Domain verification fails</h3>
                  <ul className="list-disc list-inside space-y-1 text-gray-700 text-sm ml-4">
                    <li>Wait longer for DNS propagation (can take up to 48 hours)</li>
                    <li>Verify the CNAME record is correctly configured in your DNS settings</li>
                    <li>Ensure you&apos;re using the subdomain name only (e.g., &quot;careers&quot;) not the full domain</li>
                    <li>Check that there are no conflicting A or AAAA records for the same subdomain</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Cannot set custom domain without slug</h3>
                  <p className="text-gray-700 text-sm ml-4">
                    A slug is required before configuring a custom domain. Contact your administrator to set a 
                    unique slug for your job board first.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">Domain shows as not verified</h3>
                  <p className="text-gray-700 text-sm ml-4">
                    Ask your administrator to click the &quot;Verify Domain&quot; button again after ensuring your DNS changes have propagated. You can 
                    use online DNS lookup tools to check if your CNAME record is visible.
                  </p>
                </div>
              </div>
            </div>

            {/* Example DNS Providers */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">DNS Provider Examples</h2>
              <p className="text-gray-700 mb-4">
                Here are quick links to DNS management pages for popular providers:
              </p>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="https://dash.cloudflare.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    Cloudflare DNS Dashboard
                  </a>
                </li>
                <li>
                  <a href="https://dcc.godaddy.com/manage/dns" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    GoDaddy DNS Management
                  </a>
                </li>
                <li>
                  <a href="https://ap.www.namecheap.com/domains/list/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    Namecheap Domain List
                  </a>
                </li>
                <li>
                  <a href="https://console.aws.amazon.com/route53" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 underline">
                    AWS Route 53
                  </a>
                </li>
              </ul>
            </div>

            {/* Need Help */}
            <div className="bg-white rounded-lg shadow-sm p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Need Help?</h2>
              <p className="text-gray-700">
                If you&apos;re experiencing issues setting up your custom domain, please contact our support team with:
              </p>
              <ul className="list-disc list-inside space-y-1 text-gray-700 mt-2 ml-4">
                <li>Your custom domain name</li>
                <li>Your DNS provider</li>
                <li>A screenshot of your DNS settings</li>
                <li>Any error messages you&apos;re seeing</li>
              </ul>
              <p className="text-gray-700 mt-4">
                Contact us at{' '}
                <a href="mailto:contact@hatchbeacon.com" className="text-blue-600 hover:text-blue-700 font-medium">
                  contact@hatchbeacon.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
