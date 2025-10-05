import React, { useState, useEffect } from 'react';

export interface PaginationConfig {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

interface ScrollableTableProps {
  children: React.ReactNode; // Table content (thead and tbody)
  maxHeight?: string; // Optional max height, defaults to 70vh
  className?: string; // Optional additional classes
  pagination?: PaginationConfig; // Optional pagination configuration
}

const ScrollableTable: React.FC<ScrollableTableProps> = ({ 
  children, 
  maxHeight = '70vh',
  className = '',
  pagination
}) => {
  const totalPages = pagination ? Math.ceil(pagination.totalItems / pagination.pageSize) : 0;
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
        <div className="relative h-0.5 bg-gray-200 w-full rounded">
          <div 
            className="absolute h-0.5 bg-blue-400 rounded-full" 
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
        className={`bg-white ${pagination ? '' : 'rounded-b-xl'} overflow-y-auto overflow-x-visible ${isScrollingNeeded() ? 'shadow' : ''}`}
        style={{ maxHeight }}
      >
        <div
          id="tableContainer"
          className="overflow-x-auto overflow-y-visible"
          onScroll={handleTableScroll}
        >
          <table className="min-w-full divide-y divide-gray-200">
            {children}
          </table>
        </div>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{(pagination.currentPage - 1) * pagination.pageSize + 1}</span> to{' '}
                <span className="font-medium">
                  {Math.min(pagination.currentPage * pagination.pageSize, pagination.totalItems)}
                </span>{' '}
                of <span className="font-medium">{pagination.totalItems}</span> results
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  // Show pages around current page
                  let pageNum: number;
                  const maxPagesToShow = Math.min(5, totalPages);
                  
                  if (totalPages <= 5) {
                    // Show all pages if total is 5 or less
                    pageNum = i + 1;
                  } else if (pagination.currentPage <= 3) {
                    // Near the beginning, show first 5 pages
                    pageNum = i + 1;
                  } else if (pagination.currentPage >= totalPages - 2) {
                    // Near the end, show last 5 pages
                    pageNum = totalPages - (maxPagesToShow - 1) + i;
                  } else {
                    // In the middle, show current page centered
                    pageNum = pagination.currentPage - 2 + i;
                  }
                  
                  if (pageNum > 0 && pageNum <= totalPages) {
                    return (
                      <button
                        key={pageNum}
                        onClick={() => pagination.onPageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pagination.currentPage === pageNum
                            ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                            : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  }
                  return null;
                })}
                <button
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === totalPages}
                  className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
                    pagination.currentPage === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Next
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScrollableTable;
