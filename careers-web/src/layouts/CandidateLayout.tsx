'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface CompanyInfo {
  companyName: string;
  logo?: string;
  slogan?: string;
}

interface CandidateLayoutProps {
  children: React.ReactNode;
  companyId?: string;
}

export default function CandidateLayout({ children, companyId }: CandidateLayoutProps) {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      if (!companyId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/company/${companyId}`);
        if (response.ok) {
          const data = await response.json();
          setCompanyInfo(data);
        }
      } catch (error) {
        console.error('Failed to fetch company info:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCompanyInfo();
  }, [companyId]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Header with Company Branding */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col items-center justify-center space-y-4 pt-4">
            {isLoading ? (
              <div className="h-24 bg-gray-200 rounded-lg animate-pulse"></div>
            ) : companyInfo?.logo && (
              <div className="relative max-w-48 max-h-48">
                <Image
                  src={companyInfo.logo}
                  alt={companyInfo.companyName}
                  width={192}
                  height={192}
                  className="object-contain"
                  style={{ maxWidth: '192px', maxHeight: '192px', width: 'auto', height: 'auto' }}
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="flex flex-col items-center justify-center space-y-2 pt-4">
        {isLoading ? (
          <div className="space-y-2">
            <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-3 w-24 bg-gray-200 rounded animate-pulse"></div>
          </div>
        ) : (
          <>
            <h1 className="w-full text-center text-3xl font-bold text-[#022427]">
              {companyInfo?.companyName || 'Company'}
            </h1>
            {companyInfo?.slogan && (
              <p className="w-full text-center text-sm text-gray-500">{companyInfo.slogan}</p>
            )}
          </>
        )}
      </div>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer with Powered By */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <span>Powered by</span>
            <a href="https://hatchbeacon.com" className="flex items-center space-x-2">
              <Image
                src="/logo.svg"
                alt="Hatch Beacon"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="font-semibold text-[#022427]">
                Hatch Beacon
              </span>
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
