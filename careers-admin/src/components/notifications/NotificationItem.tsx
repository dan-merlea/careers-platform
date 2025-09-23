import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../../services/notificationService';
import { useNotifications } from '../../context/NotificationContext';
import { Link } from 'react-router-dom';
import { 
  UserPlusIcon, 
  CalendarIcon, 
  DocumentTextIcon,
  BellIcon
} from '@heroicons/react/24/outline';

interface NotificationItemProps {
  notification: Notification;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification }) => {
  const { markAsRead } = useNotifications();

  const handleClick = async () => {
    if (!notification.read) {
      await markAsRead(notification.id);
    }
  };

  // Get the appropriate icon based on notification type
  const getIcon = () => {
    switch (notification.type) {
      case 'job_application':
        return <UserPlusIcon className="h-6 w-6 text-blue-500" />;
      case 'interview_scheduled':
        return <CalendarIcon className="h-6 w-6 text-green-500" />;
      case 'interview_feedback':
        return <DocumentTextIcon className="h-6 w-6 text-purple-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-gray-500" />;
    }
  };

  // Generate the appropriate link based on notification type and data
  const getLink = () => {
    if (notification.type === 'job_application' && notification.data?.applicantId) {
      return `/applicants/${notification.data.applicantId}`;
    }
    return '#';
  };

  const link = getLink();
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true });

  return (
    <li className={`${!notification.read ? 'bg-blue-50' : ''}`}>
      <Link 
        to={link} 
        className="block hover:bg-gray-50"
        onClick={handleClick}
      >
        <div className="px-4 py-4 flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">{notification.title}</p>
            <p className="mt-1 text-sm text-gray-500">{notification.message}</p>
            <p className="mt-1 text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default NotificationItem;
