import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { departmentService } from '../../services/departmentService';
import { IS_DEVELOPMENT } from '../../config';
import { 
  HomeIcon, 
  Cog6ToothIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon,
  BugAntIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentListIcon,
  UserPlusIcon
} from '@heroicons/react/24/outline';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
  onClick?: () => void;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, text, isActive, onClick }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 rounded-lg transition-colors py-2 my-1 mx-3 px-2 ${
        isActive 
          ? 'bg-blue-100 text-blue-700 px-5' 
          : 'text-gray-700 hover:bg-sky-100 px-4'
      }`}
      onClick={onClick}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="font-medium text-sm">{text}</span>
    </Link>
  );
};

interface SidebarProps {
  isOpen: boolean;
  onClose?: () => void;
  isMobile: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, isMobile }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userDepartment, hasPermission } = useAuth();
  const { company } = useCompany();
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  
  // Current path is tracked by useLocation hook
  const activePath = location.pathname;
  
  // Check if approval workflow is set to headcount
  const isHeadcountApprovalWorkflow = company?.settings?.approvalType === 'headcount';
  
  // Fetch department name when userDepartment changes
  useEffect(() => {
    const fetchDepartmentName = async () => {
      console.log('userDepartment value:', userDepartment);
      if (userDepartment) {
        try {
          console.log('Fetching department with ID:', userDepartment);
          const department = await departmentService.getById(userDepartment);
          console.log('Department data received:', department);
          
          if (department && department.title) {
            setDepartmentName(department.title);
          } else {
            console.warn('Department found but title is missing:', department);
            setDepartmentName('Unknown Department');
          }
        } catch (error) {
          console.error('Error fetching department:', error);
          // Set a fallback name so the user sees something
          setDepartmentName('Department Unavailable');
        }
      } else {
        console.log('No department ID available');
        setDepartmentName(null);
      }
    };
    
    fetchDepartmentName();
  }, [userDepartment]);
  
  // Log when departmentName changes
  useEffect(() => {
    console.log('Department name updated:', departmentName);
  }, [departmentName]);

  const handleLogout = async () => {
    try {
      // Use the logout function from AuthContext
      await logout();
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Error during logout:', error);
      // Fallback: navigate to login anyway
      navigate('/login');
    }
  };

  // Define links with role requirements
  const allLinks = [
    { path: '/', text: 'Dashboard', icon: <HomeIcon />, roles: ['admin', 'manager', 'recruiter', 'user'] },
    { path: '/company-details', text: 'Company', icon: <BuildingOfficeIcon />, roles: ['admin'] },
    { path: '/users', text: 'Users', icon: <UsersIcon />, roles: ['admin'] },
    { path: '/job-boards', text: 'Job boards', icon: <BriefcaseIcon />, roles: ['admin', 'manager', 'recruiter'] },
    { path: '/jobs', text: 'Openings', icon: <BriefcaseIcon />, roles: ['admin', 'director', 'manager'] },
    { path: '/headcount', text: 'Headcount', icon: <UsersIcon />, roles: ['admin', 'director', 'manager'] },
    { path: '/interviews', text: 'Interviews', icon: <ClipboardDocumentCheckIcon />, roles: ['admin', 'director', 'recruiter', 'user'] },
    { path: '/referrals', text: 'Refer a Candidate', icon: <UserPlusIcon />, roles: ['admin', 'director', 'manager', 'recruiter', 'user'] },
    { path: '/analytics', text: 'Analytics', icon: <ChartBarIcon />, roles: ['admin', 'director', 'manager', 'recruiter'] },
    { path: '/logs', text: 'Activity Logs', icon: <ClipboardDocumentListIcon />, roles: ['admin'] },
    { path: '/setup', text: 'Integrations', icon: <Cog6ToothIcon />, roles: ['admin'] },
    // Debug menu item - only visible in development mode
    { path: '/debug', text: 'Debug', icon: <BugAntIcon />, roles: ['admin'], devOnly: true },
  ];

  // Filter links based on user role and approval workflow settings
  const visibleLinks = allLinks.filter(link => {
    // First check role permissions
    if (!hasPermission(link.roles)) return false;
    
    // If this is the Openings link and headcount approval workflow is active, hide it
    if (link.path === '/jobs' && isHeadcountApprovalWorkflow) return false;
    
    // If this is the Headcount link and job approval workflow is active, hide it
    if (link.path === '/headcount' && company?.settings?.approvalType === 'job-opening') return false;
    
    // Hide debug menu items in production
    if (link.devOnly && !IS_DEVELOPMENT) return false;
    
    return true;
  });

  // Determine sidebar classes based on mobile state and isOpen
  const sidebarClasses = isMobile 
    ? `fixed inset-y-0 left-0 z-40 bg-white flex flex-col w-full md:w-80 md:inset-y-4 md:left-4 md:rounded-3xl transform ${isOpen ? 'translate-x-0' : 'md:-translate-x-[400px] sm:-translate-x-full'} transition-transform duration-300 ease-in-out shadow-lg`
    : 'w-64 h-full bg-white/50 border border-white flex flex-col rounded-2xl shadow-lg';

  return (
    <div className={sidebarClasses}>
      <div className="p-6 flex justify-between items-center">
        <div className="flex items-center">
          <img src="/logo.svg" alt="Hatch Beacon Logo" className="h-8 w-8 mr-2" />
          <h1 className="text-lg font-bold" style={{ color: '#022427' }}>Hatch Beacon</h1>
        </div>
        
        {isMobile && (
          <button 
            onClick={onClose} 
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Close sidebar"
          >
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        )}
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {visibleLinks.map((link) => (
          <SidebarLink
            key={link.path}
            to={link.path}
            icon={link.icon}
            text={link.text}
            isActive={activePath === link.path}
            onClick={isMobile ? onClose : undefined}
          />
        ))}
      </div>
      
      <div className="p-6">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors w-full"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className="font-medium text-sm">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
