import Link from 'next/link';
import DefaultLayout from '@/layouts/DefaultLayout';

interface DocItem {
  title: string;
  description: string;
  href: string;
  icon: string;
  category: string;
}

const docs: DocItem[] = [
  {
    title: 'Custom Domain Setup Guide',
    description: 'Learn how to configure your custom domain to point to your job board. Step-by-step instructions for DNS configuration and domain verification.',
    href: '/docs/custom-domain-setup',
    icon: '🌐',
    category: 'Configuration',
  },
  // Add more docs here as they are created
];

const categories = Array.from(new Set(docs.map(doc => doc.category)));

export default function DocsPage() {
  return (
    <DefaultLayout>
      <div className="min-h-screen bg-gray-50 pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1200px] mx-auto">
          {/* Header */}
          <div className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Documentation
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about setting up and managing your career platform
            </p>
          </div>

          {/* Documentation Grid by Category */}
          {categories.map((category) => (
            <div key={category} className="mb-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {category}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {docs
                  .filter(doc => doc.category === category)
                  .map((doc) => (
                    <Link
                      key={doc.href}
                      href={doc.href}
                      className="group bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 p-6 border border-gray-200 hover:border-purple-300"
                    >
                      <div className="flex items-start space-x-4">
                        <div className="text-4xl">{doc.icon}</div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-purple-600 transition-colors mb-2">
                            {doc.title}
                          </h3>
                          <p className="text-sm text-gray-600 line-clamp-3">
                            {doc.description}
                          </p>
                          <div className="mt-4 flex items-center text-purple-600 text-sm font-medium">
                            Read more
                            <svg
                              className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
              </div>
            </div>
          ))}

          {/* Help Section */}
          <div className="mt-16 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border border-purple-100">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Need More Help?
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                Can&apos;t find what you&apos;re looking for? Our support team is here to help you get the most out of your career platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="mailto:support@hatchbeacon.com"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-purple-600 hover:bg-purple-700 transition-colors"
                >
                  Contact Support
                </a>
                <Link
                  href="/"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DefaultLayout>
  );
}
