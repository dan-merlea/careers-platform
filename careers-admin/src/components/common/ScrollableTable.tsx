import React, { useState, useEffect } from 'react';

interface ScrollableTableProps {
  children: React.ReactNode; // Table content (thead and tbody)
  maxHeight?: string; // Optional max height, defaults to 70vh
  className?: string; // Optional additional classes
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ 
  children, 
  maxHeight = '70vh',
  className = ''
}) => {
  // Scroll gradient states
  const [showLeftGradient, setShowLeftGradient] = useState<boolean>(false);
  const [showRightGradient, setShowRightGradient] = useState<boolean>(true);
  
  // Scroll indicator states
  const [scrollPosition, setScrollPosition] = useState<number>(0);
  const [scrollWidth, setScrollWidth] = useState<number>(0);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Initialize scroll indicator dimensions when component mounts or data changes
  useEffect(() => {
    const tableContainer = document.getElementById('tableContainer');
    if (tableContainer) {
      setScrollWidth(tableContainer.scrollWidth);
      setContainerWidth(tableContainer.clientWidth);
      
      // Initialize gradient states based on initial scroll position
      setShowLeftGradient(tableContainer.scrollLeft > 5);
      setShowRightGradient(
        Math.abs(tableContainer.scrollWidth - tableContainer.scrollLeft - tableContainer.clientWidth) > 5
      );
    }
  }, [children]);

  // Handle table scroll to show/hide gradients and update scroll indicator
  const handleTableScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    
    // Check if scrolled to left edge
    const isAtLeft = target.scrollLeft < 5;
    setShowLeftGradient(!isAtLeft);
    
    // Check if scrolled to right edge
    const isAtRight = Math.abs(target.scrollWidth - target.scrollLeft - target.clientWidth) < 5;
    setShowRightGradient(!isAtRight);
    
    // Update scroll indicator position and dimensions
    setScrollPosition(target.scrollLeft);
    setScrollWidth(target.scrollWidth);
    setContainerWidth(target.clientWidth);
  };
  
  // Check if horizontal scrolling is needed
  const isScrollingNeeded = () => {
    return scrollWidth > containerWidth;
  };

  // Calculate scroll indicator width and position
  const getScrollIndicatorStyles = () => {
    if (!isScrollingNeeded()) {
      return { display: 'none' }; // Hide indicator if no horizontal scroll
    }
    
    // Calculate the width of the indicator as a percentage of the visible area
    const indicatorWidthPercent = (containerWidth / scrollWidth) * 100;
    
    // Calculate the position of the indicator as a percentage
    const maxScroll = scrollWidth - containerWidth;
    const scrollPercent = (scrollPosition / maxScroll) * (100 - indicatorWidthPercent);
    
    return {
      width: `${indicatorWidthPercent}%`,
      left: `${scrollPercent}%`
    };
  };

  return (
    <div className={`relative ${className}`}>
      {/* Custom scroll indicator - only shown when scrolling is needed */}
      {isScrollingNeeded() && (
        <div className="relative h-1 bg-gray-200 w-full mb-1 rounded">
          <div 
            className="absolute h-1 bg-blue-400 rounded-full" 
            style={getScrollIndicatorStyles()}
          ></div>
        </div>
      )}
      
      {/* Left gradient overlay - only shown when scrolling is needed and not at left edge */}
      {isScrollingNeeded() && showLeftGradient && (
        <div className="absolute top-0 bottom-0 left-0 w-12 bg-gradient-to-r from-gray-100 to-transparent pointer-events-none z-10"></div>
      )}
      {/* Right gradient overlay - only shown when scrolling is needed and not at right edge */}
      {isScrollingNeeded() && showRightGradient && (
        <div className="absolute top-0 bottom-0 right-0 w-12 bg-gradient-to-l from-gray-100 to-transparent pointer-events-none z-10"></div>
      )}
      <div 
        id="tableContainer"
        className={`bg-white ${isScrollingNeeded() ? 'shadow' : ''} rounded overflow-auto`}
        style={{ maxHeight }}
        onScroll={handleTableScroll}
      >
        <table className="min-w-full divide-y divide-gray-200">
          {children}
        </table>
      </div>
    </div>
  );
};

export default ScrollableTable;
