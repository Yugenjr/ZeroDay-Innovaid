import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  getDoc,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from './config';

// Tech Update Types
export interface TechUpdate {
  id: string;
  title: string;
  content: string;
  summary: string; // Brief summary for notifications
  category: 'announcement' | 'feature' | 'maintenance' | 'security' | 'bug-fix' | 'general';
  priority: 'low' | 'medium' | 'high' | 'critical';
  targetAudience: 'all' | 'students' | 'faculty' | 'admin';
  isActive: boolean;
  isPinned: boolean;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string | null;
  attachments?: TechUpdateAttachment[];
  tags: string[];
  readBy: string[]; // User IDs who have read this update
  totalReads: number;
  scheduledFor?: string | null; // For scheduled updates
}

export interface TechUpdateAttachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'document' | 'link';
  size?: number;
}

export interface UserNotification {
  id: string;
  userId: string;
  updateId: string;
  title: string;
  summary: string;
  category: string;
  priority: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string | null;
}

// Email notifications removed - using in-app notifications only

// Firebase Collections
const TECH_UPDATES_COLLECTION = 'techUpdates';
const USER_NOTIFICATIONS_COLLECTION = 'userNotifications';

// Test Firebase connection for tech updates
export const testTechUpdatesConnection = async (): Promise<{ success: boolean; message: string }> => {
  try {
    console.log('🔍 Testing Tech Updates Firebase connection...');
    const q = query(collection(db, TECH_UPDATES_COLLECTION));
    const snapshot = await getDocs(q);
    console.log('📊 Tech Updates query executed successfully, docs count:', snapshot.size);
    
    return {
      success: true,
      message: `Tech Updates Firebase connection successful - found ${snapshot.size} documents`
    };
  } catch (error) {
    console.error('❌ Tech Updates Firebase connection error:', error);
    return {
      success: false,
      message: `Tech Updates Firebase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Create a new tech update
export const createTechUpdate = async (updateData: Omit<TechUpdate, 'id' | 'createdAt' | 'updatedAt' | 'totalReads' | 'readBy'>): Promise<{ success: boolean; message: string; updateId?: string }> => {
  try {
    console.log('📝 Creating new tech update:', updateData.title);
    
    const techUpdate: Omit<TechUpdate, 'id'> = {
      ...updateData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      totalReads: 0,
      readBy: []
    };

    console.log('📝 Tech update data prepared:', techUpdate);
    
    const docRef = await addDoc(collection(db, TECH_UPDATES_COLLECTION), techUpdate);
    console.log('✅ Tech update created with ID:', docRef.id);
    
    // Create notifications for users if the update is active
    if (techUpdate.isActive) {
      await createNotificationsForUpdate(docRef.id, techUpdate);
    }
    
    return {
      success: true,
      message: 'Tech update created successfully!',
      updateId: docRef.id
    };
  } catch (error) {
    console.error('❌ Error creating tech update:', error);
    return {
      success: false,
      message: `Failed to create tech update: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get all tech updates (admin)
export const getAllTechUpdates = async (): Promise<{ success: boolean; updates: TechUpdate[]; message?: string }> => {
  try {
    console.log('🔍 Fetching all tech updates...');
    
    const testResult = await testTechUpdatesConnection();
    if (!testResult.success) {
      return {
        success: false,
        updates: [],
        message: testResult.message
      };
    }
    
    const q = query(collection(db, TECH_UPDATES_COLLECTION), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    const updates: TechUpdate[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const update: TechUpdate = {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          summary: data.summary || '',
          category: data.category || 'general',
          priority: data.priority || 'medium',
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          isPinned: data.isPinned || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          expiresAt: data.expiresAt || null,
          attachments: data.attachments || [],
          tags: data.tags || [],
          readBy: data.readBy || [],
          totalReads: data.totalReads || 0,
          scheduledFor: data.scheduledFor || null
        };
        updates.push(update);
        console.log(`📊 Loaded tech update: ${update.title}`);
      } catch (error) {
        console.error(`❌ Error processing tech update document ${doc.id}:`, error);
      }
    });

    console.log(`✅ Successfully loaded ${updates.length} tech updates`);
    return {
      success: true,
      updates
    };
  } catch (error) {
    console.error('❌ Error fetching tech updates:', error);
    return {
      success: false,
      updates: [],
      message: `Failed to fetch tech updates: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get active tech updates for users
export const getActiveTechUpdates = async (userRole?: string): Promise<{ success: boolean; updates: TechUpdate[]; message?: string }> => {
  try {
    console.log('🔍 Fetching active tech updates for user role:', userRole);
    
    const testResult = await testTechUpdatesConnection();
    if (!testResult.success) {
      return {
        success: false,
        updates: [],
        message: testResult.message
      };
    }
    
    const q = query(
      collection(db, TECH_UPDATES_COLLECTION),
      where('isActive', '==', true),
      orderBy('isPinned', 'desc'),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    
    const updates: TechUpdate[] = [];
    const now = new Date();
    
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const update: TechUpdate = {
          id: doc.id,
          title: data.title || '',
          content: data.content || '',
          summary: data.summary || '',
          category: data.category || 'general',
          priority: data.priority || 'medium',
          targetAudience: data.targetAudience || 'all',
          isActive: data.isActive || false,
          isPinned: data.isPinned || false,
          createdBy: data.createdBy || '',
          createdByName: data.createdByName || '',
          createdAt: data.createdAt || new Date().toISOString(),
          updatedAt: data.updatedAt || new Date().toISOString(),
          expiresAt: data.expiresAt || null,
          attachments: data.attachments || [],
          tags: data.tags || [],
          readBy: data.readBy || [],
          totalReads: data.totalReads || 0,
          scheduledFor: data.scheduledFor || null
        };
        
        // Check if update hasn't expired
        if (!update.expiresAt || new Date(update.expiresAt) > now) {
          // Check target audience
          if (update.targetAudience === 'all' ||
              (userRole === 'student' && update.targetAudience === 'students') ||
              (userRole === 'admin' && update.targetAudience === 'admin') ||
              (userRole === 'faculty' && update.targetAudience === 'faculty')) {
            updates.push(update);
            console.log(`📊 Loaded active tech update: ${update.title}`);
          }
        } else {
          console.log(`⏰ Skipped expired tech update: ${update.title}`);
        }
      } catch (error) {
        console.error(`❌ Error processing active tech update document ${doc.id}:`, error);
      }
    });

    console.log(`✅ Successfully loaded ${updates.length} active tech updates`);
    return {
      success: true,
      updates
    };
  } catch (error) {
    console.error('❌ Error fetching active tech updates:', error);
    return {
      success: false,
      updates: [],
      message: `Failed to fetch active tech updates: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Helper function to create notifications for users
const createNotificationsForUpdate = async (updateId: string, update: Omit<TechUpdate, 'id'>) => {
  try {
    console.log('📢 Creating notifications for tech update:', update.title);
    
    // This would typically fetch all users based on target audience
    // For now, we'll create a placeholder that can be expanded
    const notification: Omit<UserNotification, 'id' | 'userId'> = {
      updateId,
      title: update.title,
      summary: update.summary,
      category: update.category,
      priority: update.priority,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    // In a real implementation, you would:
    // 1. Fetch all users based on targetAudience
    // 2. Create individual notifications for each user
    // 3. Send email notifications if enabled
    
    console.log('📢 Notification template created for update:', updateId);
  } catch (error) {
    console.error('❌ Error creating notifications:', error);
  }
};

// Update tech update status
export const updateTechUpdateStatus = async (updateId: string, isActive: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    await updateDoc(doc(db, TECH_UPDATES_COLLECTION, updateId), {
      isActive,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Tech update ${isActive ? 'activated' : 'deactivated'} successfully!`
    };
  } catch (error) {
    console.error('Error updating tech update status:', error);
    return {
      success: false,
      message: 'Failed to update tech update status'
    };
  }
};

// Pin/Unpin tech update
export const toggleTechUpdatePin = async (updateId: string, isPinned: boolean): Promise<{ success: boolean; message: string }> => {
  try {
    await updateDoc(doc(db, TECH_UPDATES_COLLECTION, updateId), {
      isPinned,
      updatedAt: new Date().toISOString()
    });

    return {
      success: true,
      message: `Tech update ${isPinned ? 'pinned' : 'unpinned'} successfully!`
    };
  } catch (error) {
    console.error('Error toggling tech update pin:', error);
    return {
      success: false,
      message: 'Failed to update tech update pin status'
    };
  }
};

// Delete tech update
export const deleteTechUpdate = async (updateId: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Delete all notifications for this update first
    const notificationsQuery = query(collection(db, USER_NOTIFICATIONS_COLLECTION), where('updateId', '==', updateId));
    const notificationsSnapshot = await getDocs(notificationsQuery);

    const deleteNotificationPromises = notificationsSnapshot.docs.map(notificationDoc => deleteDoc(notificationDoc.ref));
    await Promise.all(deleteNotificationPromises);

    // Delete the tech update
    await deleteDoc(doc(db, TECH_UPDATES_COLLECTION, updateId));

    return {
      success: true,
      message: 'Tech update deleted successfully!'
    };
  } catch (error) {
    console.error('Error deleting tech update:', error);
    return {
      success: false,
      message: 'Failed to delete tech update'
    };
  }
};

// Mark tech update as read by user
export const markTechUpdateAsRead = async (updateId: string, userId: string): Promise<{ success: boolean; message: string }> => {
  try {
    const updateRef = doc(db, TECH_UPDATES_COLLECTION, updateId);
    const updateDocSnapshot = await getDoc(updateRef);

    if (!updateDocSnapshot.exists()) {
      return {
        success: false,
        message: 'Tech update not found'
      };
    }

    const updateData = updateDocSnapshot.data() as TechUpdate;

    // Check if user hasn't already read this update
    if (!updateData.readBy.includes(userId)) {
      await updateDoc(updateRef, {
        readBy: [...updateData.readBy, userId],
        totalReads: updateData.totalReads + 1,
        updatedAt: new Date().toISOString()
      });

      // Mark user notification as read
      const notificationQuery = query(
        collection(db, USER_NOTIFICATIONS_COLLECTION),
        where('updateId', '==', updateId),
        where('userId', '==', userId)
      );
      const notificationSnapshot = await getDocs(notificationQuery);

      if (!notificationSnapshot.empty) {
        const notificationDocRef = notificationSnapshot.docs[0];
        await updateDoc(notificationDocRef.ref, {
          isRead: true,
          readAt: new Date().toISOString()
        });
      }
    }

    return {
      success: true,
      message: 'Tech update marked as read'
    };
  } catch (error) {
    console.error('Error marking tech update as read:', error);
    return {
      success: false,
      message: 'Failed to mark tech update as read'
    };
  }
};

// Get user notifications
export const getUserNotifications = async (userId: string, limit_count: number = 20): Promise<{ success: boolean; notifications: UserNotification[]; message?: string }> => {
  try {
    const q = query(
      collection(db, USER_NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc'),
      limit(limit_count)
    );

    const querySnapshot = await getDocs(q);

    const notifications: UserNotification[] = [];
    querySnapshot.forEach((doc) => {
      try {
        const data = doc.data();
        const notification: UserNotification = {
          id: doc.id,
          userId: data.userId || userId,
          updateId: data.updateId || '',
          title: data.title || '',
          summary: data.summary || '',
          category: data.category || 'general',
          priority: data.priority || 'medium',
          isRead: data.isRead || false,
          createdAt: data.createdAt || new Date().toISOString(),
          readAt: data.readAt || null
        };
        notifications.push(notification);
      } catch (error) {
        console.error(`❌ Error processing notification document ${doc.id}:`, error);
      }
    });

    return {
      success: true,
      notifications
    };
  } catch (error) {
    console.error('❌ Error fetching user notifications:', error);
    return {
      success: false,
      notifications: [],
      message: `Failed to fetch notifications: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string): Promise<{ success: boolean; count: number; message?: string }> => {
  try {
    const q = query(
      collection(db, USER_NOTIFICATIONS_COLLECTION),
      where('userId', '==', userId),
      where('isRead', '==', false)
    );

    const querySnapshot = await getDocs(q);

    return {
      success: true,
      count: querySnapshot.size
    };
  } catch (error) {
    console.error('❌ Error fetching unread notifications count:', error);
    return {
      success: false,
      count: 0,
      message: `Failed to fetch unread count: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
};

// Create notification for specific user
export const createUserNotification = async (userId: string, updateId: string, update: TechUpdate): Promise<{ success: boolean; message: string }> => {
  try {
    const notification: Omit<UserNotification, 'id'> = {
      userId,
      updateId,
      title: update.title,
      summary: update.summary,
      category: update.category,
      priority: update.priority,
      isRead: false,
      createdAt: new Date().toISOString()
    };

    await addDoc(collection(db, USER_NOTIFICATIONS_COLLECTION), notification);

    return {
      success: true,
      message: 'Notification created successfully'
    };
  } catch (error) {
    console.error('Error creating user notification:', error);
    return {
      success: false,
      message: 'Failed to create notification'
    };
  }
};
