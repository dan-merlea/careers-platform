'use client';

import { useEffect, useState } from 'react';
import MacWindow from './MacWindow';
import CategorySlider, { SliderItem } from './CategorySlider';

type Screenshot = {
  id: string;
  title: string;
  description: string;
  image: string;
};

const screenshots: Screenshot[] = [
  {
    id: 'dashboard',
    title: 'Intuitive Dashboard',
    description: 'Get a complete overview of your hiring pipeline with real-time analytics and insights.',
    image: '/screenshots/dashboard.png',
  },
  {
    id: 'candidates',
    title: 'Candidate Management',
    description: 'Efficiently manage and track all your candidates in one centralized platform.',
    image: '/screenshots/candidates.png',
  },
  {
    id: 'jobs',
    title: 'Job Postings',
    description: 'Create and publish job postings across multiple platforms with a single click.',
    image: '/screenshots/jobs.png',
  },
  {
    id: 'analytics',
    title: 'Advanced Analytics',
    description: 'Make data-driven decisions with comprehensive hiring analytics and reports.',
    image: '/screenshots/analytics.png',
  },
  {
    id: 'collaboration',
    title: 'Team Collaboration',
    description: 'Collaborate seamlessly with your team throughout the hiring process.',
    image: '/screenshots/collaboration.png',
  },
];

const navItems: SliderItem[] = [
  {
    id: 'dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    label: 'Dashboard',
  },
  {
    id: 'candidates',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
    label: 'Candidates',
  },
  {
    id: 'jobs',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    label: 'Jobs',
  },
  {
    id: 'analytics',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Analytics',
  },
  {
    id: 'collaboration',
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'Collaboration',
  },
];

export default function PlatformShowcase() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [lastInteraction, setLastInteraction] = useState(Date.now());

  const transitionToSlide = (index: number) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveIndex(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 200);
    }, 200);
  };

  // Auto-advance slideshow every 8 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      transitionToSlide((activeIndex + 1) % screenshots.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [lastInteraction, activeIndex]);

  const handleNavClick = (index: number) => {
    if (index === activeIndex || isTransitioning) return;
    
    setLastInteraction(Date.now()); // Reset timer
    transitionToSlide(index);
  };

  const currentScreenshot = screenshots[activeIndex];

  return (
    <section className="relative py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
            See It In <span className="gradient-text">Action</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Explore our platform&apos;s powerful features designed to streamline your hiring process
          </p>
        </div>

        {/* Mac Window with Slideshow */}
        <MacWindow>
          <div className="relative aspect-[16/10] bg-white overflow-hidden">
            {/* Screenshot with transition */}
            <div
              className={`absolute inset-0 transition-opacity duration-500 ${
                isTransitioning ? 'opacity-0' : 'opacity-100'
              }`}
            >
              {/* Placeholder for screenshot - replace with actual images */}
              <div className="w-full h-full bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="w-24 h-24 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                    {navItems[activeIndex].icon && (
                      <div className="text-white scale-150">
                        {navItems[activeIndex].icon}
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400">Screenshot placeholder</p>
                  <p className="text-xs text-gray-300 mt-2">Add your screenshots to /public/screenshots/</p>
                </div>
              </div>
            </div>

            {/* Overlay with title and description */}
            <div
              className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/60 to-transparent p-8 transition-all duration-400 ${
                isTransitioning ? 'opacity-0 translate-y-8' : 'opacity-100 translate-y-0'
              }`}
            >
              <h3 className="text-2xl font-bold text-white mb-2 transition-all duration-400">
                {currentScreenshot.title}
              </h3>
              <p className="text-gray-200 text-lg max-w-2xl transition-all duration-400">
                {currentScreenshot.description}
              </p>
            </div>

            {/* Progress indicator */}
            <div className="absolute top-4 right-4 flex space-x-2">
              {screenshots.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleNavClick(index)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    index === activeIndex
                      ? 'w-8 bg-white'
                      : 'w-1.5 bg-white/40 hover:bg-white/60'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </MacWindow>

        {/* Navigation */}
        <div className="mt-4 flex justify-center">
          <CategorySlider
            items={navItems}
            activeIndex={activeIndex}
            onItemClick={handleNavClick}
            itemClassName="min-w-[60px]"
          />
        </div>
      </div>
    </section>
  );
}
