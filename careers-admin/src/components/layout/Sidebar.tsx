import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  const { logout, userRole, hasPermission } = useAuth();
  
  // Current path is tracked by useLocation hook
  const activePath = location.pathname;

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
    { path: '/setup', text: 'Setup', icon: <Cog6ToothIcon />, roles: ['admin'] },
    { path: '/company-details', text: 'Company Details', icon: <BuildingOfficeIcon />, roles: ['admin'] },
    { path: '/users', text: 'Users', icon: <UsersIcon />, roles: ['admin'] },
    { path: '/job-boards', text: 'Job boards', icon: <BriefcaseIcon />, roles: ['admin', 'manager', 'recruiter'] },
    { path: '/analytics', text: 'Analytics', icon: <ChartBarIcon />, roles: ['admin', 'manager'] },
    { path: '/reports', text: 'Reports', icon: <DocumentTextIcon />, roles: ['admin', 'manager', 'recruiter'] },
  ];

  // Filter links based on user role
  const visibleLinks = allLinks.filter(link => hasPermission(link.roles));

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Careers Admin</h1>
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
