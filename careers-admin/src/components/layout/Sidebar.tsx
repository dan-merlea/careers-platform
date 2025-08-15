import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  HomeIcon, 
  Cog6ToothIcon,
  UsersIcon,
  BriefcaseIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowLeftOnRectangleIcon
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
      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-blue-100 text-blue-700' 
          : 'text-gray-700 hover:bg-gray-100'
      }`}
    >
      <div className="w-6 h-6">{icon}</div>
      <span className="font-medium">{text}</span>
    </Link>
  );
};

const Sidebar: React.FC = () => {
  const [activePath, setActivePath] = useState(window.location.pathname);

  // Update active path when location changes
  React.useEffect(() => {
    const handleLocationChange = () => {
      setActivePath(window.location.pathname);
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const links = [
    { path: '/', text: 'Dashboard', icon: <HomeIcon /> },
    { path: '/setup', text: 'Setup', icon: <Cog6ToothIcon /> },
    { path: '/users', text: 'Users', icon: <UsersIcon /> },
    { path: '/jobs', text: 'Jobs', icon: <BriefcaseIcon /> },
    { path: '/analytics', text: 'Analytics', icon: <ChartBarIcon /> },
    { path: '/reports', text: 'Reports', icon: <DocumentTextIcon /> },
  ];

  return (
    <div className="w-64 h-full bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <h1 className="text-xl font-bold text-blue-600">Careers Admin</h1>
      </div>
      
      <div className="flex-1 py-4 flex flex-col gap-1 overflow-y-auto">
        {links.map((link) => (
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
        <button className="flex items-center gap-3 text-gray-700 hover:text-red-600 transition-colors w-full">
          <ArrowLeftOnRectangleIcon className="w-6 h-6" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
