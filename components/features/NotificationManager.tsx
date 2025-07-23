import React, { useEffect } from 'react';
import { Platform } from 'react-native';

interface NotificationManagerProps {
  onPermissionGranted?: () => void;
  onPermissionDenied?: () => void;
  onNotificationReceived?: (notification: any) => void;
}

export function NotificationManager({ 
  onPermissionGranted, 
  onPermissionDenied,
  onNotificationReceived 
}: NotificationManagerProps = {}) {
  
  useEffect(() => {
    if (Platform.OS === 'web') {
      console.log('Notifications not supported on web platform');
      // For web, we can use browser notifications API
      if ('Notification' in window) {
        if (Notification.permission === 'granted') {
          onPermissionGranted?.();
        } else if (Notification.permission === 'denied') {
          onPermissionDenied?.();
        }
      }
      return;
    }

    // For native platforms, we would implement expo-notifications here
    // But since this is primarily a web app, we'll keep it simple
    console.log('Notification manager initialized for native platform');
    onPermissionGranted?.();
  }, [onPermissionGranted, onPermissionDenied]);

  return null;
}

// Export utility functions for use in other components
export const NotificationUtils = {
  async checkPermissions() {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        return Notification.permission;
      }
      return 'denied';
    }
    return 'granted'; // Simplified for web-first app
  },

  async requestPermissions() {
    if (Platform.OS === 'web') {
      if ('Notification' in window) {
        const permission = await Notification.requestPermission();
        return permission;
      }
      return 'denied';
    }
    return 'granted'; // Simplified for web-first app
  },

  async scheduleNotification(title: string, body: string, delay: number = 0) {
    if (Platform.OS === 'web') {
      if ('Notification' in window && Notification.permission === 'granted') {
        setTimeout(() => {
          new Notification(title, {
            body,
            icon: '/favicon.png',
            badge: '/favicon.png'
          });
        }, delay);
      }
      return;
    }
    
    // For native platforms, would use expo-notifications
    console.log('Scheduling notification:', title, body);
  },

  async getScheduledNotifications() {
    return [];
  },

  async cancelNotification(notificationId: string) {
    console.log('Notification cancelled:', notificationId);
  },
};

export default NotificationManager;