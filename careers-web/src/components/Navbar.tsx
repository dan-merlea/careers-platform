'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Image from 'next/image';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed top-6 left-0 right-0 z-50 px-6">
      <div className={`max-w-[1200px] mx-auto transition-all duration-300 rounded-2xl bg-black/50 backdrop-blur-xl border border-white/10 shadow-lg`}>
        <div className="px-6 flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#FF6363] via-[#A855F7] to-[#EC4899] flex items-center justify-center p-1">
                <Image 
                  src="/logo_white.svg" 
                  alt="Hatch Beacon Logo" 
                  width={32} 
                  height={32}
                  className="transition-opacity group-hover:opacity-80"
                />
              </div>
              <span className="text-lg font-semibold text-white group-hover:text-gray-300 transition-colors">
                Hatch Beacon
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-2">
            <Link 
              href="/" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/features') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/prices" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/prices') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/contact" 
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive('/contact') 
                  ? 'text-white' 
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              Contact
            </Link>
          </div>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center space-x-3">
            <Link 
              href="http://localhost:3000/admin/login" 
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200 transition-all"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {!isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="lg:hidden mt-2 max-w-[1200px] mx-auto rounded-2xl border border-white/10 bg-black/95 backdrop-blur-xl overflow-hidden">
          <div className="px-6 py-4 space-y-1">
            <Link 
              href="/" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive('/') 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Home
            </Link>
            <Link 
              href="/features" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive('/features') 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Features
            </Link>
            <Link 
              href="/prices" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive('/prices') 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Pricing
            </Link>
            <Link 
              href="/contact" 
              className={`block px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                isActive('/contact') 
                  ? 'bg-white/10 text-white' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Contact
            </Link>
            <div className="pt-4 space-y-2">
              <Link 
                href="http://localhost:3000/admin/login" 
                className="block px-4 py-3 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all text-center"
              >
                Login
              </Link>
              <Link 
                href="/signup" 
                className="block px-4 py-3 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200 transition-all text-center"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
