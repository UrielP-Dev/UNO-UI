import { useEffect } from 'react';

const Notification = ({ notification, setNotification }) => {
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({
          ...prev,
          show: false
        }));
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [notification.show, setNotification]);

  if (!notification.show) return null;

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  }[notification.type];

  return (
    <div className={`fixed top-20 right-4 z-50 ${bgColor} text-white px-6 py-3 rounded-lg shadow-lg transform transition-all duration-500 ease-in-out ${
      notification.show ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
    }`}>
      <div className="flex items-center gap-2">
        {notification.type === 'success' && <span>✅</span>}
        {notification.type === 'error' && <span>❌</span>}
        {notification.type === 'warning' && <span>⚠️</span>}
        {notification.type === 'info' && <span>ℹ️</span>}
        <p className="font-medium">{notification.message}</p>
      </div>
    </div>
  );
};

export default Notification;