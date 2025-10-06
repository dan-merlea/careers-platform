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
    <li className={`${!notification.read ? 'bg-blue-50/30' : ''} transition-colors`}>
      <Link 
        to={link} 
        className="block hover:bg-gray-50/50 transition-colors"
        onClick={handleClick}
      >
        <div className="px-6 py-4 flex items-start">
          <div className="flex-shrink-0 pt-0.5">
            <div className={`p-2 rounded-lg ${!notification.read ? 'bg-white shadow-sm' : 'bg-gray-50'}`}>
              {getIcon()}
            </div>
          </div>
          <div className="ml-4 w-0 flex-1">
            <div className="flex items-start justify-between">
              <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
              {!notification.read && (
                <span className="ml-2 flex-shrink-0 inline-block w-2 h-2 bg-blue-500 rounded-full"></span>
              )}
            </div>
            <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
            <p className="mt-2 text-xs text-gray-400">{timeAgo}</p>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default NotificationItem;
