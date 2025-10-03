import React, { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ImpersonationBanner from '../notifications/ImpersonationBanner';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Function to check if the screen is mobile/tablet size
  const checkIsMobile = () => {
    setIsMobile(window.innerWidth < 1024); // 1024px is typically lg breakpoint in Tailwind
  };

  // Set up event listener for window resize
  useEffect(() => {
    // Check initial screen size
    checkIsMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkIsMobile);
    
    // Clean up event listener
    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  // Toggle sidebar
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // Close sidebar
  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-[#EAF2FA] via-[#D2E4F4] to-[#F2ECFA]">
      {/* Toast Container */}
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
      
      {/* Overlay for mobile when sidebar is open */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={closeSidebar}
          aria-hidden="true"
        />
      )}

      {/* Sidebar - floating with padding */}
      <div className={isMobile ? '' : 'p-4'}>
        <Sidebar 
          isOpen={isMobile ? isSidebarOpen : true} 
          onClose={closeSidebar}
          isMobile={isMobile}
        />
      </div>
      
      {/* Main Content */}
      <div className={`flex-1 flex flex-col overflow-hidden ${isMobile ? 'w-full' : ''}`}>
        {/* Impersonation Banner */}
        <ImpersonationBanner />
        
        {/* Navbar */}
        <Navbar 
          onMenuClick={toggleSidebar}
          isMobile={isMobile}
        />
        
        {/* Page Content */}
        <main className="flex-1 overflow-y-auto px-6 pb-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
