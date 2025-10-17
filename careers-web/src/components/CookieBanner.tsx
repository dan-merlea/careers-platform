'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface CookiePreferences {
  necessary: boolean;
  functional: boolean;
  analytics: boolean;
  marketing: boolean;
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState<CookiePreferences>({
    necessary: true, // Always true, can't be disabled
    functional: false,
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      // Show banner after a short delay for better UX
      setTimeout(() => setShowBanner(true), 1000);
    }
  }, []);

  const savePreferences = (prefs: CookiePreferences) => {
    const consentData = {
      ...prefs,
      timestamp: new Date().toISOString(),
      version: '1.0',
    };
    localStorage.setItem('cookie-consent', JSON.stringify(consentData));
    
    // Here you would typically initialize analytics/marketing scripts based on consent
    if (prefs.analytics) {
      // Initialize Google Analytics or other analytics
      console.log('Analytics enabled');
    }
    if (prefs.marketing) {
      // Initialize marketing/advertising scripts
      console.log('Marketing enabled');
    }
    
    setShowBanner(false);
  };

  const acceptAll = () => {
    savePreferences({
      necessary: true,
      functional: true,
      analytics: true,
      marketing: true,
    });
  };

  const acceptNecessary = () => {
    savePreferences({
      necessary: true,
      functional: false,
      analytics: false,
      marketing: false,
    });
  };

  const saveCustomPreferences = () => {
    savePreferences(preferences);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center p-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-4xl bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4">
          <div className="flex items-center space-x-3">
            <span className="text-3xl">🍪</span>
            <h2 className="text-xl font-bold text-white">Cookie Preferences</h2>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {!showDetails ? (
            // Simple view
            <div>
              <p className="text-gray-700 leading-relaxed mb-4">
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking &quot;Accept All&quot;, you consent to our use of cookies.
              </p>
              <p className="text-sm text-gray-600 mb-4">
                You can customize your preferences or learn more in our{' '}
                <Link href="/legal/cookies" className="text-purple-600 hover:text-purple-700 font-medium">
                  Cookie Policy
                </Link>
                {' '}and{' '}
                <Link href="/legal/privacy" className="text-purple-600 hover:text-purple-700 font-medium">
                  Privacy Policy
                </Link>.
              </p>
            </div>
          ) : (
            // Detailed view with granular controls
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed mb-4">
                We respect your privacy. Choose which cookies you want to allow:
              </p>

              {/* Necessary Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Necessary Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Essential for the website to function properly. These cannot be disabled.
                    </p>
                  </div>
                  <div className="ml-4">
                    <div className="w-12 h-6 bg-green-500 rounded-full flex items-center justify-end px-1 cursor-not-allowed">
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: Authentication, security, session management
                </p>
              </div>

              {/* Functional Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Functional Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Enable enhanced functionality and personalization.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, functional: !preferences.functional })}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.functional ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: Language preferences, region settings, customized content
                </p>
              </div>

              {/* Analytics Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Analytics Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Help us understand how visitors interact with our website.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, analytics: !preferences.analytics })}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.analytics ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: Google Analytics, page views, usage statistics
                </p>
              </div>

              {/* Marketing Cookies */}
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-1">Marketing Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Track your online activity to deliver more relevant advertising.
                    </p>
                  </div>
                  <div className="ml-4">
                    <button
                      onClick={() => setPreferences({ ...preferences, marketing: !preferences.marketing })}
                      className={`w-12 h-6 rounded-full flex items-center transition-colors ${
                        preferences.marketing ? 'bg-purple-600 justify-end' : 'bg-gray-300 justify-start'
                      } px-1`}
                    >
                      <div className="w-4 h-4 bg-white rounded-full"></div>
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Examples: Targeted advertising, social media integration, retargeting
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              {showDetails ? '← Back to Simple View' : 'Customize Preferences →'}
            </button>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              {showDetails ? (
                <>
                  <button
                    onClick={acceptNecessary}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Necessary Only
                  </button>
                  <button
                    onClick={saveCustomPreferences}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Save Preferences
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={acceptNecessary}
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Reject All
                  </button>
                  <button
                    onClick={acceptAll}
                    className="px-6 py-2.5 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    Accept All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
