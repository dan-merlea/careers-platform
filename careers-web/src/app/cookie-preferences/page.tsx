'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
  timestamp?: string;
  version?: string;
}

export default function CookiePreferencesPage() {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true,
    functional: false,
    analytics: false,
    marketing: false,
  });
  const [saved, setSaved] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    // Load existing preferences
    const consent = localStorage.getItem('cookie-consent');
    if (consent) {
      try {
        const data = JSON.parse(consent);
        setPreferences({
          necessary: true, // Always true
          functional: data.functional || false,
          analytics: data.analytics || false,
          marketing: data.marketing || false,
        });
        setLastUpdated(data.timestamp);
      } catch (e) {
        console.error('Failed to parse cookie consent', e);
      }
    }
  }, []);

  const savePreferences = () => {
    const consentData = {
      ...preferences,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    setLastUpdated(consentData.timestamp);
    
    // Show success message
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Reload page to apply changes
    setTimeout(() => window.location.reload(), 1000);
  };

  const acceptAll = () => {
    setPreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const rejectAll = () => {
    setPreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
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
            <div className="flex items-center space-x-3 mb-4">
              <span className="text-4xl">🍪</span>
              <h1 className="text-4xl font-bold text-gray-900">Cookie Preferences</h1>
            </div>
            <p className="text-gray-600">
              Manage your cookie preferences and control how we use cookies on our website.
            </p>
            {lastUpdated && (
              <p className="text-sm text-gray-500 mt-2">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </p>
            )}
          </div>

          {/* Success Message */}
          {saved && (
            <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-800 font-medium">Your preferences have been saved!</span>
            </div>
          )}

          {/* Content */}
          <div className="bg-white rounded-xl shadow-sm p-8 space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>About Cookies:</strong> Cookies are small text files stored on your device that help us provide and improve our services. 
                You can control which types of cookies you allow below. Learn more in our{' '}
                <Link href="/legal/cookies" className="text-blue-600 hover:text-blue-700 font-medium underline">
                  Cookie Policy
                </Link>.
              </p>
            </div>

            {/* Necessary Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">Necessary Cookies</h3>
                    <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">Always Active</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">
                    These cookies are essential for the website to function properly. They enable core functionality such as security, 
                    network management, and accessibility. Without these cookies, services you have requested cannot be provided.
                  </p>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      View details
                    </summary>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Authentication and session management</li>
                      <li>Security and fraud prevention</li>
                      <li>Load balancing and performance</li>
                      <li>User interface preferences</li>
                    </ul>
                  </details>
                </div>
                <div className="ml-4">
                  <div className="w-14 h-7 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                    <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Functional Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Functional Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings. 
                    They may be set by us or by third-party providers.
                  </p>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      View details
                    </summary>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Language and region preferences</li>
                      <li>Customized content and features</li>
                      <li>User interface customization</li>
                      <li>Accessibility features</li>
                    </ul>
                  </details>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}
                    className={`w-14 h-7 rounded-full flex items-center transition-colors ${
                      preferences.functional ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                    aria-label="Toggle functional cookies"
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. 
                    This helps us improve our services and user experience.
                  </p>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      View details
                    </summary>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Google Analytics (page views, user behavior)</li>
                      <li>Performance monitoring and optimization</li>
                      <li>Error tracking and debugging</li>
                      <li>Usage statistics and feature adoption</li>
                    </ul>
                  </details>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                    className={`w-14 h-7 rounded-full flex items-center transition-colors ${
                      preferences.analytics ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                    aria-label="Toggle analytics cookies"
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Marketing Cookies */}
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Marketing Cookies</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    These cookies track your online activity to help us deliver more relevant advertising or to limit how many times you see an advertisement. 
                    We may share this information with other organizations, such as advertisers.
                  </p>
                  <details className="text-sm text-gray-600">
                    <summary className="cursor-pointer font-medium text-gray-700 hover:text-gray-900">
                      View details
                    </summary>
                    <ul className="list-disc pl-5 mt-2 space-y-1">
                      <li>Targeted advertising and personalization</li>
                      <li>Social media integration and sharing</li>
                      <li>Retargeting and remarketing campaigns</li>
                      <li>Conversion tracking and attribution</li>
                    </ul>
                  </details>
                </div>
                <div className="ml-4">
                  <button
                    onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                    className={`w-14 h-7 rounded-full flex items-center transition-colors ${
                      preferences.marketing ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                    } px-1`}
                    aria-label="Toggle marketing cookies"
                  >
                    <div className="w-5 h-5 bg-white rounded-full shadow"></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-gray-200">
              <button
                onClick={rejectAll}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reject All
              </button>
              <button
                onClick={acceptAll}
                className="flex-1 px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Accept All
              </button>
              <button
                onClick={savePreferences}
                className="flex-1 px-6 py-3 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
              >
                Save My Preferences
              </button>
            </div>
          </div>

          {/* Additional Information */}
          <div className="mt-8 bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">More Information</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Managing Cookies:</strong> You can also manage cookies through your browser settings. 
                However, please note that disabling cookies may affect the functionality of our website.
              </p>
              <p>
                <strong>Questions?</strong> If you have questions about our use of cookies, please review our{' '}
                <Link href="/legal/cookies" className="text-purple-600 hover:text-purple-700 font-medium">
                  Cookie Policy
                </Link>
                {' '}or{' '}
                <Link href="/contact" className="text-purple-600 hover:text-purple-700 font-medium">
                  contact us
                </Link>.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
