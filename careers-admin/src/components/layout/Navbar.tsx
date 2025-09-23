import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { departmentService } from '../../services/departmentService';
import { 
  MagnifyingGlassIcon,
  UserCircleIcon,
  Bars3Icon
} from '@heroicons/react/24/outline';
import NotificationBell from '../notifications/NotificationBell';

interface NavbarProps {
  onMenuClick: () => void;
  isMobile: boolean;
}

const Navbar: React.FC<NavbarProps> = ({ onMenuClick, isMobile }) => {
  const { name, userRole, userDepartment } = useAuth();
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  
  // Fetch user name from email (simplified approach)
  useEffect(() => {
      setUserName(name);
  }, [name]);
  
  // Fetch department name when userDepartment changes
  useEffect(() => {
    const fetchDepartmentName = async () => {
      if (userDepartment) {
        try {
          const department = await departmentService.getById(userDepartment);
          setDepartmentName(department.title);
        } catch (error) {
          console.error('Error fetching department:', error);
          setDepartmentName(null);
        }
      } else {
        setDepartmentName(null);
      }
    };
    
    fetchDepartmentName();
  }, [userDepartment]);
  return (
    <nav className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4">
      <div className="flex items-center gap-4 flex-1">
        {isMobile && (
          <button 
            onClick={onMenuClick}
            className="p-2 rounded-full hover:bg-gray-100 mr-2"
            aria-label="Open menu"
          >
            <Bars3Icon className="w-6 h-6 text-gray-600" />
          </button>
        )}
        <div className="relative max-w-md w-full">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
          </div>
          <input
            type="search"
            className="block w-full p-2 pl-10 text-sm border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search..."
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <NotificationBell />
        
        <Link to="/profile" className="flex items-center gap-2 hover:bg-gray-100 p-2 rounded-lg">
          <UserCircleIcon className="w-8 h-8 text-gray-600" />
          <div className="hidden md:block">
            <div className="text-sm font-bold">{userName}</div>
            <div className="text-xs text-gray-500">
              {departmentName ? `Leading ${departmentName}` : userRole ? userRole.charAt(0).toUpperCase() + userRole.slice(1) : 'Not logged in'}
            </div>
          </div>
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
