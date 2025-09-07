import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCompany } from '../../context/CompanyContext';
import { departmentService } from '../../services/departmentService';
import { 
  HomeIcon, 
  Cog6ToothIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';

interface SidebarLinkProps {
  to: string;
  icon: React.ReactNode;
  text: string;
  isActive?: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon, text, isActive }) => {
  return (
    <Link 
      to={to} 
      className={`flex items-center gap-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700 px-5 py-3 m-2' 
          : 'text-gray-700 hover:bg-gray-100 px-4 py-3 m-2'
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { logout, userRole, userDepartment, hasPermission } = useAuth();
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
          setDepartmentName(department.title);
        } catch (error) {
          console.error('Error fetching department:', error);
        }
      } else {
        console.log('No department ID available');
        setDepartmentName(null);
      }
    };
    
    fetchDepartmentName();
  }, [userDepartment]);

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
    { path: '/analytics', text: 'Analytics', icon: <ChartBarIcon />, roles: ['admin', 'manager'] },
    { path: '/reports', text: 'Reports', icon: <DocumentTextIcon />, roles: ['admin', 'manager', 'recruiter'] },
    { path: '/setup', text: 'Integrations', icon: <Cog6ToothIcon />, roles: ['admin'] },
  ];

  // Filter links based on user role and approval workflow settings
  const visibleLinks = allLinks.filter(link => {
    // First check role permissions
    if (!hasPermission(link.roles)) return false;
    
    // If this is the Openings link and headcount approval workflow is active, hide it
    if (link.path === '/jobs' && isHeadcountApprovalWorkflow) return false;
    
    // If this is the Headcount link and job approval workflow is active, hide it
    if (link.path === '/headcount' && company?.settings?.approvalType === 'job-opening') return false;
    
    return true;
  });

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Careers Platform</h1>
        
        {departmentName && (
          <div className="mt-1 text-xs text-gray-500 font-medium">
            Department: {departmentName}
          </div>
        )}
        {userRole && (
          <div className="mt-1 text-xs text-gray-500 font-medium">
            Role: {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
          </div>
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
          />
        ))}
      </div>
      
      <div className="p-4 border-t border-gray-200">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors w-full"
        >
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
