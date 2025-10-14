'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const highlightRef = useRef<HTMLDivElement>(null);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [activeCategory, setActiveCategory] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [categoryVisible, setCategoryVisible] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleCategoryChange = (index: number) => {
    if (index === activeCategory || isTransitioning) return;
    
    setIsTransitioning(true);
    
    // Wait for exit animation to complete
    setTimeout(() => {
      setActiveCategory(index);
      setIsTransitioning(false);
    }, 400); // Match the CSS transition duration
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    const cards = highlightRef.current?.querySelectorAll('.highlight-card');
    cards?.forEach((card) => observer.observe(card));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !categoryVisible) {
            setCategoryVisible(true);
          }
        });
      },
      { threshold: 0.2 }
    );

    if (categoryRef.current) {
      observer.observe(categoryRef.current);
    }

    return () => observer.disconnect();
  }, [categoryVisible]);

  const categories = [
    { name: "Job Search" },
    { name: "Applications" },
    { name: "Interviews" },
    { name: "Career Growth" }
  ];

  const categoryContent = [
    [
      {
        title: "Smart Job Matching",
        description: "AI-powered algorithms that connect you with the perfect opportunities",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(25, 55, 105, 0.5), rgba(8, 10, 20, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(7, 13, 79, 0.1) 0px 0px 20px 3px, rgba(85, 0, 98, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop"
      },
      {
        title: "Advanced Filters",
        description: "Refine your search with powerful filtering options and saved preferences",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 25, 55, 0.5), rgba(20, 8, 10, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 7, 13, 0.1) 0px 0px 20px 3px, rgba(98, 0, 85, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600&h=400&fit=crop"
      },
      {
        title: "Salary Insights",
        description: "Get real-time salary data and compensation trends for informed decisions",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(55, 105, 25, 0.5), rgba(10, 20, 8, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(13, 79, 7, 0.1) 0px 0px 20px 3px, rgba(0, 98, 85, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&h=400&fit=crop"
      }
    ],
    [
      {
        title: "One-Click Apply",
        description: "Apply to multiple positions instantly with your pre-filled profile",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 55, 25, 0.5), rgba(20, 10, 8, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 13, 7, 0.1) 0px 0px 20px 3px, rgba(98, 85, 0, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=600&h=400&fit=crop"
      },
      {
        title: "Application Tracking",
        description: "Monitor all your applications in one centralized dashboard",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(25, 105, 105, 0.5), rgba(8, 20, 20, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(7, 79, 79, 0.1) 0px 0px 20px 3px, rgba(0, 85, 98, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
      },
      {
        title: "Status Updates",
        description: "Receive real-time notifications about your application progress",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 25, 105, 0.5), rgba(20, 8, 20, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 7, 79, 0.1) 0px 0px 20px 3px, rgba(98, 0, 98, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&h=400&fit=crop"
      }
    ],
    [
      {
        title: "Interview Prep",
        description: "Access comprehensive guides and practice questions for success",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(55, 25, 105, 0.5), rgba(10, 8, 20, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(13, 7, 79, 0.1) 0px 0px 20px 3px, rgba(85, 0, 98, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=400&fit=crop"
      },
      {
        title: "Mock Interviews",
        description: "Practice with AI-powered mock interviews and get instant feedback",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 105, 25, 0.5), rgba(20, 20, 8, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 79, 7, 0.1) 0px 0px 20px 3px, rgba(98, 98, 0, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1560439514-4e9645039924?w=600&h=400&fit=crop"
      },
      {
        title: "Scheduling Tools",
        description: "Seamlessly coordinate interview times with integrated calendar sync",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(25, 55, 105, 0.5), rgba(8, 10, 20, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(7, 13, 79, 0.1) 0px 0px 20px 3px, rgba(0, 85, 98, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=600&h=400&fit=crop"
      }
    ],
    [
      {
        title: "Skill Development",
        description: "Upskill with curated courses and certifications for career growth",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 25, 55, 0.5), rgba(20, 8, 10, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 7, 13, 0.1) 0px 0px 20px 3px, rgba(98, 0, 85, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&h=400&fit=crop"
      },
      {
        title: "Mentorship",
        description: "Connect with experienced professionals for guidance and advice",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(55, 105, 25, 0.5), rgba(10, 20, 8, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(13, 79, 7, 0.1) 0px 0px 20px 3px, rgba(0, 98, 85, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=600&h=400&fit=crop"
      },
      {
        title: "Career Analytics",
        description: "Track your career progress with detailed insights and metrics",
        icon: <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>,
        gradient: "radial-gradient(94.21% 78.4% at 50% 29.91%, rgba(105, 55, 25, 0.5), rgba(20, 10, 8, 0.42))",
        shadow: "rgba(255, 255, 255, 0.1) 0px 1px 0px 0px inset, rgba(79, 13, 7, 0.1) 0px 0px 20px 3px, rgba(98, 85, 0, 0.1) 0px 0px 40px 20px, rgba(255, 255, 255, 0.06) 0px 0px 0px 1px inset",
        image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&h=400&fit=crop"
      }
    ]
  ];

  return (
    <div className="flex flex-col min-h-screen bg-black pt-24">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-purple-900/20 via-black to-black"></div>
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-600/20 via-black to-black"></div>
        
        <div className="relative max-w-[1200px] mx-auto px-6 py-24 sm:py-32 lg:py-40">
          <div className="text-center">
            {/* Badge */}
            <div className="hero-announcement inline-flex items-center space-x-2 px-4 py-2 rounded-full backdrop-blur-sm mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
              </span>
              <span className="text-sm text-gray-300">Your shortcut to career success</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
              <span className="block text-white mb-2">Find Your Dream</span>
              <span className="block gradient-text">Career Today</span>
            </h1>

            {/* Subheadline */}
            <p className="mt-6 text-xl sm:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
              Connect with top employers and discover opportunities that match your skills. 
              <span className="text-white"> It&apos;s not about finding a job.</span> It&apos;s about building your future.
            </p>

            {/* CTA Buttons */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/signup" 
                className="group relative px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105 w-full sm:w-auto"
              >
                Get Started
                <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Link>
              <Link 
                href="/features" 
                className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm w-full sm:w-auto"
              >
                Learn More
              </Link>
            </div>

            {/* Stats */}
            <div className="mt-20 grid grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">10k+</div>
                <div className="text-sm text-gray-500 mt-1">Active Jobs</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">500+</div>
                <div className="text-sm text-gray-500 mt-1">Companies</div>
              </div>
              <div>
                <div className="text-3xl sm:text-4xl font-bold gradient-text">50k+</div>
                <div className="text-sm text-gray-500 mt-1">Candidates</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Extension Highlight Section */}
      <section ref={highlightRef} className="relative py-24 sm:py-32 overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              There&apos;s a solution for that
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Powerful features designed to accelerate your career journey.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Highlight Card 1 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-purple-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#FF6363] to-[#A855F7] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Smart Matching</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                AI-powered algorithms match you with opportunities that align perfectly with your skills and aspirations.
              </p>
            </div>

            {/* Highlight Card 2 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-pink-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Instant Apply</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Apply to multiple positions in seconds with your saved profile and one-click applications.
              </p>
            </div>

            {/* Highlight Card 3 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-blue-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#EC4899] to-[#3B82F6] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Track Progress</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Monitor your applications, interviews, and career growth all in one intuitive dashboard.
              </p>
            </div>

            {/* Highlight Card 4 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-green-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#3B82F6] to-[#10B981] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Career Resources</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Access expert guides, interview tips, and resume templates to boost your success rate.
              </p>
            </div>

            {/* Highlight Card 5 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-yellow-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#10B981] to-[#F59E0B] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Real-time Alerts</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Get instant notifications when new opportunities matching your profile become available.
              </p>
            </div>

            {/* Highlight Card 6 */}
            <div className="highlight-card bg-gradient-to-br from-white/5 to-white/[0.02] backdrop-blur-sm rounded-3xl p-8 border border-white/10 hover:border-red-500/50 transition-all duration-500">
              <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-[#F59E0B] to-[#EF4444] flex items-center justify-center mb-6 shadow-lg">
                <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Network Building</h3>
              <p className="text-gray-400 leading-relaxed text-lg">
                Connect with industry professionals and expand your network through our platform.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Category Features Section */}
      <section ref={categoryRef} className="relative py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          {/* Header with Title and Categories */}
          <div className="flex flex-col justify-between items-start lg:items-center mb-16 gap-8">
            <div className="flex flex-row justify-between items-center gap-8">
              <svg xmlns="http://www.w3.org/2000/svg" width="272" height="2" viewBox="0 0 272 2" fill="none"><path d="M272 1L0.5 0.999976" stroke="url(#paint0_linear_955_23505)"></path><defs><linearGradient id="paint0_linear_955_23505" x1="272.5" y1="1.49831" x2="0.500004" y2="0.998287" gradientUnits="userSpaceOnUse"><stop stop-color="#ECA5A7"></stop><stop offset="0.165137" stop-color="#581D27"></stop><stop offset="1" stop-color="#190E14"></stop></linearGradient></defs></svg>
              <span>Explore by Category</span>
              <svg xmlns="http://www.w3.org/2000/svg" width="272" height="2" viewBox="0 0 272 2" fill="none"><path d="M0 1L271.5 1" stroke="url(#paint0_linear_1193_9154)"></path><defs><linearGradient id="paint0_linear_1193_9154" x1="-0.500003" y1="0.501689" x2="271.5" y2="1.00169" gradientUnits="userSpaceOnUse"><stop stop-color="#ECA5A7"></stop><stop offset="0.165137" stop-color="#581D27"></stop><stop offset="1" stop-color="#190E14"></stop></linearGradient></defs></svg>
            </div>
            
            {/* Category Navigation */}
            <div className="relative flex gap-2 p-0.5 bg-white/5 rounded-full border border-white/10 backdrop-blur-sm w-full lg:w-8/12 xl:w-6/12">
              {/* Animated Background */}
              
              <div 
                className="category-slider-bg absolute h-[calc(100%-4px)] rounded-full transition-all duration-300 ease-out"
                style={{
                  transform: `translateX(calc(${activeCategory * 100}% + ${activeCategory * 2}px))`,
                  width: `calc(${100 / categories.length}% - 3px)`,
                  background: 'radial-gradient(circle at 50% 0%, rgba(88, 160, 228, 0.3), transparent 70%)',
                  boxShadow: '0 0 20px rgba(88, 160, 228, 0.3)'
                }}
              />
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => handleCategoryChange(index)}
                  className={`relative z-10 flex-1 px-6 py-3 rounded-full text-sm font-medium transition-colors duration-300 ${
                    activeCategory === index ? 'text-white' : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {categoryContent[activeCategory].map((card, index) => (
              <div
                key={`${activeCategory}-${index}`}
                className={`category-card group rounded-2xl overflow-hidden transition-all duration-400 hover:scale-[1.02] ${
                  !isMounted ? 'category-card-hidden' : (isTransitioning ? 'category-card-exit' : (categoryVisible ? 'category-card-enter' : 'category-card-hidden'))
                }`}
                style={{
                  background: card.gradient,
                  boxShadow: card.shadow,
                  transitionDelay: `${index * 50}ms`
                }}
              >
                {/* Card Header */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-4">
                      <div className="text-white">{card.icon}</div>
                      <h3 className="text-xl font-bold text-white">{card.title}</h3>
                    </div>
                    <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/20 transition-all group-hover:translate-x-1">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed">{card.description}</p>
                </div>

                {/* Divider */}
                <div className="mx-6 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>

                {/* Card Image */}
                <div className="p-6">
                  <div className="overflow-hidden aspect-video relative rounded-xl">
                    <Image 
                      src={card.image} 
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-24 sm:py-32">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-4">
              There&apos;s a feature for that
            </h2>
            <p className="text-xl text-gray-400 max-w-2xl mx-auto">
              Everything you need to advance your career, all in one place.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Feature 1 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF6363] to-[#A855F7] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Smart Job Matching</h3>
              <p className="text-gray-400 leading-relaxed">
                AI-powered matching connects you with opportunities that perfectly align with your skills and career goals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#EC4899] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Professional Network</h3>
              <p className="text-gray-400 leading-relaxed">
                Build meaningful connections with industry leaders and expand your professional circle effortlessly.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-red-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#FF6363] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Resume Builder</h3>
              <p className="text-gray-400 leading-relaxed">
                Create stunning, ATS-optimized resumes that make you stand out from the competition.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-orange-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#FF6363] to-[#FF6B35] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Interview Scheduler</h3>
              <p className="text-gray-400 leading-relaxed">
                Seamlessly schedule and manage interviews with integrated calendar and video conferencing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-purple-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#A855F7] to-[#FF6363] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Career Analytics</h3>
              <p className="text-gray-400 leading-relaxed">
                Track your application progress and get insights to improve your job search strategy.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="group card-hover bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:border-pink-500/50">
              <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-[#EC4899] to-[#A855F7] flex items-center justify-center mb-6">
                <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Instant Notifications</h3>
              <p className="text-gray-400 leading-relaxed">
                Get real-time updates on new opportunities, application status, and interview invitations.
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link 
              href="/features" 
              className="inline-flex items-center px-8 py-4 bg-white/5 text-white rounded-xl font-semibold hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm group"
            >
              Explore All Features
              <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 sm:py-32">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-900/10 to-black"></div>
        
        <div className="relative max-w-4xl mx-auto px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#FF6363] via-[#A855F7] to-[#EC4899] rounded-3xl p-1">
            <div className="bg-black rounded-3xl p-12 sm:p-16">
              <div className="text-center">
                <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
                  Ready to accelerate your career?
                </h2>
                <p className="text-xl text-gray-300 mb-10 max-w-2xl mx-auto">
                  Join thousands of professionals who have transformed their careers with Hatch Beacon.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link 
                    href="/signup" 
                    className="group px-8 py-4 bg-white text-black rounded-xl font-semibold text-lg hover:bg-gray-100 transition-all shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    Get Started Free
                    <span className="ml-2 inline-block transition-transform group-hover:translate-x-1">→</span>
                  </Link>
                  <Link 
                    href="/contact" 
                    className="px-8 py-4 bg-white/5 text-white rounded-xl font-semibold text-lg hover:bg-white/10 transition-all border border-white/10 backdrop-blur-sm"
                  >
                    Contact Sales
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
