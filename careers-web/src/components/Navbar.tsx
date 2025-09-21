'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path ? 'text-blue-600' : 'text-gray-700 hover:text-blue-500';
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="flex items-center">
                <Image src="/logo.svg" alt="Hatch Beacon Logo" width={32} height={32} className="mr-2" />
                <span className="text-xl font-bold" style={{ color: '#0D3C40' }}>Hatch Beacon</span>
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/' ? 'border-blue-500' : 'border-transparent'} ${isActive('/')}`}>
                Home
              </Link>
              <Link href="/features" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/features' ? 'border-blue-500' : 'border-transparent'} ${isActive('/features')}`}>
                Features
              </Link>
              <Link href="/prices" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/prices' ? 'border-blue-500' : 'border-transparent'} ${isActive('/prices')}`}>
                Pricing
              </Link>
              <Link href="/contact" className={`inline-flex items-center px-1 pt-1 border-b-2 ${pathname === '/contact' ? 'border-blue-500' : 'border-transparent'} ${isActive('/contact')}`}>
                Contact
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link href="http://localhost:3000/admin/login" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100">
              Login
            </Link>
            <Link href="http://localhost:3000/admin/login" className="px-3 py-2 rounded-md text-sm font-medium bg-blue-600 text-white hover:bg-blue-700">
              Sign Up
            </Link>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link href="/" className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`}>
              Home
            </Link>
            <Link href="/features" className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/features' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`}>
              Features
            </Link>
            <Link href="/prices" className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/prices' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`}>
              Pricing
            </Link>
            <Link href="/contact" className={`block pl-3 pr-4 py-2 border-l-4 ${pathname === '/contact' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'}`}>
              Contact
            </Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="space-y-1">
              <Link href="http://localhost:3000/admin/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800">
                Login
              </Link>
              <Link href="http://localhost:3000/admin/login" className="block pl-3 pr-4 py-2 border-l-4 border-transparent text-blue-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-800">
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
