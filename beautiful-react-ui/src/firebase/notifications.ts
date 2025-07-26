// @ts-ignore
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  where,
  Timestamp,
  onSnapshot,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './config';
import { TechEvent } from './techEvents';

export interface Notification {
  id?: string;
  title: string;
  message: string;
  type: 'tech-event' | 'announcement' | 'system' | 'reminder';
  eventId?: string; // Reference to tech event if applicable
  userId?: string; // If targeted to specific user, otherwise null for all users
  isRead: boolean;
  createdAt: Date;
  priority: 'low' | 'medium' | 'high';
  actionUrl?: string; // URL to navigate when notification is clicked
  metadata?: {
    eventType?: string;
    eventDate?: Date;
    venue?: string;
    registrationLink?: string;
  };
}

const NOTIFICATIONS_COLLECTION = 'notifications';

// Create a notification for all users
export const createNotificationForAllUsers = async (
  title: string,
  message: string,
  type: Notification['type'],
  priority: Notification['priority'] = 'medium',
  metadata?: Notification['metadata'],
  actionUrl?: string
): Promise<string> => {
  try {
    const notificationData = {
      title,
      message,
      type,
      userId: null, // null means for all users
      isRead: false,
      createdAt: Timestamp.fromDate(new Date()),
      priority,
      actionUrl: actionUrl || '',
      metadata: metadata || {}
    };

    const docRef = await addDoc(collection(db, NOTIFICATIONS_COLLECTION), notificationData);
    console.log('✅ Notification created for all users:', docRef.id);
    return docRef.id;
  } catch (error) {
    console.error('❌ Error creating notification:', error);
    throw error;
  }
};

// Create notification for tech event
export const createTechEventNotification = async (techEvent: TechEvent): Promise<string> => {
  const title = `New ${techEvent.type.charAt(0).toUpperCase() + techEvent.type.slice(1)}: ${techEvent.title}`;
  const message = `📅 ${techEvent.date.toLocaleDateString()} at ${techEvent.venue}, ${techEvent.place}. ${techEvent.details.substring(0, 100)}...`;
  
  const metadata: Notification['metadata'] = {
    eventType: techEvent.type,
    eventDate: techEvent.date,
    venue: `${techEvent.venue}, ${techEvent.place}`,
    registrationLink: techEvent.registrationLink
  };

  return await createNotificationForAllUsers(
    title,
    message,
    'tech-event',
    techEvent.priority,
    metadata,
    `/tech-updates/${techEvent.id}`
  );
};

// Get notifications for a specific user (or all users if userId is null)
export const getNotificationsForUser = async (userId?: string): Promise<Notification[]> => {
  try {
    let q;
    if (userId) {
      // Get notifications for specific user OR notifications for all users
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', 'in', [userId, null]),
        orderBy('createdAt', 'desc')
      );
    } else {
      // Get all notifications for all users
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', null),
        orderBy('createdAt', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        metadata: {
          ...data.metadata,
          eventDate: data.metadata?.eventDate?.toDate() || null
        }
      } as Notification;
    });
  } catch (error) {
    console.error('❌ Error fetching notifications:', error);
    throw error;
  }
};

