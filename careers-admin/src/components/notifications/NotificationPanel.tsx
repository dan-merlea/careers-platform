import React from 'react';
import { XMarkIcon, CheckIcon, BellIcon } from '@heroicons/react/24/outline';
import { useNotifications } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

interface NotificationPanelProps {
  onClose: () => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, unreadCount, loading, markAllAsRead } = useNotifications();

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  return (
    <div className="max-h-[80vh] flex flex-col bg-white/50 rounded-2xl shadow-lg shadow-gray-200/50 overflow-hidden">
      <div className="p-4 border-b border-gray-200/50 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-gray-500 mt-1">
              You have {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        <div className="flex space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              title="Mark all as read"
            >
              <CheckIcon className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            title="Close"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="overflow-y-auto flex-grow">
        {loading ? (
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <BellIcon className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">No notifications</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200/50">
            {notifications.map((notification) => (
              <NotificationItem 
                key={notification.id} 
                notification={notification} 
              />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
