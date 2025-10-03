import React, { useRef, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  href?: string; // Optional URL for link-based tabs
}

interface TabNavigationProps {
  tabs: TabItem[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
  tabs,
  activeTab,
  onTabChange,
  className = ''
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftShadow, setShowLeftShadow] = useState(false);
  const [showRightShadow, setShowRightShadow] = useState(false);

  const checkForScrollShadows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    setShowLeftShadow(container.scrollLeft > 0);
    setShowRightShadow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  useEffect(() => {
    checkForScrollShadows();
    const resizeObserver = new ResizeObserver(() => {
      checkForScrollShadows();
    });
    
    const currentRef = scrollContainerRef.current;
    if (currentRef) {
      resizeObserver.observe(currentRef);
    }
    
    return () => {
      if (currentRef) {
        resizeObserver.unobserve(currentRef);
      }
    };
  }, [tabs]);

  return (
    <div className={`relative ${className}`}>
      {/* Left shadow with arrow */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-12 bg-gradient-to-r from-slate-300/50 to-transparent z-10 pointer-events-none transition-opacity duration-200 flex items-center justify-start pl-1 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`} 
      >
        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
      </div>
      
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto"
        onScroll={checkForScrollShadows}
      >
        <div className="inline-flex bg-white/50 border border-white rounded-lg p-1 min-w-max">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            const tabClasses = `
              relative px-4 py-2 rounded-md text-sm font-medium transition-all duration-200
              flex items-center whitespace-nowrap
              ${isActive 
                ? 'bg-white text-gray-700 shadow-sm' 
                : 'text-gray-600 hover:text-gray-900'
              }
            `;
            
            // Render as link if href is provided, otherwise as button
            return tab.href ? (
              <Link
                key={tab.id}
                to={tab.href}
                onClick={() => onTabChange(tab.id)}
                className={tabClasses}
              >
                {tab.icon && <div className="mr-2">{tab.icon}</div>}
                {tab.label}
              </Link>
            ) : (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={tabClasses}
              >
                {tab.icon && <div className="mr-2">{tab.icon}</div>}
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Right shadow with arrow */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-slate-300/50 to-transparent z-10 pointer-events-none transition-opacity duration-200 flex items-center justify-end pr-1 ${showRightShadow ? 'opacity-100' : 'opacity-0'}`} 
      >
        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
      </div>
    </div>
  );
};

export default TabNavigation;