// Subscribe to notifications for real-time updates
export const subscribeToNotifications = (
  userId: string | null,
  callback: (notifications: Notification[]) => void
) => {
  try {
    if (!userId) {
      console.warn('⚠️ No userId provided for notification subscription');
      callback([]);
      return () => {}; // Return empty unsubscribe function
    }

    // Create two separate queries to avoid Firebase 'in' operator issues with null
    const userSpecificQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );

    const globalQuery = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where('userId', '==', null),
      orderBy('createdAt', 'desc')
    );

    let userNotifications: Notification[] = [];
    let globalNotifications: Notification[] = [];
    let unsubscribeUser: (() => void) | null = null;
    let unsubscribeGlobal: (() => void) | null = null;

    const combineAndCallback = () => {
      const allNotifications = [...userNotifications, ...globalNotifications]
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      callback(allNotifications);
    };

    // Subscribe to user-specific notifications
    unsubscribeUser = onSnapshot(userSpecificQuery, (querySnapshot) => {
      try {
        userNotifications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: {
              ...data.metadata,
              eventDate: data.metadata?.eventDate?.toDate() || null
            }
          } as Notification;
        });
        combineAndCallback();
      } catch (error) {
        console.error('❌ Error processing user notifications:', error);
      }
    }, (error) => {
      console.error('❌ Error in user notifications subscription:', error);
    });

    // Subscribe to global notifications
    unsubscribeGlobal = onSnapshot(globalQuery, (querySnapshot) => {
      try {
        globalNotifications = querySnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            metadata: {
              ...data.metadata,
              eventDate: data.metadata?.eventDate?.toDate() || null
            }
          } as Notification;
        });
        combineAndCallback();
      } catch (error) {
        console.error('❌ Error processing global notifications:', error);
      }
    }, (error) => {
      console.error('❌ Error in global notifications subscription:', error);
    });

    // Return combined unsubscribe function
    return () => {
      if (unsubscribeUser) unsubscribeUser();
      if (unsubscribeGlobal) unsubscribeGlobal();
    };

  } catch (error) {
    console.error('❌ Error setting up notification subscriptions:', error);
    callback([]);
    return () => {}; // Return empty unsubscribe function
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<void> => {
  try {
    const notificationRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
    await updateDoc(notificationRef, {
      isRead: true
    });
    console.log('✅ Notification marked as read:', notificationId);
  } catch (error) {
    console.error('❌ Error marking notification as read:', error);
    throw error;
  }
};

// Get unread notification count for user
export const getUnreadNotificationCount = async (userId?: string): Promise<number> => {
  try {
    let q;
    if (userId) {
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', 'in', [userId, null]),
        where('isRead', '==', false)
      );
    } else {
      q = query(
        collection(db, NOTIFICATIONS_COLLECTION),
        where('userId', '==', null),
        where('isRead', '==', false)
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.size;
  } catch (error) {
    console.error('❌ Error getting unread notification count:', error);
    return 0;
  }
};

// Send browser notification if permission is granted
export const sendBrowserNotification = (notification: Notification): void => {
  if ('Notification' in window && Notification.permission === 'granted') {
    const browserNotification = new Notification(notification.title, {
      body: notification.message,
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: notification.id,
      requireInteraction: notification.priority === 'high',
      silent: notification.priority === 'low'
    });

    // Handle notification click
    browserNotification.onclick = () => {
      window.focus();
      if (notification.actionUrl) {
        window.location.href = notification.actionUrl;
      }
      browserNotification.close();
    };

    // Auto close after 5 seconds for low priority notifications
    if (notification.priority === 'low') {
      setTimeout(() => {
        browserNotification.close();
      }, 5000);
    }
  }
};

// Request notification permission
export const requestNotificationPermission = async (): Promise<boolean> => {
  if (!('Notification' in window)) {
    console.log('❌ This browser does not support notifications');
    return false;
  }

  if (Notification.permission === 'granted') {
    return true;
  }

  if (Notification.permission !== 'denied') {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }

  return false;
};

// Initialize notification system for user
export const initializeNotificationSystem = async (userId: string): Promise<() => void> => {
  // Request permission for browser notifications
  await requestNotificationPermission();

  // Subscribe to real-time notifications
  const unsubscribe = subscribeToNotifications(userId, (notifications) => {
    // Send browser notification for new unread notifications
    notifications
      .filter(notification => !notification.isRead)
      .slice(0, 3) // Only show latest 3 notifications
      .forEach(notification => {
        sendBrowserNotification(notification);
      });
  });

  return unsubscribe;
};

// Bulk notification system for tech events
export const notifyAllUsersAboutTechEvent = async (techEvent: TechEvent): Promise<{
  success: boolean;
  notificationId?: string;
  error?: string;
}> => {
  try {
    console.log('📢 Creating notification for tech event:', techEvent.title);
    
    const notificationId = await createTechEventNotification(techEvent);
    
    // Also send browser notifications to currently active users
    if ('Notification' in window && Notification.permission === 'granted') {
      const title = `New ${techEvent.type.charAt(0).toUpperCase() + techEvent.type.slice(1)}!`;
      const body = `${techEvent.title} - ${techEvent.date.toLocaleDateString()} at ${techEvent.venue}`;
      
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        badge: '/favicon.ico',
        requireInteraction: techEvent.priority === 'high'
      });
    }

    console.log('✅ Successfully notified all users about tech event');
    return {
      success: true,
      notificationId
    };
  } catch (error) {
    console.error('❌ Error notifying users about tech event:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Get recent notifications for dashboard display
export const getRecentNotifications = async (userId?: string, limit: number = 5): Promise<Notification[]> => {
  try {
    const notifications = await getNotificationsForUser(userId);
    return notifications.slice(0, limit);
  } catch (error) {
    console.error('❌ Error getting recent notifications:', error);
    return [];
  }
};
