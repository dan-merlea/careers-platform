import React, { useRef, useState, useEffect } from 'react';
import './TabNavigationStyles.css';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
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

  // Check if scrolling is available
  const checkForScrollShadows = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    // Check if scrolled from the left edge
    setShowLeftShadow(container.scrollLeft > 0);
    
    // Check if can scroll more to the right
    setShowRightShadow(
      container.scrollLeft < container.scrollWidth - container.clientWidth - 1
    );
  };

  // Check on mount and when tabs change
  useEffect(() => {
    checkForScrollShadows();
    // Add resize observer to check when container size changes
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
    <div className={`border-b border-gray-200 ${className} overflow-hidden relative`}>
      {/* Left shadow */}
      <div 
        className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none transition-opacity duration-200 ${showLeftShadow ? 'opacity-100' : 'opacity-0'}`} 
      />
      
      <div 
        ref={scrollContainerRef}
        className="overflow-x-auto hide-scrollbar"
        onScroll={checkForScrollShadows}
      >
        <nav className="flex space-x-8 min-w-max">
          {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap pt-4 pb-3 px-1 border-b-2 font-medium text-sm flex items-center`}
          >
            {tab.icon && <div className="mr-2">{tab.icon}</div>}
            {tab.label}
          </button>
        ))}
        </nav>
      </div>
      
      {/* Right shadow */}
      <div 
        className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none transition-opacity duration-200 ${showRightShadow ? 'opacity-100' : 'opacity-0'}`} 
      />
    </div>
  );
};

export default TabNavigation;
